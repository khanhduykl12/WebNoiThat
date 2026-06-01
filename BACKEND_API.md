# Tài Liệu Backend API — NoiThatXin E-Commerce

> Tài liệu thiết kế API cho Flask Backend. Mỗi endpoint, model, validation, response format đều được mô tả chi tiết.

---

## Mục Lục

1. [Tổng Quan](#1-tổng-quan)
2. [Cấu Trúc Thư Mục Backend](#2-cấu-trúc-thư-mục-backend)
3. [Models (SQLAlchemy)](#3-models-sqlalchemy)
4. [API Endpoints — Chi Tiết](#4-api-endpoints--chi-tiết)
5. [Middleware & Auth](#5-middleware--auth)
6. [AI Module — YOLOv12 + ViT](#6-ai-module--yolov12--vit)
7. [Error Handling & Validation](#7-error-handling--validation)
8. [Setup & Run](#8-setup--run)

---

## 1. Tổng Quan

### 1.1 Thông tin kỹ thuật

| Thành phần | Công nghệ |
|---|---|
| Framework | Flask 3.x |
| ORM | Flask-SQLAlchemy |
| Database | MySQL 8.0 (PyMySQL driver) |
| Auth | JWT (PyJWT) |
| Password | bcrypt |
| CORS | Flask-CORS |
| AI Inference | PyTorch + Ultralytics (YOLOv12) + timm (ViT) |
| Vector DB | FAISS (CPU) |
| Validation | Marshmallow / Cerberus |
| API Docs | Flask-RESTX / Swagger |

### 1.2 Cấu hình `.env`

```env
# Database
DATABASE_URL=mysql+pymysql://root:root123@localhost:3306/noithatxin_db

# App
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=change-this-in-production-abc123xyz
DEBUG=True

# JWT
JWT_SECRET_KEY=change-this-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=1440          # 24 giờ (phút)
JWT_REFRESH_TOKEN_EXPIRES=43200        # 30 ngày (phút)

# AI
YOLO_MODEL_PATH=models/yolov12n.pt
VIT_MODEL=vit_small_patch16_224
YOLO_CONFIDENCE=0.25
AI_TOP_K=10
EMBEDDING_DIM=384

# Upload
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216             # 16MB
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp

# Mail (tùy chọn)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noithatxin@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 2. Cấu Trúc Thư Mục Backend

```
Backend/
│
├── app.py                        # Flask app chính
├── config.py                    # Cấu hình
├── requirements.txt             # pip install -r requirements.txt
├── .env                         # Biến môi trường (không commit)
│
├── models/                      # SQLAlchemy models
│   ├── __init__.py
│   ├── user.py                  # NguoiDung
│   ├── product.py               # SanPham, LoaiSanPham, DanhMuc, BienTheSanPham
│   ├── cart.py                  # GioHang
│   ├── order.py                # DonHang, ChiTietDonHang
│   ├── review.py               # DanhGia
│   ├── voucher.py              # Voucher, LichSuSuDungVoucher
│   ├── banner.py              # Banner
│   ├── blog.py                # BaiViet
│   └── ai.py                  # LichSuTimKiemAnh
│
├── routes/                      # API Blueprints
│   ├── __init__.py
│   ├── auth.py                # /api/auth/*
│   ├── products.py            # /api/products/*
│   ├── categories.py           # /api/categories/*
│   ├── cart.py                # /api/cart/*
│   ├── orders.py              # /api/orders/*
│   ├── reviews.py             # /api/reviews/*
│   ├── wishlist.py           # /api/wishlist/*
│   ├── vouchers.py           # /api/vouchers/*
│   ├── users.py              # /api/users/* (profile)
│   ├── admin/
│   │   ├── __init__.py
│   │   ├── dashboard.py      # /api/admin/dashboard/*
│   │   ├── products.py       # /api/admin/products/*
│   │   ├── orders.py        # /api/admin/orders/*
│   │   └── customers.py     # /api/admin/customers/*
│   ├── banners.py           # /api/banners/*
│   └── ai.py               # /api/ai/*
│
├── services/                    # Business logic
│   ├── __init__.py
│   ├── ai_service.py        # YOLOv12 + ViT + Cosine Similarity
│   ├── vector_service.py     # FAISS index management
│   ├── cart_service.py       # Cart logic
│   ├── order_service.py     # Order logic
│   ├── email_service.py     # Send email notifications
│   └── payment_service.py   # VNPay / MoMo integration
│
├── utils/
│   ├── __init__.py
│   ├── auth.py              # JWT helpers, password hashing
│   ├── validators.py        # Input validation
│   ├── pagination.py        # Pagination helper
│   ├── response.py          # Standardized JSON response
│   └── decorators.py        # @admin_required, @auth_required
│
├── migrations/               # Alembic migrations (nếu dùng)
│
├── uploads/                 # Uploaded images (auto-create)
├── models_ai/               # AI model weights
│   ├── yolov12n.pt         # (sau khi train)
│   └── furniture_faiss.index  # (auto-generate)
│
└── tests/
    ├── test_auth.py
    ├── test_products.py
    └── test_ai.py
```

---

## 3. Models (SQLAlchemy)

### 3.1 File: `models/__init__.py`

```python
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from models.user import NguoiDung
from models.product import SanPham, DanhMuc, LoaiSanPham, BienTheSanPham, Phong, HinhAnhSanPham
from models.cart import GioHang
from models.order import DonHang, ChiTietDonHang
from models.review import DanhGia
from models.voucher import Voucher, LichSuSuDungVoucher
from models.banner import Banner
from models.ai import LichSuTimKiemAnh
```

### 3.2 User Model

```python
# models/user.py
from db import db
from datetime import datetime
import bcrypt

class NguoiDung(db.Model):
    __tablename__ = 'NguoiDung'

    MaND = db.Column(db.Integer, primary_key=True, autoincrement=True)
    HoTen = db.Column(db.String(100), nullable=False)
    Email = db.Column(db.String(255), unique=True, nullable=False)
    SoDienThoai = db.Column(db.String(20))
    TenDangNhap = db.Column(db.String(50), unique=True, nullable=False)
    MatKhau = db.Column(db.String(255), nullable=False)  # bcrypt hash
    VaiTro = db.Column(db.Enum('customer', 'admin', 'manager'), default='customer')
    GioiTinh = db.Column(db.Enum('Nam', 'Nữ', 'Khác'))
    NgaySinh = db.Column(db.Date)
    DiaChi = db.Column(db.String(500))
    HinhDaiDien = db.Column(db.String(500))
    TrangThai = db.Column(db.Enum('active', 'inactive', 'banned'), default='active')
    RefreshToken = db.Column(db.Text)
    TokenExpire = db.Column(db.DateTime)
    NgayTao = db.Column(db.DateTime, default=datetime.utcnow)
    LanDangNhapCuoi = db.Column(db.DateTime)

    def set_password(self, password):
        self.MatKhau = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.MatKhau.encode('utf-8'))

    def to_dict(self, include_email=False):
        data = {
            'id': self.MaND,
            'hoTen': self.HoTen,
            'vaiTro': self.VaiTro,
            'hinhDaiDien': self.HinhDaiDien,
        }
        if include_email:
            data['email'] = self.Email
            data['soDienThoai'] = self.SoDienThoai
            data['diaChi'] = self.DiaChi
        return data
```

### 3.3 Product Model

```python
# models/product.py
from db import db
from datetime import datetime
import json

class SanPham(db.Model):
    __tablename__ = 'SanPham'

    MaSP = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TenSP = db.Column(db.String(255), nullable=False)
    MoTa = db.Column(db.Text)
    MoTaChiTiet = db.Column(db.Text)
    GiaGoc = db.Column(db.Numeric(15, 2), default=0)
    GiaBan = db.Column(db.Numeric(15, 2), nullable=False)
    SoLuongTon = db.Column(db.Integer, default=0)
    HinhAnh = db.Column(db.String(500))
    HinhAnhPhu1 = db.Column(db.String(500))
    HinhAnhPhu2 = db.Column(db.String(500))
    HinhAnhPhu3 = db.Column(db.String(500))
    HinhAnhPhu4 = db.Column(db.String(500))
    MaLoai = db.Column(db.Integer, db.ForeignKey('LoaiSanPham.MaLoai'))
    MaDanhMuc = db.Column(db.Integer, db.ForeignKey('DanhMuc.MaDanhMuc'))
    MaPhong = db.Column(db.Integer, db.ForeignKey('Phong.MaPhong'))
    ThuongHieu = db.Column(db.String(100))
    ChatLieu = db.Column(db.String(200))
    MauSac = db.Column(db.String(200))
    KichThuoc = db.Column(db.String(100))
    BaoHanh = db.Column(db.String(100))
    KhuyenMai = db.Column(db.Integer, default=0)
    NoiBat = db.Column(db.Boolean, default=False)
    BanChay = db.Column(db.Boolean, default=False)
    TrangThai = db.Column(db.Enum('active', 'inactive', 'out_of_stock'), default='active')
    EmbeddingVector = db.Column(db.Text)  # JSON string
    YOLOLabel = db.Column(db.String(100))
    YOLOConfidence = db.Column(db.Numeric(5, 4))
    SoLuotXem = db.Column(db.Integer, default=0)
    SoLuotMua = db.Column(db.Integer, default=0)
    NgayTao = db.Column(db.DateTime, default=datetime.utcnow)
    NgayCapNhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_embedding(self):
        if self.EmbeddingVector:
            return json.loads(self.EmbeddingVector)
        return None

    def set_embedding(self, vector):
        self.EmbeddingVector = json.dumps(vector)

    def to_dict(self, include_reviews=False):
        gia_goc = float(self.GiaBan or 0)
        khuyen_mai = self.KhuyenMai or 0
        gia_sau_giam = gia_goc * (100 - khuyen_mai) / 100

        data = {
            'id': self.MaSP,
            'tenSP': self.TenSP,
            'moTa': self.MoTa,
            'giaGoc': float(self.GiaGoc or 0),
            'giaBan': float(self.GiaBan or 0),
            'giaSauGiam': round(gia_sau_giam, -3),  # Làm tròn K
            'khuyenMai': khuyen_mai,
            'hinhAnh': self.HinhAnh,
            'hinhAnhPhu': [x for x in [self.HinhAnhPhu1, self.HinhAnhPhu2, self.HinhAnhPhu3, self.HinhAnhPhu4] if x],
            'thuongHieu': self.ThuongHieu,
            'chatLieu': self.ChatLieu,
            'mauSac': self.MauSac,
            'kichThuoc': self.KichThuoc,
            'soLuongTon': self.SoLuongTon,
            'trangThai': self.TrangThai,
            'yoloLabel': self.YOLOLabel,
            'soLuotXem': self.SoLuotXem,
            'soLuotMua': self.SoLuotMua,
            'noiBat': self.NoiBat,
            'banChay': self.BanChay,
        }
        if include_reviews:
            data['danhGia'] = self.get_average_rating()
        return data
```

---

## 4. API Endpoints — Chi Tiết

### 4.1 AUTH — Xác thực

#### `POST /api/auth/register` — Đăng ký

**Request:**
```json
{
    "hoTen": "Nguyen Van A",
    "email": "nvana@email.com",
    "soDienThoai": "0909123456",
    "tenDangNhap": "nvana",
    "matKhau": "123456",
    "gioiTinh": "Nam"
}
```

**Response 201:**
```json
{
    "success": true,
    "message": "Đăng ký thành công!",
    "data": {
        "id": 6,
        "hoTen": "Nguyen Van A",
        "email": "nvana@email.com"
    }
}
```

**Validation:**
- `email`: email hợp lệ, unique
- `tenDangNhap`: 3-50 ký tự, unique, không có khoảng trắng
- `matKhau`: tối thiểu 6 ký tự
- `soDienThoai`: 10-11 số

#### `POST /api/auth/login` — Đăng nhập

**Request:**
```json
{
    "tenDangNhap": "nvana",
    "matKhau": "123456"
}
```

**Response 200:**
```json
{
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
        "access_token": "eyJhbGciOiJIUzI1NiIs...",
        "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
        "user": {
            "id": 6,
            "hoTen": "Nguyen Van A",
            "email": "nvana@email.com",
            "vaiTro": "customer"
        }
    }
}
```

#### `POST /api/auth/refresh` — Refresh token

**Headers:** `Authorization: Bearer <refresh_token>`
**Response:** `{ "access_token": "..." }`

#### `POST /api/auth/logout` — Đăng xuất

**Headers:** `Authorization: Bearer <access_token>`
**Response:** `{ "success": true, "message": "Đăng xuất thành công" }`

#### `GET /api/auth/me` — Thông tin user hiện tại

**Headers:** `Authorization: Bearer <access_token>`
**Response:**
```json
{
    "success": true,
    "data": {
        "id": 6,
        "hoTen": "Nguyen Van A",
        "email": "nvana@email.com",
        "soDienThoai": "0909123456",
        "diaChi": "TP.HCM",
        "hinhDaiDien": "/Pic/avatar/user6.jpg",
        "vaiTro": "customer"
    }
}
```

#### `PUT /api/auth/profile` — Cập nhật profile

**Headers:** `Authorization: Bearer <access_token>`
**Request:**
```json
{
    "hoTen": "Nguyen Van B",
    "soDienThoai": "0912345678",
    "diaChi": "140 Lê Trọng Tấn, Tân Phú, TP.HCM",
    "ngaySinh": "2000-05-15",
    "gioiTinh": "Nam"
}
```

---

### 4.2 PRODUCTS — Sản phẩm

#### `GET /api/products` — Danh sách sản phẩm

**Query params:**

| Param | Kiểu | Ví dụ | Mô tả |
|---|---|---|---|
| `page` | int | `1` | Trang |
| `limit` | int | `12` | Số sản phẩm/trang (mặc định 12) |
| `keyword` | string | `sofa` | Tìm kiếm theo tên |
| `category` | int | `1` | Lọc theo MaDanhMuc |
| `type` | int | `5` | Lọc theo MaLoai |
| `room` | int | `1` | Lọc theo MaPhong |
| `minPrice` | int | `1000000` | Giá tối thiểu |
| `maxPrice` | int | `10000000` | Giá tối đa |
| `brand` | string | `NoiThatXin` | Thương hiệu |
| `color` | string | `Nâu` | Màu sắc |
| `sort` | string | `gia_asc` | Sắp xếp: `gia_asc`, `gia_desc`, `moi_nhat`, `ban_chay`, `xem_nhieu` |
| `noiBat` | bool | `1` | Chỉ sản phẩm nổi bật |
| `yoloLabel` | string | `sofa` | Lọc theo nhãn YOLO |

**Response 200:**
```json
{
    "success": true,
    "data": {
        "items": [
            {
                "id": 1,
                "tenSP": "Sofa Vải Nhung 3 Chỗ",
                "giaSauGiam": 7650000,
                "khuyenMai": 10,
                "hinhAnh": "/Pic/SanPham/Sofa/Sofa01.jpg",
                "trangThai": "active",
                "yoloLabel": "sofa"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 12,
            "totalItems": 30,
            "totalPages": 3,
            "hasNext": true,
            "hasPrev": false
        }
    }
}
```

#### `GET /api/products/:id` — Chi tiết sản phẩm

**Response 200:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "tenSP": "Sofa Vải Nhung 3 Chỗ",
        "moTa": "...",
        "moTaChiTiet": "<p>HTML...</p>",
        "giaGoc": 9500000,
        "giaBan": 8500000,
        "giaSauGiam": 7650000,
        "khuyenMai": 10,
        "hinhAnh": "/Pic/SanPham/Sofa/Sofa01.jpg",
        "hinhAnhPhu": [
            "/Pic/SanPham/Sofa/Sofa01.jpg",
            "/Pic/SanPham/Sofa/Sofa02.jpg"
        ],
        "thuongHieu": "NoiThatXin",
        "chatLieu": "Vải nhung cao cấp",
        "mauSac": "Xanh Navy",
        "kichThuoc": "220 x 95 x 85 cm",
        "baoHanh": "12 tháng",
        "soLuongTon": 25,
        "trangThai": "active",
        "danhGia": {
            "diemTrungBinh": 4.5,
            "tongSo": 2
        },
        "bienThe": [
            {
                "id": 1,
                "mauSac": "Xanh Navy",
                "giaBan": 8500000,
                "soLuongTon": 15
            },
            {
                "id": 2,
                "mauSac": "Nâu",
                "giaBan": 8500000,
                "soLuongTon": 10
            }
        ],
        "sanPhamTuongTu": [
            {"id": 2, "tenSP": "...", "giaSauGiam": 12150000, "hinhAnh": "..."}
        ]
    }
}
```

#### `GET /api/products/:id/similar` — Sản phẩm tương tự (AI)

**Response 200:**
```json
{
    "success": true,
    "data": {
        "yoloLabel": "sofa",
        "products": [
            {"id": 2, "tenSP": "Sofa Da Cao Cấp", "similarity": 0.87, "hinhAnh": "..."},
            {"id": 3, "tenSP": "Sofa Giường Gấp", "similarity": 0.72, "hinhAnh": "..."}
        ]
    }
}
```

#### `GET /api/products/featured` — Sản phẩm nổi bật

```json
{
    "success": true,
    "data": [
        {"id": 1, "tenSP": "...", "giaSauGiam": 7650000, "hinhAnh": "...", "danhGia": {"diemTrungBinh": 4.8, "tongSo": 12}},
        ...
    ]
}
```

#### `POST /api/products` — Thêm sản phẩm (Admin)

**Headers:** `Authorization: Bearer <token>` + vai trò `admin`
**Request:**
```json
{
    "tenSP": "Sofa Da Cao Cấp",
    "moTa": "Sofa da thật 100%",
    "giaBan": 13500000,
    "soLuongTon": 15,
    "hinhAnh": "/Pic/SanPham/Sofa/Sofa02.jpg",
    "maLoai": 2,
    "maDanhMuc": 1,
    "maPhong": 1,
    "thuongHieu": "NoiThatXin",
    "chatLieu": "Da thật",
    "mauSac": "Nâu",
    "kichThuoc": "230 x 100 x 90 cm",
    "baoHanh": "12 tháng",
    "khuyenMai": 10,
    "noiBat": true,
    "trangThai": "active"
}
```

#### `PUT /api/products/:id` — Sửa sản phẩm (Admin)

Tương tự POST, nhưng chỉ cần gửi các trường cần sửa.

#### `DELETE /api/products/:id` — Xóa sản phẩm (Admin)

**Response:** `{ "success": true, "message": "Xóa sản phẩm thành công" }`

---

### 4.3 CATEGORIES — Danh mục

#### `GET /api/categories` — Tất cả danh mục + loại

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "tenDanhMuc": "Sofa",
            "biDanh": "sofa",
            "hinhAnh": "/Pic/DanhMuc/sofa.jpg",
            "loaiSanPham": [
                {"id": 1, "tenLoai": "Sofa vải", "biDanh": "sofa-vai"},
                {"id": 2, "tenLoai": "Sofa da", "biDanh": "sofa-da"}
            ],
            "soLuongSanPham": 15
        }
    ]
}
```

#### `GET /api/categories/:id/products` — Sản phẩm theo danh mục

Tương tự `GET /api/products?category=:id` + pagination.

---

### 4.4 CART — Giỏ hàng

#### `GET /api/cart` — Lấy giỏ hàng

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "success": true,
    "data": {
        "items": [
            {
                "id": 1,
                "sanPham": {"id": 1, "tenSP": "Sofa Vải...", "hinhAnh": "..."},
                "bienThe": {"id": null, "mauSac": null},
                "soLuong": 1,
                "giaTaiThoiDiemMua": 8500000,
                "thanhTien": 8500000
            }
        ],
        "tongSoLuong": 2,
        "tongTien": 22000000,
        "phiVanChuyen": 30000
    }
}
```

#### `POST /api/cart` — Thêm vào giỏ

**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
    "maSP": 1,
    "maBienThe": null,
    "soLuong": 2
}
```
**Response:** `{ "success": true, "message": "Thêm vào giỏ hàng thành công", "cartItem": {...} }`

**Logic:**
- Nếu sản phẩm đã có trong giỏ → tăng số lượng
- Nếu `soLuong > soLuongTon` → báo lỗi "Số lượng vượt quá tồn kho"
- Lưu `GiaTaiThoiDiemMua` = giá hiện tại

#### `PUT /api/cart/:itemId` — Cập nhật số lượng

**Headers:** `Authorization: Bearer <token>`
**Request:** `{ "soLuong": 3 }`

#### `DELETE /api/cart/:itemId` — Xóa khỏi giỏ

**Headers:** `Authorization: Bearer <token>`
**Response:** `{ "success": true, "message": "Xóa khỏi giỏ hàng" }`

#### `DELETE /api/cart` — Xóa toàn bộ giỏ

**Headers:** `Authorization: Bearer <token>`

---

### 4.5 ORDERS — Đơn hàng

#### `POST /api/orders` — Tạo đơn hàng

**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
    "hoTenNguoiNhan": "Nguyen Van A",
    "soDienThoaiNguoiNhan": "0909123456",
    "emailNguoiNhan": "nvana@email.com",
    "diaChiGiaoHang": "25 Nguyễn Trãi, Quận 1, TP.HCM",
    "phuongThucThanhToan": "cod",
    "ghiChu": "Giao giờ hành chính",
    "maVoucher": "WELCOME10"
}
```

**Logic:**
1. Lấy giỏ hàng của user
2. Tính tổng tiền
3. Validate voucher (nếu có)
4. Trừ số lượng tồn kho
5. Tạo DonHang → ChiTietDonHang
6. Xóa giỏ hàng
7. Gửi email xác nhận đơn hàng

**Response 201:**
```json
{
    "success": true,
    "message": "Đặt hàng thành công!",
    "data": {
        "maDonHang": 5,
        "maDonHangHienThi": "NDX-00005",
        "tongTienSauGiam": 7850000,
        "trangThaiDonHang": "cho_xac_nhan"
    }
}
```

#### `GET /api/orders` — Lịch sử đơn hàng

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "maDonHang": 4,
            "maDonHangHienThi": "NDX-00004",
            "ngayDat": "2026-05-29T10:20:00",
            "tongTienSauGiam": 5530000,
            "trangThaiDonHang": "dang_giao_hang",
            "trangThaiThanhToan": "da_thanh_toan",
            "phuongThucThanhToan": "momo",
            "soSanPham": 4
        }
    ]
}
```

#### `GET /api/orders/:id` — Chi tiết đơn hàng

**Headers:** `Authorization: Bearer <token>`

#### `PUT /api/orders/:id/cancel` — Hủy đơn

**Headers:** `Authorization: Bearer <token>`
**Điều kiện:** Chỉ hủy được nếu `trangThaiDonHang` = `cho_xac_nhan`

---

### 4.6 REVIEWS — Đánh giá

#### `POST /api/products/:id/reviews` — Thêm đánh giá

**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
    "soSao": 5,
    "tieuDe": "Sản phẩm tuyệt vời!",
    "noiDung": "Chất lượng vượt mong đợi, giao hàng nhanh...",
    "hinhAnhDanhGia1": "base64...",
    "hinhAnhDanhGia2": "base64..."
}
```

