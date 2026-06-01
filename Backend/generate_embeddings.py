"""
Generate Embeddings + Auto-Label YOLO — Trích xuất vector & nhãn cho toàn bộ sản phẩm trong DB,
build FAISS index để phục vụ tìm kiếm tương tự.

Dùng model YOLOv8 custom (runs/detect/furniture_local-4/weights/best.pt)
với 19 class nội thất.

Cách dùng:
    python generate_embeddings.py              # Generate ALL sản phẩm (vector + YOLO label)
    python generate_embeddings.py --maSP 1      # Generate 1 sản phẩm
    python generate_embeddings.py --rebuild     # Xóa vector cũ, generate lại tất cả
    python generate_embeddings.py --status      # Xem trạng thái embeddings
    python generate_embeddings.py --build-index # Chỉ build FAISS index thôi
    python generate_embeddings.py --label-only  # Chỉ chạy YOLO auto-label (không embed)
"""

import argparse
import os
import sys
import io
import json
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PIL import Image
import numpy as np
import torch
import torch.nn.functional as F

from app import create_app
from extensions import db
from models import SanPham
from ai_service import AIService, get_ai_service
from config import Config


BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def resolve_image_path(relative_path: str) -> str:
    """Chuyển đường dẫn tương đối (trong DB) → đường dẫn tuyệt đối"""
    if not relative_path:
        return None

    if os.path.isabs(relative_path):
        path = relative_path
    else:
        path = os.path.join(BASE_PATH, relative_path)

    candidates = [
        path,
        path.replace('\\', '/'),
        os.path.join(BASE_PATH, relative_path.replace('\\', '/')),
        os.path.join(BASE_PATH, '..', relative_path.replace('\\', '/')),
    ]

    for cand in candidates:
        if os.path.exists(cand):
            return cand
    return None


def load_image_bytes(image_path: str) -> bytes:
    """Đọc ảnh từ đường dẫn, trả về bytes"""
    full_path = resolve_image_path(image_path)
    if not full_path:
        return None
    try:
        with open(full_path, 'rb') as f:
            return f.read()
    except Exception:
        return None


def detect_yolo_label(image_bytes: bytes, ai_service: AIService) -> tuple:
    """
    Dùng YOLO custom model để detect class của ảnh sản phẩm.
    Trả về (yolo_label, confidence) hoặc (None, 0) nếu không detect được.
    """
    if not image_bytes:
        return None, 0.0

    detections = ai_service.detect_furniture(image_bytes, conf_threshold=0.25)
    if not detections:
        return None, 0.0

    # Lấy detection có confidence cao nhất
    best = max(detections, key=lambda x: x['confidence'])
    return best['label'], best['confidence']


def extract_embedding(image_bytes: bytes, ai_service: AIService) -> list:
    """Trích xuất embedding từ ảnh bytes"""
    if not image_bytes:
        return None
    return ai_service.extract_embedding(image_bytes)


