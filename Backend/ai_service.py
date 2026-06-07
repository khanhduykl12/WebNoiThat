"""
AI Service — YOLOv8 Custom Object Detection + Vision Transformer Embedding + FAISS Vector Search
NoiThatXin E-Commerce

Model: runs/detect/furniture_local-4/weights/best.pt
Classes (19): TV, ban, bon_cau, bon_rua_tay, bon_tam, cua_so, den, ghe, giuong,
               guong, lo_vi_song, may_giat, may_lanh, sofa, tham, tranh_treo_tuong,
               tu_lanh, tu_quan_ao, voi_sen
"""

import os
import io
import json
import time
import base64
import uuid
import numpy as np
from PIL import Image
from datetime import datetime

import torch
import torch.nn.functional as F
import faiss
import pickle
import logging

from config import Config

logger = logging.getLogger(__name__)


class AIService:
    """Singleton AI Service — khởi tạo 1 lần, dùng chung toàn app"""

    _instance = None
    _initialized = False

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        self.device = torch.device(
            'cuda' if torch.cuda.is_available() else 'cpu'
        )
        logger.info(f"AI Service init on device: {self.device}")

        self.yolo_conf = Config.YOLO_CONFIDENCE
        self.top_k = Config.AI_TOP_K
        self.embedding_dim = Config.EMBEDDING_DIM

        # Load class names từ .env
        self._init_class_names()

        # Load YOLOv8 custom model
        self._load_yolo()

        # Load Vision Transformer
        self._load_vit()

        # Load / build FAISS index
        self._init_vector_index()

    # ─── Class Names ─────────────────────────────────────────────────────────

    def _init_class_names(self):
        """Load class names từ config (19 class nội thất tùy chỉnh)"""
        raw = Config.YOLO_CLASS_NAMES
        if isinstance(raw, str):
            try:
                self.class_names = json.loads(raw)
            except Exception:
                # Fallback hardcoded
                self.class_names = [
                    "TV", "ban", "bon_cau", "bon_rua_tay", "bon_tam", "cua_so",
                    "den", "ghe", "giuong", "guong", "lo_vi_song", "may_giat",
                    "may_lanh", "sofa", "tham", "tranh_treo_tuong", "tu_lanh",
                    "tu_quan_ao", "voi_sen"
                ]
        else:
            self.class_names = raw or []

        # Index → class name map
        self.class_idx_to_name = {i: name for i, name in enumerate(self.class_names)}
        logger.info(f"YOLO classes loaded: {len(self.class_names)} classes")
        for i, n in enumerate(self.class_names):
            logger.info(f"  [{i}] {n}")

    # ─── YOLO ─────────────────────────────────────────────────────────────────

    def _load_yolo(self):
        """Load YOLOv8 custom model (19 class nội thất)"""
        model_path = Config.YOLO_MODEL_PATH

        # Resolve relative path từ Backend folder
        if not os.path.isabs(model_path):
            model_path = os.path.join(os.path.dirname(__file__), model_path)

        try:
            from ultralytics import YOLO

            if os.path.exists(model_path):
                self.yolo = YOLO(model_path)
                logger.info(f"YOLO custom model loaded: {model_path}")
            else:
                # Fallback về COCO nếu custom model chưa có
                self.yolo = YOLO("yolov8n.pt")
                logger.warning(
                    f"Custom model not found at '{model_path}', "
                    f"falling back to yolov8n.pt (COCO). "
                    f"Train model first: yolo train model=yolov8n.pt ..."
                )

            self.yolo.to(self.device)
            logger.info(f"YOLO model ready on device: {self.device}")
        except Exception as e:
            logger.error(f"Khong load duoc YOLO: {e}")
            self.yolo = None

    def _normalize_image_bytes(self, image_bytes: bytes) -> bytes:
        """Convert image to standard JPEG bytes — fix 'Unsupported image type' error"""
        try:
            img = Image.open(io.BytesIO(image_bytes))
            img_format = img.format
            if img.mode in ('RGBA', 'P', 'LA', 'RGBA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            buf = io.BytesIO()
            img.save(buf, format='JPEG', quality=95)
            normalized = buf.getvalue()
            logger.info(f"Image normalized: {img_format} ({len(image_bytes)} bytes) -> JPEG ({len(normalized)} bytes)")
            return normalized
        except Exception as e:
            logger.error(f"Normalize failed: {e}")
            return image_bytes

    def detect_furniture(self, image_bytes: bytes, conf_threshold: float = None) -> list:
        """
        Phát hiện đồ nội thất trong ảnh bằng YOLOv8 custom model (19 class).
        Trả về list detections [{label, confidence, bbox, class_idx}, ...]
        """
        if self.yolo is None:
            return []

        if conf_threshold is None:
            conf_threshold = self.yolo_conf

        # Lưu normalized ảnh ra file tạm → pass file path cho YOLO
        # (YOLO xử lý file path reliable hơn raw bytes)
        temp_path = None
        try:
            normalized = self._normalize_image_bytes(image_bytes)
            temp_path = os.path.join(Config.UPLOAD_FOLDER, f'yolo_temp_{uuid.uuid4().hex[:8]}.jpg')
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)
            with open(temp_path, 'wb') as f:
                f.write(normalized)

            results = self.yolo.predict(
                source=temp_path,
                conf=conf_threshold,
                verbose=False
            )

            detections = []
            for r in results:
                if r.boxes is None:
                    continue
                for box in r.boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    if hasattr(self.yolo, 'names') and self.yolo.names:
                        label = self.yolo.names.get(cls_id, f"class_{cls_id}")
                    else:
                        label = self.class_idx_to_name.get(cls_id, f"class_{cls_id}")

                    detections.append({
                        'class_idx': cls_id,
                        'label': label,
                        'confidence': round(conf, 4),
                        'bbox': [round(x, 1) for x in box.xyxy[0].cpu().numpy().tolist()],
                    })
            return detections

        except Exception as e:
            logger.error(f"Loi detect_furniture: {e}")
            import traceback
            traceback.print_exc()
            return []
        finally:
            # Dọn file tạm
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass

    # ─── Vision Transformer ────────────────────────────────────────────────────

    def _load_vit(self):
        """Load Vision Transformer (ViT-Small) — use timm exclusively for consistency"""
        try:
            import timm
            self.vit = timm.create_model(
                Config.VIT_MODEL or 'vit_small_patch16_224',
                pretrained=True,
                num_classes=0  # CRITICAL: strips classification head -> 384-dim output
            )
            self.vit.eval()
            self.vit.to(self.device)
            
            # Store normalization params for ImageNet
            self._vit_mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1).to(self.device)
            self._vit_std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1).to(self.device)
            
            logger.info(f"Vision Transformer (timm) loaded: {Config.VIT_MODEL or 'vit_small_patch16_224'}")
        except Exception as e:
            logger.error(f"Failed to load ViT via timm: {e}")
            self.vit = None

    def extract_embedding(self, image_bytes: bytes) -> list:
        """
        Trích xuất vector đặc trưng (embedding) từ Vision Transformer.
        """
        if self.vit is None:
            logger.warning("ViT chua duoc load, tra ve vector 0")
            return [0.0] * self.embedding_dim

        try:
            # Normalize ảnh -> JPEG (fix Unsupported image type)
            normalized_bytes = self._normalize_image_bytes(image_bytes)
            return self._extract_embedding_from_normalized(normalized_bytes)
        except Exception as e:
            logger.error(f"extract_embedding error: {e}")
            return [0.0] * self.embedding_dim

    def _extract_embedding_from_normalized(self, normalized_bytes: bytes) -> list:
        """Helper thực hiện trích xuất embedding từ ảnh đã normalize"""
        try:
            img = Image.open(io.BytesIO(normalized_bytes)).convert('RGB')
            img = img.resize((224, 224))

            arr = np.array(img).astype(np.float32) / 255.0
            tensor = torch.from_numpy(arr).permute(2, 0, 1).unsqueeze(0).to(self.device)

            # Apply ImageNet normalization (CRITICAL FIX)
            tensor = (tensor - self._vit_mean) / self._vit_std

            with torch.no_grad():
                embedding = self.vit(tensor)

            # L2 normalize (quan trọng cho cosine similarity)
            embedding = F.normalize(embedding, p=2, dim=1)
            return embedding.cpu().numpy().flatten().tolist()
        except Exception as e:
            logger.error(f"_extract_embedding_from_normalized error: {e}")
            return [0.0] * self.embedding_dim

    def extract_embedding_from_crop(self, image_bytes: bytes, bbox: list) -> list:
        """Cắt vùng bbox từ ảnh rồi trích xuất embedding (fix double normalization)"""
        try:
            # Normalize ảnh gốc trước
            image_bytes = self._normalize_image_bytes(image_bytes)
            img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            x1, y1, x2, y2 = map(int, bbox)
            
            # Crop
            cropped = img.crop((x1, y1, x2, y2))
            buf = io.BytesIO()
            cropped.save(buf, format='JPEG')
            
            # Dùng helper để tránh normalize lần nữa
            return self._extract_embedding_from_normalized(buf.getvalue())
        except Exception as e:
            logger.error(f"extract_embedding_from_crop error: {e}")
            return self.extract_embedding(image_bytes)

    # ─── FAISS Vector Index ───────────────────────────────────────────────────

    def _init_vector_index(self):
        """Khởi tạo hoặc load FAISS index"""
        self.index_dir = os.path.join(os.path.dirname(__file__), 'models_ai')
        os.makedirs(self.index_dir, exist_ok=True)

        self.index_path = os.path.join(self.index_dir, 'product_vectors.index')
        self.meta_path = os.path.join(self.index_dir, 'vector_meta.pkl')

        try:
            self.index = faiss.read_index(self.index_path)
            # Validate dimension (CRITICAL FIX)
            if self.index.d != self.embedding_dim:
                logger.error(f"FAISS index dim ({self.index.d}) != configured dim ({self.embedding_dim}). Index is stale.")
                self.index = None
                return

            with open(self.meta_path, 'rb') as f:
                meta = pickle.load(f)
                self.product_ids = meta['ids']
                self.yolo_labels = meta.get('yolo_labels', [])
            logger.info(f"FAISS index loaded: {self.index.ntotal} vectors, dim={self.index.d}")
        except Exception:
            self.index = None
            self.product_ids = []
            self.yolo_labels = []
            logger.warning(
                "FAISS index chua co. "
                "Chạy: python generate_embeddings.py --rebuild"
            )

    def build_index(self, products_with_embeddings: list):
        """
        Build FAISS index từ list sản phẩm có sẵn embedding.

        products_with_embeddings = [
            {"product_id": 1, "embedding": [...], "yolo_label": "sofa"},
            ...
        ]
        """
        if not products_with_embeddings:
            logger.warning("Khong co san pham de build index")
            return

        embeddings = np.array(
            [p['embedding'] for p in products_with_embeddings],
            dtype='float32'
        )

        # L2 normalize
        faiss.normalize_L2(embeddings)

        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(embeddings)

        self.product_ids = [p['product_id'] for p in products_with_embeddings]
        self.yolo_labels = [p.get('yolo_label', '') for p in products_with_embeddings]

        # Lưu
        faiss.write_index(self.index, self.index_path)
        with open(self.meta_path, 'wb') as f:
            pickle.dump({
                'ids': self.product_ids,
                'yolo_labels': self.yolo_labels,
                'built_at': datetime.now().isoformat()
            }, f)

        logger.info(f"FAISS index built: {self.index.ntotal} vectors, dim={dim}")

    def search_similar(
        self,
        query_vector: list,
        top_k: int = None,
        yolo_label: str = None
    ) -> list:
        """
        Tìm kiếm sản phẩm tương tự bằng cosine similarity qua FAISS.
        Cải thiện: Tìm kiếm 2 giai đoạn (có filter label -> không filter label nếu thiếu).
        """
        if self.index is None or self.index.ntotal == 0:
            logger.warning("FAISS index rong — can build index first")
            return []

        if top_k is None:
            top_k = self.top_k

        q = np.array([query_vector], dtype='float32')
        faiss.normalize_L2(q)

        # Giai đoạn 1: Tìm kiếm rộng hơn để có đủ mẫu lọc
        search_k = min(top_k * 5, self.index.ntotal)
        distances, indices = self.index.search(q, search_k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1 or idx >= len(self.product_ids):
                continue
            
            results.append({
                'product_id': self.product_ids[idx],
                'similarity': round(float(dist), 4),
                'yolo_label': self.yolo_labels[idx] if idx < len(self.yolo_labels) else '',
            })

        # Bước lọc: Ưu tiên nhãn YOLO trùng khớp
        filtered = []
        if yolo_label:
            filtered = [r for r in results if r['yolo_label'] == yolo_label]
            logger.info(f"Filtered results for label '{yolo_label}': {len(filtered)} items")

        # Giai đoạn 2: Nếu kết quả lọc quá ít, bổ sung từ kết quả chưa lọc
        if len(filtered) < top_k:
            seen_ids = {r['product_id'] for r in filtered}
            for r in results:
                if r['product_id'] not in seen_ids:
                    filtered.append(r)
                if len(filtered) >= top_k:
                    break
        
        return filtered[:top_k]

    # ─── Main Search Pipeline ──────────────────────────────────────────────────

    def search_by_image(
        self,
        image_bytes: bytes,
        conf_threshold: float = None,
        top_k: int = None
    ) -> dict:
        """
        Pipeline tìm kiếm hoàn chỉnh:
        1. YOLOv8 custom phát hiện bbox (19 class nội thất)
        2. ViT trích xuất embedding từ vùng detected
        3. FAISS tìm Top-K sản phẩm tương tự

        Returns:
            {
                "detections": [...],
                "query_vector": [...],
                "similar_products": [...],
                "processing_time": {...}
            }
        """
        t0 = time.time()
        print(f"[AI] search_by_image called, image_bytes len={len(image_bytes)}", flush=True)

        # 1. YOLOv8 detect
        t_yolo = time.time()
        detections = self.detect_furniture(image_bytes, conf_threshold)
        t_yolo_ms = round((time.time() - t_yolo) * 1000, 1)
        print(f"[AI] YOLO detected {len(detections)} objects", flush=True)

        # 2. Trích xuất embedding
        t_vit = time.time()
        if detections:
            best = max(detections, key=lambda x: x['confidence'])
            query_vector = self.extract_embedding_from_crop(image_bytes, best['bbox'])
            top_label = best['label']
        else:
            query_vector = self.extract_embedding(image_bytes)
            top_label = None
        t_vit_ms = round((time.time() - t_vit) * 1000, 1)

        # 3. FAISS search
        t_faiss = time.time()
        similar = self.search_similar(
            query_vector,
            top_k=top_k,
            yolo_label=top_label
        )
        t_faiss_ms = round((time.time() - t_faiss) * 1000, 1)

        return {
            'detections': detections,
            'query_vector': query_vector,
            'similar_products': similar,
            'top_label': top_label,
            'processing_time': {
                'yolo_ms': t_yolo_ms,
                'vit_ms': t_vit_ms,
                'faiss_ms': t_faiss_ms,
                'total_ms': round((time.time() - t0) * 1000, 1),
            }
        }


# ─── Global singleton instance ────────────────────────────────────────────────
_ai_service_instance = None


def get_ai_service() -> AIService:
    global _ai_service_instance
    if _ai_service_instance is None:
        _ai_service_instance = AIService()
    return _ai_service_instance
