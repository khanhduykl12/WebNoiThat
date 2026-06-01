# Hướng Dẫn Thiết Lập &amp; Vận Hành Dự Án

> **Website thương mại điện tử nội thất NoiThatXin** — Tích hợp YOLOv12 & Vision Transformer cho tìm kiếm bằng hình ảnh.

---

## Mục Lục

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Yêu Cầu Hệ Thống](#2-yêu-cầu-hệ-thống)
3. [Cài Đặt Chi Tiết](#3-cài-đặt-chi-tiết)
4. [Chạy Database SQL](#4-chạy-database-sql)
5. [Khởi Động Backend (Flask)](#5-khởi-động-backend-flask)
6. [Cấu Trúc API](#6-cấu-trúc-api)
7. [Chạy Frontend](#7-chạy-frontend)
8. [Tích Hợp AI (YOLOv12 + ViT)](#8-tích-hợp-ai-yolov12--vit)
9. [Kiểm Tra Hệ Thống](#9-kiểm-tra-hệ-thống)
10. [Cấu Trúc Thư Mục](#10-cấu-trúc-thư-mục)

---

## 1. Tổng Quan Kiến Trúc

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│         FRONTEND             │     │         BACKEND (Flask)     │
│    (HTML/CSS/JS thuần)       │────▶│     Python Flask API         │
│    + Bootstrap 5              │     │     + YOLOv12               │
│    + jQuery AJAX              │     │     + Vision Transformer     │
│                              │     │     + Cosine Similarity      │
│  TrangChu (tìm kiếm ảnh)    │     │  /api/search-by-image        │
│  TrangSanPham (lọc SP)       │     │  /api/products               │
│  TrangChiTiet (chi tiết SP)  │     │  /api/orders                 │
│  GioHang (thanh toán)        │     │  /api/ai/extract-features    │
│  DangNhap/DangKy             │     └──────────────┬───────────────┘
│  TrangAdmin (Dashboard/CRUD) │                        │
│  TrangLichSuMuaHang          │     ┌────────────────▼────────────┐
└─────────────────────────────┘     │  MySQL Database + FAISS     │
                                    │  (Vector Embeddings)         │
                                    └─────────────────────────────┘
```

**Luồng tìm kiếm bằng hình ảnh:**
```
User upload ảnh
      │
      ▼
Backend nhận ảnh (FormData)
      │
      ▼
YOLOv12 phát hiện vùng đồ nội thất (bounding box)
      │
      ▼
Vision Transformer trích xuất Embedding Vector (384-D hoặc 768-D)
      │
      ▼
Cosine Similarity so sánh với kho vector trong FAISS / MySQL
      │
      ▼
Trả về Top-K sản phẩm tương tự nhất
      │
      ▼
Frontend hiển thị danh sách sản phẩm gợi ý
```

---

## 2. Yêu Cầu Hệ Thống

| Thành phần | Phiên bản tối thiểu | Ghi chú |
|---|---|---|
| Python | 3.10+ | Backend + AI |
| MySQL | 8.0+ | Database |
| pip | 22.0+ | Quản lý package |
| RAM | 8 GB | Để chạy YOLOv12 + ViT |
| GPU (khuyến nghị) | CUDA 11.8 / 12.1 | Tăng tốc inference AI |

---

## 3. Cài Đặt Chi Tiết

### Bước 1: Tạo thư mục backend

```bash
cd "e:\Study\Code\HTML,CSS,JS\GiaoDienWeb\GiaoDienWeb"
mkdir Backend
```

### Bước 2: Tạo môi trường ảo

```bash
cd Backend
python -m venv venv

# Kích hoạt (Windows)
venv\Scripts\activate
```

### Bước 3: Cài các thư viện cần thiết

```bash
pip install --upgrade pip

# Flask & Web
pip install Flask==3.0.0 Flask-CORS==4.0.0 Flask-SQLAlchemy==3.1.1
pip install pymysql cryptography

# AI Core
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install ultralytics==8.3.0        # YOLOv12
pip install timm==0.9.16              # Vision Transformer (ViT)

# Vector Search
pip install faiss-cpu==1.8.0          # hoặc faiss-gpu nếu có GPU
pip install scikit-learn==1.4.2       # Cosine Similarity (backup)

# Tiện ích
pip install pillow==10.2.0            # Xử lý ảnh
pip install numpy==1.26.4
pip install python-dotenv==1.0.1
pip install gunicorn==21.2.0          # Deploy
```

> **Lưu ý:** Nếu cài `torch` bị lỗi hoặc quá chậm, dùng:
> ```bash
> pip install torch --index-url https://download.pytorch.org/whl/cpu
> ```
> (chỉ dùng CPU, chậm hơn nhưng không cần GPU)

### Bước 4: Cài MySQL

**Cách 1 — XAMPP (khuyến nghị cho người mới):**
1. Tải XAMPP: https://www.apachefriends.org/
2. Cài đặt, chạy **Apache** và **MySQL**
3. Mở phpMyAdmin: http://localhost/phpmyadmin

**Cách 2 — MySQL riêng:**
1. Tải MySQL Community: https://dev.mysql.com/downloads/mysql/
2. Cài đặt, đặt password root: `root123`

---

## 4. Chạy Database SQL

### 4.1 Tạo Database

```sql
-- Chạy trong phpMyAdmin hoặc MySQL CLI
CREATE DATABASE IF NOT EXISTS noithatxin_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE noithatxin_db;
```

### 4.2 Chạy toàn bộ Script SQL

Copy toàn bộ nội dung file `SQL_Schema.sql` (đã tạo riêng) và paste vào **phpMyAdmin → Tab SQL** hoặc **MySQL CLI**.

**Hoặc chạy bằng command line:**
```bash
mysql -u root -p noithatxin_db < "E:\Study\Code\HTML,CSS,JS\GiaoDienWeb\GiaoDienWeb\SQL_Schema.sql"
```

### 4.3 Tạo user MySQL (nếu cần)

```sql
CREATE USER 'noithatxin_user'@'localhost' IDENTIFIED BY 'noithatxin_pass';
GRANT ALL PRIVILEGES ON noithatxin_db.* TO 'noithatxin_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 5. Khởi Động Backend (Flask)

### 5.1 Tạo file cấu hình

Tạo file `Backend/.env` trong thư mục Backend:

```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=mysql+pymysql://root:root123@localhost:3306/noithatxin_db
AI_MODEL_PATH=models/
UPLOAD_FOLDER=uploads/
MAX_CONTENT_LENGTH=16777216
```

> Thay `root:root123` bằng username/password MySQL của bạn.

### 5.2 Tạo file Backend chính

Tạo file `Backend/app.py`:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
CORS(app)

# Database config
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'mysql+pymysql://root:root123@localhost:3306/noithatxin_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads/'

db = SQLAlchemy(app)

# ─── Tạo thư mục uploads ───
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ─── IMPORT MODELS SAU KHI CÓ FILE models.py ───
# from models import SanPham, DanhMuc, KhachHang, DonHang, GioHang, ChiTietDonHang, DanhGia

# ─── ROUTES SẼ ĐƯỢC THÊM VÀO ĐÂY ───
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'API is running'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### 5.3 Chạy backend

```bash
# Trong terminal đã activate venv
python app.py
```

**Kết quả mong đợi:**
```
* Running on http://127.0.0.1:5000
* Running on http://192.168.x.x:5000  (địa chỉ mạng LAN)
```

---

## 6. Cấu Trúc API

### 6.1 Sản phẩm

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/products` | Lấy danh sách sản phẩm (có phân trang, lọc) |
| GET | `/api/products/<id>` | Lấy chi tiết 1 sản phẩm |
| POST | `/api/products` | Thêm sản phẩm mới (Admin) |
| PUT | `/api/products/<id>` | Sửa sản phẩm (Admin) |
| DELETE | `/api/products/<id>` | Xóa sản phẩm (Admin) |
| GET | `/api/products/search?q=ten` | Tìm kiếm theo tên |

### 6.2 Danh mục

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/categories` | Lấy danh mục + loại sản phẩm |
| GET | `/api/categories/<id>/products` | Lọc SP theo danh mục |

### 6.3 Người dùng &amp; Auth

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập → trả JWT token |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |

### 6.4 Giỏ hàng &amp; Đơn hàng

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/cart` | Lấy giỏ hàng của user |
| POST | `/api/cart` | Thêm sản phẩm vào giỏ |
| PUT | `/api/cart/<item_id>` | Cập nhật số lượng |
| DELETE | `/api/cart/<item_id>` | Xóa khỏi giỏ |
| POST | `/api/orders` | Tạo đơn hàng từ giỏ |
| GET | `/api/orders` | Lịch sử đơn hàng |
| GET | `/api/orders/<id>` | Chi tiết đơn hàng |

### 6.5 AI — Tìm kiếm bằng hình ảnh (CORE FEATURE)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/ai/search-by-image` | Upload ảnh → trả Top-K sản phẩm tương tự |
| POST | `/api/ai/generate-embeddings` | Generate vector cho toàn bộ sản phẩm (Admin) |

**Request `POST /api/ai/search-by-image`:**
```
Content-Type: multipart/form-data
Body: image (file ảnh)
```

**Response:**
```json
{
  "success": true,
  "query_image": "/uploads/temp_abc123.jpg",
  "detected_objects": [
    {"label": "sofa", "confidence": 0.95, "bbox": [x1, y1, x2, y2]}
  ],
  "query_vector": [0.123, ...],
  "results": [
    {
      "id": 1,
      "name": "Sofa Vải Nhung 3 Chỗ",
      "price": 8500000,
      "image": "/Pic/SanPham/Sofa/sf001.jpg",
      "similarity_score": 0.92
    }
  ],
  "total_results": 10
}
```

---

## 7. Chạy Frontend

### 7.1 Nếu chỉ mở file HTML trực tiếp (không cần server)

Mở `TrangChu/TrangChu.html` bằng trình duyệt. Tuy nhiên các file sẽ dùng đường dẫn `/Pic/...` nên cần chạy qua HTTP server.

### 7.2 Chạy bằng Python http.server

```bash
# Trong thư mục gốc của dự án (thư mục chứa GiaoDienWeb)
cd "e:\Study\Code\HTML,CSS,JS\GiaoDienWeb\GiaoDienWeb"
python -m http.server 8080
```

Sau đó truy cập: **http://localhost:8080/TrangChu/TrangChu.html**

### 7.3 Kết nối Frontend → Backend

Sửa các file HTML để gọi API. Ví dụ trong `TrangChu.html`, thay `btnUploadSearch`:

```javascript
// Thay đoạn này trong script:
// Đã có: imageSearchResult.innerHTML = `Đang tìm kiếm...`;
// Sửa thành:

document.getElementById("btnUploadSearch")?.addEventListener("click", async () => {
    const file = imageUploadInput.files[0];
    if (!file) {
        imageSearchResult.textContent = "Vui lòng chọn ảnh trước.";
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    imageSearchResult.innerHTML = '<span style="color:#28a745">⏳ Đang xử lý AI...</span>';

    try {
        const response = await fetch("http://localhost:5000/api/ai/search-by-image", {
            method: "POST",
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            // Hiển thị kết quả tìm kiếm
            let html = `<p>Tìm thấy ${data.total_results} sản phẩm tương tự:</p><div class="row">`;
            data.results.forEach(sp => {
                html += `
                    <div class="col-3 mb-3">
                        <div class="card">
                            <img src="${sp.image}" class="card-img-top" alt="${sp.name}">
                            <div class="card-body">
                                <h6>${sp.name}</h6>
                                <p class="text-danger fw-bold">${sp.price.toLocaleString('vi-VN')} đ</p>
                                <p class="small text-muted">Độ tương đồng: ${(sp.similarity_score * 100).toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>`;
            });
            html += '</div>';
            imageSearchResult.innerHTML = html;
        } else {
            imageSearchResult.innerHTML = '<span style="color:#dc3545">Lỗi: ' + (data.message || 'Không tìm thấy kết quả') + '</span>';
        }
    } catch (error) {
        console.error(error);
        imageSearchResult.innerHTML = '<span style="color:#dc3545">Lỗi kết nối server. Đảm bảo backend đang chạy ở port 5000.</span>';
    }
});
```

---

## 8. Tích Hợp AI (YOLOv12 + ViT)

### 8.1 Download pre-trained weights

```bash
cd Backend
mkdir models

# YOLOv12
# Tự động download khi chạy code đầu tiên (ultralytics sẽ cache)
# Hoặc download thủ công: https://github.com/ultralytics/assets/releases

# Vision Transformer (ViT-Small pre-trained on ImageNet-21k)
# Dùng timm library — tự download khi chạy
```

### 8.2 Code module AI cơ bản

Tạo file `Backend/ai_service.py`:

```python
import torch
import numpy as np
from PIL import Image
import io
from ultralytics import YOLO
import timm

class AIService:
    def __init__(self, yolo_model='yolov12n.pt', vit_model='vit_small_patch16_224'):
        # YOLOv12
        self.yolo = YOLO(yolo_model)
        # Vision Transformer
        self.vit = timm.create_model(vit_model, pretrained=True, num_classes=0)
        self.vit.eval()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.yolo.to(self.device)
        self.vit.to(self.device)

    def detect_objects(self, image_bytes):
        """Phát hiện đồ nội thất trong ảnh bằng YOLOv12"""
        results = self.yolo.predict(source=image_bytes, conf=0.25, verbose=False)
        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    'bbox': box.xyxy[0].cpu().numpy().tolist(),
                    'confidence': float(box.conf[0]),
                    'class': self.yolo.names[int(box.cls[0])]
                })
        return detections

    def extract_features(self, image_bytes):
        """Trích xuất vector đặc trưng bằng ViT"""
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize((224, 224))
        tensor = torch.from_numpy(np.array(img)).permute(2, 0, 1).unsqueeze(0).float() / 255.0
        tensor = tensor.to(self.device)

        with torch.no_grad():
            features = self.vit(tensor)

        return features.cpu().numpy().flatten().tolist()

    def search_similar(self, query_vector, product_vectors, top_k=10):
        """Tính Cosine Similarity, trả về top-k"""
        from sklearn.metrics.pairwise import cosine_similarity
        q = np.array(query_vector).reshape(1, -1)
        similarities = cosine_similarity(q, np.array(product_vectors))[0]
        top_indices = np.argsort(similarities)[::-1][:top_k]
        return [(int(i), float(similarities[i])) for i in top_indices]

ai_service = AIService()
```

### 8.3 Generate vector cho toàn bộ sản phẩm

```python
# Chạy 1 lần để generate vector cho tất cả sản phẩm
def generate_all_embeddings():
    products = SanPham.query.all()
    for sp in products:
        if sp.HinhAnh and not sp.embedding_vector:
            try:
                img_path = f"../{sp.HinhAnh}"
                with open(img_path, 'rb') as f:
                    vector = ai_service.extract_features(f.read())
                sp.embedding_vector = vector  # Lưu JSON vào DB
                db.session.commit()
            except Exception as e:
                print(f"Lỗi với sản phẩm {sp.MaSP}: {e}")
    print("Hoàn thành generate embeddings!")
```

---

## 9. Kiểm Tra Hệ Thống

### Test API bằng cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Lấy danh sách sản phẩm
curl http://localhost:5000/api/products

# Đăng ký user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","email":"test@gmail.com","hoTen":"Nguyen Van A"}'

# Test tìm kiếm ảnh
curl -X POST http://localhost:5000/api/ai/search-by-image \
  -F "image=@test_sofa.jpg" \
  http://localhost:5000/api/ai/search-by-image
```

### Test bằng Postman

1. Import collection (tạo mới với các endpoint trên)
2. Test đăng nhập → lấy token → dùng token cho các request cần auth

---

## 10. Cấu Trúc Thư Mục

```
GiaoDienWeb/
│
├── Backend/                       # ← CẦN TẠO MỚI
│   ├── app.py                    # Flask app chính
│   ├── models.py                 # SQLAlchemy models
│   ├── routes/                   # API routes
│   │   ├── products.py
│   │   ├── auth.py
│   │   ├── orders.py
│   │   └── ai.py
│   ├── ai_service.py             # YOLOv12 + ViT service
│   ├── config.py                 # Cấu hình
│   ├── requirements.txt          # pip install -r requirements.txt
│   ├── uploads/                  # Ảnh upload tạm
│   └── models/                   # AI model weights
│       └── (YOLOv12 weights)
│
├── CSS/                          # CSS toàn cục
│   └── bootstrap.min.css
│
├── Fonts/
│   └── bootstrap-icons.css
│
├── JS/
│   ├── bootstrap.bundle.min.js
│   └── all.min.js
│
├── Pic/                          # Hình ảnh sản phẩm &amp; logo
│   ├── Pic_LogoShop/
│   ├── Pic_SanPham/              # Ảnh sản phẩm nội thất
│   ├── Pic_TrangChu/
│   └── Pic_PThucThanhToan/
│
├── Login/
│   ├── DangNhap.html
│   ├── DangKy.html
│   └── CssLogin_Register.css
│
├── TrangAdmin/
│   ├── TrangAdmin.html           # Layout chính (load AJAX)
│   ├── PhanDashboard.html        # Thống kê
│   ├── PhanSanPham.html          # CRUD sản phẩm
│   ├── PhanDonHang.html          # Quản lý đơn hàng
│   ├── PhanKhachHang.html        # Quản lý khách hàng
│   ├── ThemSanPham.html
│   ├── SuaSanPham.html
│   └── *.css
│
├── TrangChu/
│   ├── TrangChu.html             # ← TÍCH HỢP AI SEARCH Ở ĐÂY
│   ├── CssTrangChu.css
│   └── CssTrangChu2.css
│
├── TrangDanhMucSanPham/
│   ├── TrangSanPham.html
│   ├── TrangSanPham_NoiThat.html
│   └── CssTrangSanPham.css
│
├── TrangChiTiet/
│   ├── TrangChiTiet.html
│   └── CssTrangChiTiet.css
│
├── TrangThanhToan/
│   ├── GioHang.html
│   └── GioHang.css
│
├── TrangLichSuMuaHang/
│   ├── TrangLichSuMuaHang.html
│   ├── TrangChiTietLichSuMua.html
│   └── CssTrangLichSuMuaHang.css
│
├── TrangGioiThieu/
│   ├── TrangGioiThieu.html
│   └── CssTrangGioiThieu.css
│
├── TrangLienHe/
│   ├── TrangLienHe.html
│   └── CssTrangLienHe.css
│
├── SQL_Schema.sql                # ← SCRIPT DATABASE (tạo riêng)
├── HUONG_DAN.md                  # File này
└── TONG_HOP.md                   # Tổng hợp dự án
```

---

## Các Bước Nhanh Để Khởi Động

```bash
# 1. Clone/giữ nguyên project
cd "e:\Study\Code\HTML,CSS,JS\GiaoDienWeb\GiaoDienWeb"

# 2. Tạo backend
mkdir Backend
cd Backend
python -m venv venv
venv\Scripts\activate

# 3. Cài đặt Python packages
pip install Flask Flask-CORS Flask-SQLAlchemy pymysql
pip install ultralytics timm torch torchvision pillow scikit-learn

# 4. Tạo database (chạy SQL_Schema.sql trong phpMyAdmin)

# 5. Chạy backend
python app.py

# 6. Chạy frontend (terminal mới)
cd ..
python -m http.server 8080

# 7. Mở trình duyệt
# http://localhost:8080/TrangChu/TrangChu.html
```

---

**Lưu ý quan trọng:**
- Tất cả hình ảnh trong thư mục `Pic/` vẫn giữ nguyên — **KHÔNG XÓA** vì là tài nguyên tĩnh.
- Nếu muốn chuyển hoàn toàn sang backend thực, cần thay tất cả `<a href="#">` bằng link API thực và cập nhật logic JavaScript để gọi fetch thay vì hardcoded data.
