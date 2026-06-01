# AI Image Search — Hướng Dẫn Sử Dụng

## Tổng Quan

Hệ thống AI gồm 3 thành phần:
1. **YOLOv8 Custom** — Phát hiện đồ nội thất trong ảnh (19 class)
2. **ViT (Vision Transformer)** — Trích xuất vector đặc trưng 384 chiều
3. **FAISS** — Vector search tìm sản phẩm tương tự

## 19 Class YOLO (theo dataset Furniture_Dectection)

| Class ID | Tên |
|---|---|
| 0 | TV |
| 1 | ban (bàn) |
| 2 | bon_cau (bồn cầu) |
| 3 | bon_rua_tay (bồn rửa tay) |
| 4 | bon_tam (bồn tắm) |
| 5 | cua_so (cửa sổ) |
| 6 | den (đèn) |
| 7 | ghe (ghế) |
| 8 | giuong (giường) |
| 9 | guong (gương) |
| 10 | lo_vi_song (lò vi sóng) |
| 11 | may_giat (máy giặt) |
| 12 | may_lanh (máy lạnh) |
| 13 | sofa |
| 14 | tham (thảm) |
| 15 | tranh_treo_tuong (tranh treo tường) |
| 16 | tu_lanh (tủ lạnh) |
| 17 | tu_quan_ao (tủ quần áo) |
| 18 | voi_sen (vòi sen) |

## Model Đã Train

- **File**: `runs/detect/furniture_local-4/weights/best.pt`
- **Epochs**: 120
- **mAP50**: ~0.765
- **mAP50-95**: ~0.597

## Cách Sử Dụng

### Bước 1: Kích hoạt môi trường

```bash
cd Backend
.\venv311\Scripts\Activate
```

### Bước 2: Chạy auto-label cho sản phẩm (tùy chọn)

Gắn nhãn YOLO cho tất cả sản phẩm chưa có nhãn:

```bash
python auto_label_products.py
```

Hoặc chạy label trong lúc generate embeddings:

```bash
python generate_embeddings.py
```

### Bước 3: Generate embeddings + Build FAISS index

```bash
# Generate tất cả sản phẩm (vector + label + FAISS index)
python generate_embeddings.py

# Rebuild hoàn toàn (xóa vector cũ, làm lại từ đầu)
python generate_embeddings.py --rebuild

# Chỉ build FAISS index (sau khi đã có embeddings)
python generate_embeddings.py --build-index

# Xem trạng thái embeddings
python generate_embeddings.py --status
```

### Bước 4: Khởi động Backend

```bash
python app.py
```

### Bước 5: Test thử

Upload ảnh lên trang chủ (tab "Tải ảnh lên"):

```
POST http://localhost:5000/api/ai/search-image
FormData: image = <file>
```

## Các Lệnh YOLO (Huấn Luyện Lại)

### Train model mới

```bash
cd Backend
.\venv311\Scripts\Activate

yolo train data="..\Furniture_Dectection.v8i.yolov12\data.yaml" model=yolov8n.pt epochs=120 imgsz=640 batch=16 name=furniture_local device=0
```

### Test model trên ảnh

```bash
yolo predict model="runs/detect/furniture_local-4/weights/best.pt" source="path/to/image.jpg" conf=0.25
```

### Export model sang ONNX

```bash
yolo export model="runs/detect/furniture_local-4/weights/best.pt" format=onnx
```

## Cấu Trúc File

```
Backend/
├── ai_service.py              # AI service (YOLO + ViT + FAISS)
├── generate_embeddings.py      # Script generate embeddings + build FAISS
├── auto_label_products.py      # Script auto-label YOLO
├── config.py                   # Config từ .env
├── models_ai/
│   ├── product_vectors.index   # FAISS vector index
│   └── vector_meta.pkl        # Metadata (product IDs, YOLO labels)
├── runs/detect/
│   └── furniture_local-4/     # Kết quả train
│       └── weights/best.pt     # Model tốt nhất
└── uploads/                   # Ảnh tạm upload
```

## API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/ai/search-image` | Upload ảnh → tìm sản phẩm tương tự |
| POST | `/api/ai/search-base64` | Gửi base64 (camera) → tìm sản phẩm |
| GET | `/api/ai/stats` | Thống kê AI search |
| GET | `/api/ai/history` | Lịch sử tìm kiếm (cần login) |
| GET | `/api/ai/search-text` | Tìm theo text |

## Kết Quả Train (furniture_local-4)

```
Epoch 120/120:
  mAP50:    ~0.765
  mAP50-95: ~0.597
  Precision: ~0.741
  Recall:    ~0.725
```