**Validation:**
- User đã mua sản phẩm này (có trong DonHang đã giao)
- Mỗi user chỉ đánh giá 1 lần/sản phẩm
- `soSao`: 1-5

#### `GET /api/products/:id/reviews` — Danh sách đánh giá

**Query:** `?page=1&limit=10&sort=newest|rating_high|rating_low`

---

### 4.7 WISHLIST — Yêu thích

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/wishlist` | Lấy danh sách yêu thích |
| POST | `/api/wishlist` | Thêm: `{ "maSP": 1 }` |
| DELETE | `/api/wishlist/:id` | Xóa khỏi yêu thích |

---

### 4.8 VOUCHERS

#### `GET /api/vouchers/available` — Voucher khả dụng cho user

#### `POST /api/vouchers/validate` — Kiểm tra & tính giảm giá

**Request:**
```json
{
    "maCode": "WELCOME10",
    "tongTien": 8500000
}
```
**Response:**
```json
{
    "success": true,
    "data": {
        "valid": true,
        "giamGia": 850000,
        "tongSauGiam": 7650000,
        "tenVoucher": "Giảm 10% cho đơn hàng đầu tiên"
    }
}
```

---

### 4.9 ADMIN — Dashboard

#### `GET /api/admin/dashboard` — Thống kê tổng quan

**Response:**
```json
{
    "success": true,
    "data": {
        "tongSanPham": 30,
        "tongKhachHang": 5,
        "tongDonHang": 50,
        "doanhThuHomNay": 5530000,
        "tongDoanhThuNam": 250000000,
        "donHangHomNay": 2,
        "khachHangMoiHomNay": 1,
        "donChoXacNhan": 5,
        "sanPhamSapHetHang": 3,
        "sanPhamHetHang": 1
    }
}
```

#### `GET /api/admin/dashboard/revenue` — Biểu đồ doanh thu

**Query:** `?days=7&days=30`

**Response:**
```json
{
    "success": true,
    "data": {
        "labels": ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
        "datasets": [
            {
                "label": "Doanh thu (VNĐ)",
                "data": [1200000, 1900000, 1500000, 2100000, 1800000, 2400000, 2200000]
            }
        ]
    }
}
```

#### `PUT /api/admin/orders/:id/status` — Cập nhật trạng thái đơn

**Request:**
```json
{
    "trangThaiDonHang": "da_xac_nhan",
    "ghiChuXuLy": "Đã xác nhận, đang chuẩn bị hàng"
}
```

---

### 4.10 AI — Tìm kiếm bằng hình ảnh (CORE FEATURE)

#### `POST /api/ai/search-by-image` — Tìm kiếm sản phẩm bằng ảnh

**Content-Type:** `multipart/form-data`
**Body:** `image` (file ảnh)

**Response 200:**
```json
{
    "success": true,
    "data": {
        "queryImageId": "temp_abc123.jpg",
        "detections": [
            {
                "label": "sofa",
                "confidence": 0.94,
                "bbox": [120, 80, 540, 320]
            },
            {
                "label": "table",
                "confidence": 0.71,
                "bbox": [300, 350, 500, 420]
            }
        ],
        "processingTime": {
            "yolo_ms": 85,
            "vit_ms": 142,
            "faiss_ms": 12,
            "total_ms": 239
        },
        "results": [
            {
                "id": 1,
                "tenSP": "Sofa Vải Nhung 3 Chỗ",
                "giaSauGiam": 7650000,
                "hinhAnh": "/Pic/SanPham/Sofa/Sofa01.jpg",
                "similarityScore": 0.92,
                "yoloLabel": "sofa"
            },
            {
                "id": 2,
                "tenSP": "Sofa Da Cao Cấp 3 Chỗ",
                "giaSauGiam": 12150000,
                "hinhAnh": "/Pic/SanPham/Sofa/Sofa02.jpg",
                "similarityScore": 0.87,
                "yoloLabel": "sofa"
            }
        ],
        "totalResults": 10
    }
}
```

#### `POST /api/ai/generate-embeddings` — Generate vector cho sản phẩm (Admin)

**Request:**
```json
{
    "maSP": 1
}
```
Hoặc gửi `{"all": true}` để generate tất cả.

#### `GET /api/ai/stats` — Thống kê AI search

```json
{
    "success": true,
    "data": {
        "tongLuotTimKiem": 150,
        "luotTimKiemHomNay": 12,
        "trungBinhXuLy_ms": 245,
        "tyLeCoKetQua": 0.92
    }
}
```

---

## 5. Middleware & Auth

### 5.1 JWT Token Flow

```
Đăng nhập
    │
    ▼