def generate_all_embeddings(ai_service: AIService, batch_size: int = 10, rebuild: bool = False, label_only: bool = False):
    """
    Generate embeddings + YOLO labels cho tất cả sản phẩm.
    Nếu label_only=True → chỉ chạy YOLO auto-label, không embed.
    """
    query = SanPham.query.filter(SanPham.TrangThai == 'active')

    if not rebuild:
        if label_only:
            # --label-only không rebuild: chỉ label sản phẩm chưa có nhãn
            query = query.filter(
                db.or_(
                    SanPham.YOLOLabel.is_(None),
                    SanPham.YOLOLabel == ''
                )
            )
        else:
            # Chưa có embedding HOẶC chưa có YOLO label
            query = query.filter(
                db.or_(
                    SanPham.EmbeddingVector.is_(None),
                    SanPham.EmbeddingVector == '',
                    db.and_(
                        SanPham.YOLOLabel.is_(None),
                        SanPham.YOLOLabel == ''
                    )
                )
            )

    products = query.all()
    total = len(products)

    print(f"\n{'='*60}")
    print(f"  GENERATE EMBEDDINGS + YOLO LABELS")
    print(f"  {datetime.now().strftime('%H:%M:%S')}")
    print(f"  Mode: {'LABEL ONLY' if label_only else 'FULL (label + embedding)'}")
    print(f"  Rebuild: {'CÓ' if rebuild else 'KHÔNG'}")
    print(f"  Tổng sản phẩm cần xử lý: {total}")
    print(f"{'='*60}\n")

    if total == 0:
        print("  Không có sản phẩm nào cần xử lý.")
        # Vẫn build index nếu có data
        if not label_only:
            build_faiss_index(ai_service)
        return

    success_label = 0
    success_embed = 0
    error_count = 0
    skipped = 0
    batch_data = []

    for i, sp in enumerate(products, 1):
        image_path = sp.HinhAnh
        if not image_path:
            for field in [sp.HinhAnhPhu1, sp.HinhAnhPhu2, sp.HinhAnhPhu3, sp.HinhAnhPhu4]:
                if field:
                    image_path = field
                    break

        if not image_path:
            print(f"  [{i}/{total}] SKIP MaSP={sp.MaSP} — không có ảnh")
            skipped += 1
            continue

        image_bytes = load_image_bytes(image_path)
        if not image_bytes:
            print(f"  [{i}/{total}] ERROR MaSP={sp.MaSP} — không đọc được ảnh: {image_path}")
            error_count += 1
            continue

        # 1) YOLO auto-label
        yolo_label, yolo_conf = detect_yolo_label(image_bytes, ai_service)
        sp.YOLOLabel = yolo_label
        sp.YOLOConfidence = yolo_conf
        if yolo_label:
            success_label += 1

        label_str = f"{yolo_label} ({yolo_conf:.2f})" if yolo_label else "No detection"

        if label_only:
            # Chỉ label, không embed
            print(f"  [{i}/{total}] LABEL MaSP={sp.MaSP:3d} | {sp.TenSP[:35]:<35} | {label_str}")
            db.session.commit()
            continue

        # 2) Embedding
        embedding = extract_embedding(image_bytes, ai_service)
        if embedding is None:
            print(f"  [{i}/{total}] ERROR MaSP={sp.MaSP} — embedding thất bại")
            error_count += 1
            db.session.rollback()
            continue

        sp.EmbeddingVector = json.dumps(embedding)
        success_embed += 1

        batch_data.append({
            'product_id': sp.MaSP,
            'embedding': embedding,
            'yolo_label': yolo_label or '',
            'tenSP': sp.TenSP,
        })

        print(f"  [{i}/{total}] OK    MaSP={sp.MaSP:3d} | {sp.TenSP[:35]:<35} | {label_str} | vec={len(embedding)}d")

        # Commit từng batch
        if len(batch_data) >= batch_size:
            db.session.commit()
            print(f"           >>> Commit batch {len(batch_data)} items\n")

    # Commit batch cuối
    if not label_only and batch_data:
        try:
            db.session.commit()
            print(f"\n  >>> Commit batch cuối {len(batch_data)} items")
        except Exception as e:
            print(f"\n  LỖI commit batch cuối: {e}")
            db.session.rollback()

    print(f"\n{'='*60}")
    print(f"  KẾT QUẢ:")
    print(f"    Label thành công: {success_label}")
    print(f"    Embedding thành công: {success_embed}")
    print(f"    Lỗi:       {error_count}")
    print(f"    Bỏ qua:    {skipped}")
    print(f"  Tổng:       {total}")
    print(f"{'='*60}")

    # Build FAISS index
    if not label_only and batch_data:
        print(f"\n  Building FAISS index...")
        build_faiss_index(ai_service, batch_data)
        print(f"  Xong!")


def generate_single_embedding(ma_sp: int, ai_service: AIService):
    """Generate embedding + label cho 1 sản phẩm"""
    sp = SanPham.query.get(ma_sp)
    if not sp:
        print(f"Không tìm thấy sản phẩm MaSP={ma_sp}")
        return

    image_path = sp.HinhAnh
    if not image_path:
        for field in [sp.HinhAnhPhu1, sp.HinhAnhPhu2, sp.HinhAnhPhu3, sp.HinhAnhPhu4]:
            if field:
                image_path = field
                break

    if not image_path:
        print(f"Sản phẩm MaSP={ma_sp} không có ảnh")
        return

    image_bytes = load_image_bytes(image_path)
    if not image_bytes:
        print(f"Không đọc được ảnh: {image_path}")
        return

    # YOLO label
    yolo_label, yolo_conf = detect_yolo_label(image_bytes, ai_service)
    sp.YOLOLabel = yolo_label
    sp.YOLOConfidence = yolo_conf

    # Embedding
    embedding = extract_embedding(image_bytes, ai_service)
    if embedding:
        sp.EmbeddingVector = json.dumps(embedding)

    db.session.commit()

    print(f"MaSP={sp.MaSP} | {sp.TenSP}")
    print(f"  Ảnh: {image_path}")
    print(f"  YOLO Label: {yolo_label or 'Không detect được'} ({yolo_conf:.4f})")
    print(f"  Embedding: {len(embedding)} chiều")
    print(f"  Đã lưu vào DB!")