Access Token (24h) ──── Browser localStorage
Refresh Token (30d) ──── httpOnly Cookie
    │
    ▼
Gọi API → Header: Authorization: Bearer <access_token>
    │
    ├── Token hết hạn (401)
    │       │
    │       ▼
    │   POST /api/auth/refresh
    │       │
    │       ▼
    │   Trả về access_token mới
    │
    └── Token hợp lệ → Xử lý request
```

### 5.2 Decorators

```python
# utils/decorators.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from models.user import NguoiDung

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"success": False, "message": "Vui lòng đăng nhập"}), 401
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = NguoiDung.query.get(user_id)
            if not user or user.VaiTro not in ['admin', 'manager']:
                return jsonify({"success": False, "message": "Không có quyền truy cập"}), 403
            return f(*args, **kwargs)
        except Exception:
            return jsonify({"success": False, "message": "Vui lòng đăng nhập"}), 401
    return decorated
```

### 5.3 Sử dụng trong route

```python
@products_bp.route('/products', methods=['POST'])
@admin_required  # Chỉ admin mới được thêm sản phẩm
def create_product():
    # ...

@products_bp.route('/products/<int:id>', methods=['DELETE'])
@admin_required
def delete_product(id):
    # ...
```

---

## 6. AI Module — YOLOv12 + ViT

### 6.1 YOLO Classes cho nội thất

```python
FURNITURE_CLASSES = {
    0: 'sofa',
    1: 'chair',
    2: 'coffee_table',
    3: 'dining_table',
    4: 'bed',
    5: 'wardrobe',
    6: 'dressing_table',
    7: 'desk',
    8: 'tv_stand',
    9: 'bookshelf',
    10: 'lamp',
    11: 'ceiling_light',
    12: 'bedside_lamp',
    13: 'rug',
    14: 'curtain',
    15: 'mirror',
    16: 'painting',
    17: 'vase',
    18: 'plant',
    19: 'bathroom_cabinet',
    20: 'outdoor_table',
    21: 'outdoor_chair',
    22: 'swing_chair',
    23: 'dining_chair',
    24: 'office_chair',
    25: 'decorative_pillow',
    26: 'bed_sheet',
    27: 'kitchen_cabinet',
    28: 'bathroom_shelf',
    29: 'nightstand',
    30: 'other'
}
```

### 6.2 AI Service

```python
# services/ai_service.py
import torch
import numpy as np
from PIL import Image
import io
import time
import json
from ultralytics import YOLO
import timm

class AIService:
    def __init__(self, yolo_path='models/yolov12n.pt',
                 vit_model='vit_small_patch16_224'):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        # YOLOv12
        self.yolo = YOLO(yolo_path)
        self.yolo.to(self.device)
        # Vision Transformer
        self.vit = timm.create_model(vit_model, pretrained=True, num_classes=0)
        self.vit.eval()
        self.vit.to(self.device)

    def detect_furniture(self, image_bytes: bytes, conf_threshold=0.25):
        """Phát hiện đồ nội thất trong ảnh"""
        results = self.yolo.predict(source=image_bytes, conf=conf_threshold, verbose=False)
        detections = []
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0].item())
                detections.append({
                    'label': FURNITURE_CLASSES.get(cls_id, 'other'),
                    'confidence': round(float(box.conf[0].item()), 4),
                    'bbox': [round(x, 1) for x in box.xyxy[0].cpu().numpy().tolist()]
                })
        return detections

    def extract_embedding(self, image_bytes: bytes) -> list:
        """Trích xuất vector 384 chiều từ ViT"""
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize((224, 224))
        tensor = torch.from_numpy(np.array(img)).permute(2, 0, 1).float() / 255.0
        tensor = tensor.unsqueeze(0).to(self.device)

        with torch.no_grad():
            embedding = self.vit(tensor)

        return embedding.cpu().numpy().flatten().tolist()

    def crop_object(self, image_bytes: bytes, bbox: list) -> bytes:
        """Cắt vùng bounding box từ ảnh gốc"""
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        x1, y1, x2, y2 = map(int, bbox)
        cropped = img.crop((x1, y1, x2, y2))
        buf = io.BytesIO()
        cropped.save(buf, format='JPEG')
        return buf.getvalue()