def build_faiss_index(ai_service: AIService, batch_data: list = None):
    """Build hoặc cập nhật FAISS index"""
    if batch_data is None:
        products = SanPham.query.filter(
            SanPham.TrangThai == 'active',
            SanPham.EmbeddingVector.isnot(None),
            SanPham.EmbeddingVector != ''
        ).all()

        batch_data = []
        for p in products:
            try:
                emb = json.loads(p.EmbeddingVector)
                batch_data.append({
                    'product_id': p.MaSP,
                    'embedding': emb,
                    'yolo_label': p.YOLOLabel or '',
                })
            except Exception:
                continue

    if not batch_data:
        print("  Không có vector nào để build index.")
        return

    print(f"\n  FAISS: Đang build index với {len(batch_data)} vectors...")
    ai_service.build_index(batch_data)
    print(f"  FAISS: Index đã lưu tại {ai_service.index_path}")


def show_status(ai_service: AIService):
    """Hiển thị trạng thái embeddings + YOLO labels hiện tại"""
    print(f"\n{'='*60}")
    print(f"  TRẠNG THÁI EMBEDDINGS + YOLO LABELS")
    print(f"{'='*60}")

    total_products = SanPham.query.filter(SanPham.TrangThai == 'active').count()

    with_embedding = SanPham.query.filter(
        SanPham.TrangThai == 'active',
        SanPham.EmbeddingVector.isnot(None),
        SanPham.EmbeddingVector != ''
    ).count()

    with_label = SanPham.query.filter(
        SanPham.TrangThai == 'active',
        SanPham.YOLOLabel.isnot(None),
        SanPham.YOLOLabel != ''
    ).count()

    print(f"  Tổng sản phẩm active:   {total_products}")
    print(f"  Đã có embedding:         {with_embedding}")
    print(f"  Đã có YOLO label:        {with_label}")
    print(f"  Chưa có embedding:       {total_products - with_embedding}")
    print(f"  Chưa có YOLO label:      {total_products - with_label}")

    if total_products > 0:
        p_embed = with_embedding / total_products * 100
        p_label = with_label / total_products * 100
        print(f"  Tiến độ embedding:      {p_embed:.1f}%")
        print(f"  Tiến độ label:         {p_label:.1f}%")

    print(f"  FAISS index: ", end='')
    if ai_service.index and ai_service.index.ntotal > 0:
        print(f"CÓ ({ai_service.index.ntotal} vectors)")
    else:
        print("CHƯA có — chạy: python generate_embeddings.py")

    print(f"{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(
        description='Generate ViT embeddings + YOLO auto-label cho sản phẩm'
    )
    parser.add_argument('--maSP', type=int, help='MaSP cần generate')
    parser.add_argument('--rebuild', action='store_true', help='Xóa vector cũ, generate lại tất cả')
    parser.add_argument('--status', action='store_true', help='Xem trạng thái')
    parser.add_argument('--batch', type=int, default=10, help='Batch size commit (mặc định: 10)')
    parser.add_argument('--build-index', action='store_true', help='Chỉ build FAISS index thôi')
    parser.add_argument(
        '--label-only', action='store_true',
        help='Chỉ chạy YOLO auto-label, không generate embedding'
    )
    args = parser.parse_args()

    app = create_app()

    with app.app_context():
        print("Đang khởi tạo AI Service (YOLO custom + ViT)...")
        ai_service = get_ai_service()
        print(f"  Device: {ai_service.device}")
        print(f"  YOLO classes: {len(ai_service.class_names)}")
        print(f"  YOLO model: {Config.YOLO_MODEL_PATH}")
        print(f"  ViT loaded: {'CÓ' if ai_service.vit else 'KHÔNG'}")

        if args.status:
            show_status(ai_service)
        elif args.maSP:
            generate_single_embedding(args.maSP, ai_service)
        elif args.build_index:
            build_faiss_index(ai_service)
            print("FAISS index đã build xong!")
        else:
            generate_all_embeddings(
                ai_service,
                batch_size=args.batch,
                rebuild=args.rebuild,
                label_only=args.label_only
            )
            print("\nXong! Giờ chạy backend và thử upload ảnh.")


if __name__ == '__main__':
    main()