```

### 6.3 Vector Service

```python
# services/vector_service.py
import faiss
import numpy as np
import json
import pickle

class VectorService:
    def __init__(self, db, index_path='models_ai/product_vectors.index',
                 meta_path='models_ai/vector_meta.pkl'):
        self.db = db
        self.index_path = index_path
        self.meta_path = meta_path
        self.index = None
        self.product_ids = []
        self.embeddings = []
        self._load_or_build()

    def _load_or_build(self):
        """Load index có sẵn hoặc build mới"""
        try:
            self.index = faiss.read_index(self.index_path)
            with open(self.meta_path, 'rb') as f:
                data = pickle.load(f)
                self.product_ids = data['ids']
                self.embeddings = data['embeddings']
        except:
            self.index = None
            self.product_ids = []
            self.embeddings = []

    def build_index(self):
        """Build FAISS index từ toàn bộ sản phẩm trong DB"""
        from models.product import SanPham

        products = SanPham.query.filter(
            SanPham.TrangThai == 'active',
            SanPham.EmbeddingVector.isnot(None)
        ).all()

        if not products:
            return

        self.product_ids = []
        self.embeddings = []

        for p in products:
            vec = p.get_embedding()
            if vec:
                self.product_ids.append(p.MaSP)
                self.embeddings.append(vec)

        vectors = np.array(self.embeddings).astype('float32')
        # Chuẩn hóa vector (L2)
        faiss.normalize_L2(vectors)

        dim = vectors.shape[1]
        self.index = faiss.IndexFlatIP(dim)  # Inner Product = Cosine với L2 norm
        self.index.add(vectors)

        # Lưu
        faiss.write_index(self.index, self.index_path)
        with open(self.meta_path, 'wb') as f:
            pickle.dump({'ids': self.product_ids, 'embeddings': self.embeddings}, f)

    def search(self, query_vector: list, top_k=10) -> list:
        """Tìm top-k sản phẩm tương tự"""
        if self.index is None or self.index.ntotal == 0:
            return []

        q = np.array([query_vector]).astype('float32')
        faiss.normalize_L2(q)
        distances, indices = self.index.search(q, top_k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(self.product_ids):
                results.append({
                    'product_id': self.product_ids[idx],
                    'similarity': round(float(dist), 4)
                })
        return results
```

### 6.4 AI Search Flow

```python
# routes/ai.py
@ai_bp.route('/ai/search-by-image', methods=['POST'])
@auth_required
def search_by_image():
    from services.ai_service import AIService
    from services.vector_service import VectorService
    from models.ai import LichSuTimKiemAnh

    # 1. Nhận ảnh
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "Vui lòng gửi file ảnh"}), 400

    file = request.files['image']
    if not file or not allowed_file(file.filename):
        return jsonify({"success": False, "message": "Định dạng không hỗ trợ"}), 400

    image_bytes = file.read()
    t0 = time.time()

    # 2. YOLOv12 phát hiện đồ nội thất
    t_yolo = time.time()
    detections = ai_service.detect_furniture(image_bytes, conf_threshold=0.25)
    t_yolo_ms = round((time.time() - t_yolo) * 1000, 1)

    if not detections:
        return jsonify({
            "success": True,
            "data": {
                "detections": [],
                "results": [],
                "totalResults": 0,
                "processingTime": {"total_ms": round((time.time()-t0)*1000, 1)}
            }
        })

    # 3. Crop + trích xuất vector từ bounding box lớn nhất (confidence cao nhất)
    best_detection = max(detections, key=lambda x: x['confidence'])
    cropped_bytes = ai_service.crop_object(image_bytes, best_detection['bbox'])
    t_vit = time.time()
    query_vector = ai_service.extract_embedding(cropped_bytes)
    t_vit_ms = round((time.time() - t_vit) * 1000, 1)

    # 4. Tìm kiếm FAISS
    t_faiss = time.time()
    similar_products = vector_service.search(query_vector, top_k=10)
    t_faiss_ms = round((time.time() - t_faiss) * 1000, 1)

    # 5. Load thông tin sản phẩm
    product_ids = [s['product_id'] for s in similar_products]
    products = {p.MaSP: p for p in SanPham.query.filter(SanPham.MaSP.in_(product_ids)).all()}

    results = []
    for s in similar_products:
        p = products.get(s['product_id'])
        if p:
            results.append({
                'id': p.MaSP,
                'tenSP': p.TenSP,
                'giaSauGiam': float(p.GiaBan) * (100 - (p.KhuyenMai or 0)) / 100,
                'hinhAnh': p.HinhAnh,
                'similarityScore': s['similarity'],
                'yoloLabel': best_detection['label']
            })

    total_ms = round((time.time() - t0) * 1000, 1)

    # 6. Lưu lịch sử tìm kiếm
    history = LichSuTimKiemAnh(
        MaND=get_jwt_identity(),
        DuongDanAnh=save_temp_image(file),
        YOLOLabels=json.dumps([d['label'] for d in detections]),
        YOLOConfidences=json.dumps([d['confidence'] for d in detections]),
        SoKetQua=len(results),
        ThoiGianXuLyYOLO=t_yolo_ms,
        ThoiGianXuLyVector=t_vit_ms,
        ThoiGianTong=total_ms,
        KetQuaTimKiem=json.dumps(results)
    )
    db.session.add(history)
    db.session.commit()

    # 7. Tăng lượt xem
    for r in results:
        p = products.get(r['id'])
        if p:
            p.SoLuotXem = (p.SoLuotXem or 0) + 1
    db.session.commit()

    return jsonify({
        "success": True,
        "data": {
            "detections": detections,
            "results": results,
            "totalResults": len(results),
            "processingTime": {
                "yolo_ms": t_yolo_ms,
                "vit_ms": t_vit_ms,
                "faiss_ms": t_faiss_ms,
                "total_ms": total_ms
            }
        }
    })
```

---

## 7. Error Handling & Validation

### 7.1 Standard Response Format

**Thành công:**
```json
{
    "success": true,
    "message": "Thành công",
    "data": {...}
}
```

**Lỗi:**
```json
{
    "success": false,
    "message": "Mô tả lỗi",
    "errors": {
        "field_name": ["Validation message"]
    },
    "code": "VALIDATION_ERROR"
}
```

### 7.2 HTTP Status Codes

| Code | Mô tả |
|---|---|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Lỗi validation / Bad request |
| 401 | Chưa đăng nhập |
| 403 | Không có quyền |
| 404 | Không tìm thấy |
| 409 | Conflict (email trùng, sản phẩm trong giỏ rồi...) |
| 422 | Xử lý được nhưng không thể hoàn thành |
| 500 | Lỗi server |

### 7.3 Global Error Handler

```python
# app.py
@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({
        "success": False,
        "message": str(e),
        "code": "VALIDATION_ERROR"
    }), 400

@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "message": "Không tìm thấy tài nguyên"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"success": False, "message": "Lỗi server, vui lòng thử lại sau"}), 500
```

---

## 8. Setup & Run

### 8.1 requirements.txt

```txt
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.0
Flask-JWT-Extended==4.6.0
PyMySQL==1.1.0
bcrypt==4.1.2
python-dotenv==1.0.1

# AI
torch==2.2.0
torchvision==0.17.0
ultralytics==8.3.0
timm==0.9.16
faiss-cpu==1.8.0
scikit-learn==1.4.2
pillow==10.2.0
numpy==1.26.4

# Validation
marshmallow==3.20.1
email-validator==2.1.0

# Utils
gunicorn==21.2.0
```

### 8.2 Chạy Development

```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Tạo .env
cp .env.example .env
# Sửa DATABASE_URL trong .env

# Chạy app
python app.py
# → http://127.0.0.1:5000
```

### 8.3 Build FAISS Index (sau khi có data)

```bash
cd Backend
python -c "
from app import app, db
from services.vector_service import VectorService

with app.app_context():
    vs = VectorService(db)
    vs.build_index()
    print('FAISS index built successfully!')
    print(f'Indexed {len(vs.product_ids)} products')
"
```

### 8.4 Test API

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"hoTen":"Test User","email":"test@test.com","tenDangNhap":"testuser","matKhau":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenDangNhap":"testuser","matKhau":"123456"}'

# Products
curl http://localhost:5000/api/products?page=1&limit=12

# AI Search (cần token)
curl -X POST http://localhost:5000/api/ai/search-by-image \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@test_sofa.jpg"
```

---

## 9. Checklist Backend Hoàn Thành

- [ ] Flask app chạy, `/api/health` trả về `{"status": "ok"}`
- [ ] Database connection thành công
- [ ] Register → tạo user trong DB
- [ ] Login → trả về JWT token
- [ ] CRUD sản phẩm (Admin)
- [ ] GET sản phẩm với filter/pagination
- [ ] Giỏ hàng: thêm/sửa/xóa
- [ ] Tạo đơn hàng → tự trừ tồn kho
- [ ] Voucher validate & apply
- [ ] Dashboard admin thống kê
- [ ] Cập nhật trạng thái đơn hàng (Admin)
- [ ] AI search: YOLOv12 phát hiện đồ nội thất
- [ ] AI search: ViT trích xuất vector
- [ ] AI search: FAISS trả kết quả Top-K
- [ ] FAISS index built cho toàn bộ sản phẩm
