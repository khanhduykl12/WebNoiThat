# Phân Tích Chi Tiết — NoiThatXin E-Commerce

> Phân tích từng file HTML/CSS hiện tại, xác định class nội thất còn thiếu, giao diện cần sửa, logic cần bổ sung.

---

## Mục Lục

1. [Danh Mục Nội Thất — Thiếu Gì?](#1-danh-mục-nội-thất--thiếu-gì)
2. [Giao Diện — Vấn Đề Cần Sửa](#2-giao-diện--vấn-đề-cần-sửa)
3. [Logic JavaScript — Thiếu Gì?](#3-logic-javascript--thiếu-gì)
4. [Tính Năng Còn Trống](#4-tính-năng-còn-trống)
5. [Bảng So Sánh: Hiện Tại vs Cần Có](#5-bảng-so-sánh-hiện-tại-vs-cần-có)

---

## 1. Danh Mục Nội Thất — Thiếu Gì?

### 1.1 Danh mục CHÍNH (Phòng) — THIẾU ❌

Trong HTML menu, có 5 phòng nhưng **không có bảng `Phong`** trong SQL:

| Phòng | Trong menu HTML | Trong SQL | Cần thêm |
|---|---|---|---|
| Phòng khách | ✅ Có | ❌ Không | Thêm bảng `Phong` |
| Phòng ngủ | ✅ Có | ❌ Không | Thêm bảng `Phong` |
| Phòng bếp | ✅ Có | ❌ Không | Thêm bảng `Phong` |
| Phòng tắm | ✅ Có | ❌ Không | Thêm bảng `Phong` |
| Ngoài trời | ✅ Có | ❌ Không | Thêm bảng `Phong` |

### 1.2 Danh mục SẢN PHẨM — Thiếu ❌

SQL hiện có 8 danh mục → **THIẾU ít nhất 10 danh mục nội thất quan trọng**:

| # | Danh mục | Mô tả | Quan trọng |
|---|---|---|---|
| 1 | Sofa | ✅ Có | — |
| 2 | Bàn | ✅ Có | — |
| 3 | Ghế | ✅ Có | — |
| 4 | Giường | ✅ Có | — |
| 5 | Tủ | ✅ Có | — |
| 6 | Đèn | ✅ Có | — |
| 7 | Kệ | ✅ Có | — |
| 8 | Gương | ✅ Có | — |
| 9 | **Rèm cửa** | ❌ Thiếu | Cao — mỗi phòng đều có rèm |
| 10 | **Thảm trải sàn** | ❌ Thiếu | Cao — phòng khách, phòng ngủ |
| 11 | **Tranh trang trí** | ❌ Thiếu | Cao — tường phòng khách/ngủ |
| 12 | **Cây cảnh / Lọ hoa** | ❌ Thiếu | Trung bình — decor |
| 13 | **Gối / Nệm** | ❌ Thiếu | Cao — sofa + giường đều cần |
| 14 | **Ga giường / Drap** | ❌ Thiếu | Trung bình — phòng ngủ |
| 15 | **Khăn trải bàn** | ❌ Thiếu | Thấp — bàn ăn |
| 16 | **Bình hoa / Tượng** | ❌ Thiếu | Trung bình — decor |
| 17 | **Giá đỡ / Móc treo** | ❌ Thiếu | Thấp |
| 18 | **Bàn ghế ngoài trời** | ❌ Thiếu | Cao — category "Ngoài trời" |

### 1.3 Phân Loại Chi Tiết theo Phòng

#### Phòng khách (Living Room)

| Sản phẩm | Class YOLO |
|---|---|
| Sofa | sofa |
| Bàn trà / Bàn nước | coffee_table |
| Kệ trưng bày | shelf |
| Đèn trần / Đèn bàn | lamp |
| Gương trang trí | mirror |
| Tranh treo tường | painting |
| Thảm trải sàn | rug |
| Rèm cửa | curtain |
| Bình hoa | vase |
| Cây cảnh nhỏ | plant |

#### Phòng ngủ (Bedroom)

| Sản phẩm | Class YOLO |
|---|---|
| Giường ngủ | bed |
| Tủ quần áo | wardrobe |
| Bàn trang điểm | dressing_table |
| Đèn ngủ | bedside_lamp |
| Gối / Nệm | pillow |
| Ga giường / Drap | bed_sheet |
| Gương phòng ngủ | mirror |
| Kệ đầu giường | nightstand |
| Rèm cửa | curtain |
| Thảm phòng ngủ | rug |

#### Phòng bếp (Kitchen)

| Sản phẩm | Class YOLO |
|---|---|
| Bàn ăn | dining_table |
| Ghế ăn | dining_chair |
| Tủ bếp | kitchen_cabinet |
| Kệ bếp | kitchen_shelf |
| Đèn bếp | kitchen_light |
| Khăn trải bàn | tablecloth |

#### Phòng tắm (Bathroom)

| Sản phẩm | Class YOLO |
|---|---|
| Gương phòng tắm | mirror |
| Tủ phòng tắm | bathroom_cabinet |
| Kệ phòng tắm | bathroom_shelf |

#### Ngoài trời (Outdoor)

| Sản phẩm | Class YOLO |
|---|---|
| Bàn ngoài trời | outdoor_table |
| Ghế ngoài trời | outdoor_chair |
| Xích đu | swing_chair |
| Ô che nắng | umbrella |

---

## 2. Giao Diện — Vấn Đề Cần Sửa

### 2.1 Tất Cả Header/NAV không nhất quán

**Vấn đề:** Mỗi trang HTML có header riêng (TrangChu có header xanh `#1E4D36`, các trang khác có header khác). Menu nav mỗi trang viết tay riêng.

**Cần làm:**
- Tách `<header>` thành `Components/header.html` — include bằng jQuery hoặc JS
- Một header dùng chung cho tất cả trang
- Khi đăng nhập → hiện tên user + nút Đăng xuất
- Khi chưa đăng nhập → hiện nút Đăng nhập

### 2.2 Footer không nhất quán

**Vấn đề:** Footer giữa các trang giống nhau nhưng viết lặp lại nhiều lần.

**Cần làm:**
- Tách `Components/footer.html`
- Include vào tất cả trang

### 2.3 Menu Navigation — Link chưa đúng

| Trang | Link hiện tại | Link cần sửa |
|---|---|---|
| TrangChu | `href="#"` cho Giới thiệu | `href="/TrangGioiThieu/TrangGioiThieu.html"` |
| TrangChu | `href="#"` cho Liên hệ | `href="/TrangLienHe/TrangLienHe.html"` |
| TrangChiTiet | Logo → `href="#"` | `href="/TrangChu/TrangChu.html"` |
| TrangSanPham | Logo → `href="#"` | `href="/TrangChu/TrangChu.html"` |
| GioHang | Logo → `href="#"` | `href="/TrangChu/TrangChu.html"` |
| Tất cả | Giỏ hàng → `href="#"` | `href="/TrangThanhToan/GioHang.html"` |

### 2.4 Trang Giới Thiệu — Cần hoàn thiện

`TrangGioiThieu/TrangGioiThieu.html` — Kiểm tra nội dung, cần viết lại cho NoiThatXin.

### 2.5 Trang Liên Hệ — Cần hoàn thiện

`TrangLienHe/TrangLienHe.html` — Thêm form liên hệ thực tế, bản đồ Google Maps.

### 2.6 Giao diện nội thất thay vì xe đạp

**Nghiêm trọng nhất:** Toàn bộ sản phẩm trong HTML đang là **xe đạp**. Cần:
1. Đổi tên folder `/Pic/Pic_SanPham/` thành cấu trúc nội thất
2. Cập nhật tất cả `src` hình ảnh trong HTML
3. Đổi menu dropdown từ "Xe đạp trẻ em, Xe đạp thể thao..." → nội thất

---

## 3. Logic JavaScript — Thiếu Gì?

### 3.1 TrangChu.html — Thiếu

| Tính năng | Trạng thái | Cần làm |
|---|---|---|
| Tìm kiếm text (Tab 1) | ✅ UI có, logic chỉ hiện text | Gọi API `/api/products/search?q=` |
| Upload ảnh (Tab 2) | ✅ UI có, chưa xử lý | Gọi API `/api/ai/search-by-image` |
| Camera capture (Tab 3) | ✅ UI có, chưa xử lý | Gọi API `/api/ai/search-by-image` với ảnh chụp |
| Hiển thị kết quả AI | ❌ Chưa có | Tạo modal/grid hiển thị sản phẩm tương tự |
| Sản phẩm Hot carousel | ❌ Hardcoded | Gọi API `/api/products?noiBat=1` |
| Giỏ hàng badge | ❌ Hardcoded `0` | Gọi API `/api/cart/count` → update badge |
| Đăng nhập thành công | ❌ Chưa xử lý | Lưu token JWT, đổi nút Đăng nhập → avatar user |
| Banner carousel | ✅ Có | — |

### 3.2 TrangSanPham.html — Thiếu

| Tính năng | Trạng thái | Cần làm |
|---|---|---|
| Lọc theo giá | ✅ UI có | Gọi API `/api/products?minPrice=&maxPrice=` |
| Lọc theo danh mục | ✅ UI có | Gọi API `/api/products?category=` |
| Lọc theo chiều cao | ✅ UI có | Gọi API `/api/products?height=` |
| Lọc theo kích thước bánh | ✅ UI có | Gọi API `/api/products?wheelSize=` |
| Tìm kiếm sản phẩm | ✅ UI có | Gọi API `/api/products?keyword=` |
| Phân trang | ❌ Chưa có | Thêm pagination UI + API `/api/products?page=&limit=` |
| Sắp xếp (Giá tăng/giảm, Mới nhất) | ❌ Chưa có | Thêm sort dropdown + API |
| Click sản phẩm | ❌ `href="#"` | Đổi thành `href="/TrangChiTiet/TrangChiTiet.html?id=..."` |

### 3.3 TrangChiTiet.html — Thiếu

| Tính năng | Trạng thái | Cần làm |
|---|---|---|
| Load sản phẩm theo ID | ❌ Hardcoded | Gọi API `/api/products/:id` |
| Hình ảnh phụ (click đổi ảnh chính) | ❌ Chưa có | Thêm gallery ảnh phụ |
| Chọn màu sắc / Kích thước | ❌ Chưa có | Thêm biến thể sản phẩm (color, size) |
| Thêm vào giỏ hàng | ❌ Chưa xử lý | Gọi API `/api/cart` (POST) |
| Mua ngay | ❌ Chưa xử lý | Gọi API tạo đơn + chuyển sang GioHang |
| Tăng/giảm số lượng | ✅ Có | — |
| Sản phẩm liên quan | ❌ Hardcoded carousel | Gọi API `/api/products/:id/related` |
| Đánh giá / Bình luận | ✅ UI có (hardcoded) | Gọi API `/api/products/:id/reviews` + POST review |
| RATE (star rating) | ✅ UI có (hardcoded) | — |
| Nút Yêu thích (tim) | ❌ Chưa có | Gọi API `/api/wishlist` (POST/DELETE) |

### 3.4 GioHang.html — Thiếu

| Tính năng | Trạng thái | Cần làm |
|---|---|---|
| Load giỏ hàng từ API | ❌ Hardcoded 2 sản phẩm | Gọi API `/api/cart` |
| Thêm sản phẩm vào giỏ | ❌ Chưa xử lý | Gọi API `/api/cart` (POST) |
| Xóa sản phẩm khỏi giỏ | ❌ Chưa xử lý | Gọi API `/api/cart/:id` (DELETE) |
| Cập nhật số lượng | ❌ Chưa xử lý | Gọi API `/api/cart/:id` (PUT) |
| Tính tổng tiền tự động | ❌ Hardcoded `0` | JS tính: tổng = Σ(đơn giá × số lượng) |
| Áp dụng mã giảm giá | ❌ Chưa có | Gọi API `/api/voucher/validate` |
| Phí vận chuyển | ❌ Hardcoded `10đ` | JS tính theo tổng đơn |
| Chọn phương thức thanh toán | ✅ UI có | — |
| Tạo đơn hàng | ❌ Chưa xử lý | Gọi API `/api/orders` (POST) |
| Validate form | ❌ Chưa có | Kiểm tra bắt buộc, định dạng email/phone |

### 3.5 DangNhap.html + DangKy.html — Thiếu

| Tính năng | Trạng thái | Cần làm |
|---|---|---|
| Validate form | ❌ Chưa có | JS kiểm tra email, password |
| Gọi API đăng nhập | ❌ Chưa có | POST `/api/auth/login` |
| Lưu JWT token | ❌ Chưa có | localStorage.setItem('token', data.token) |
| Chuyển trang sau login | ❌ Chưa có | window.location.href = '/' |
| Hiện lỗi đăng nhập | ✅ Có `#message-error-log` | Xử lý response lỗi |
| Quên mật khẩu | ❌ Chưa có | Link đến trang quên mật khẩu |
| Đăng ký | ❌ Form có, chưa xử lý | POST `/api/auth/register` |
| Validate đăng ký | ❌ Chưa có | Kiểm tra email trùng, password yếu |

### 3.6 TrangLichSuMuaHang — Thiếu

| Tính năng | Trạng thái | Cần làm |
|---|---|---|
| Load đơn hàng | ❌ Hardcoded | Gọi API `/api/orders` |
| Load chi tiết đơn | ❌ Chưa xử lý | Gọi API `/api/orders/:id` |
| Hủy đơn hàng | ❌ Chưa có | PUT `/api/orders/:id/cancel` |
| Đánh giá sau mua | ❌ Chưa có | POST `/api/products/:id/reviews` |

### 3.7 TrangAdmin — Thiếu

| Tính năng | Trạng thái | Cần làm |
|---|---|---|
| PhanDashboard load API | ❌ Hardcoded `$('#doanhThuHomNay').text('2,500,000 đ')` | Gọi API `/api/admin/dashboard` |
| PhanSanPham CRUD | ❌ UI có, chưa xử lý | CRUD qua API |
| PhanDonHang load + update | ❌ UI có, chưa xử lý | GET + PUT `/api/admin/orders/:id/status` |
| PhanKhachHang load | ❌ UI có, chưa xử lý | GET `/api/admin/customers` |
| ThemSanPham form | ⚠️ UI có, data xe đạp cũ | Cần cập nhật cho nội thất |
| SuaSanPham form | ⚠️ UI có | Cần kết nối API |

---

## 4. Tính Năng Còn Trống

### 4.1 Tính năng USER — Chưa có

| Tính năng | Trạng thái | Ghi chú |
|---|---|---|
| Đăng ký / Đăng nhập | ❌ | Cần API auth |
| Quên mật khẩu | ❌ | Gửi email reset password |
| Đổi mật khẩu | ❌ | Cần trang đổi mk |
| Cập nhật profile | ❌ | Cần form chỉnh sửa |
| Xem lịch sử đơn hàng | ⚠️ | Trang có sẵn, chưa load API |
| Yêu thích / Wishlist | ❌ | Bảng `YeuThich` có sẵn |
| Thông báo đơn hàng | ❌ | Email notification |

### 4.2 Tính năng ADMIN — Chưa có

| Tính năng | Trạng thái |
|---|---|
| Quản lý banner / Slider | ❌ |
| Quản lý danh mục | ❌ |
| Thêm/Sửa/Xóa voucher | ❌ |
| Xem báo cáo doanh thu chi tiết | ❌ |
| Quản lý đánh giá (duyệt/từ chối) | ❌ |
| Thống kê AI search (lịch sử tìm kiếm ảnh) | ❌ |

### 4.3 Tính năng AI — Chưa có

| Tính năng | Trạng thái |
|---|---|
| Upload ảnh → YOLOv12 phát hiện đồ nội thất | ❌ |
| Trích xuất vector bằng Vision Transformer | ❌ |
| Cosine Similarity tìm sản phẩm tương tự | ❌ |
| Hiển thị kết quả AI search | ❌ |
| "Sản phẩm tương tự" trong chi tiết SP | ❌ |

---

## 5. Bảng So Sánh: Hiện Tại vs Cần Có

| Hạng mục | Hiện tại | Cần có |
|---|---|---|
| **Số Danh Mục SP** | 8 | 18+ (thêm rèm, thảm, tranh, cây cảnh...) |
| **Loại SP** | 27 loại | 60+ loại chi tiết |
| **Sản phẩm mẫu** | 17 sản phẩm | 50-100 sản phẩm đa dạng |
| **Hình ảnh SP** | Cần thu thập | Ảnh thật từng sản phẩm |
| **Header/Footer** | Lặp lại trong mỗi file | Tách component dùng chung |
| **Auth** | Chỉ có form | JWT, middleware, refresh token |
| **Cart** | Hardcoded HTML | Session/Database cart |
| **AI Search** | Chưa có | YOLOv12 + ViT + FAISS |
| **Phân trang** | Comment code MVC | JS pagination UI |
| **Admin Dashboard** | Hardcoded số | API thống kê real-time |
| **Payment** | Chỉ có form COD | Tích hợp VNPay / MoMo |
| **Voucher** | Có bảng, có mẫu | Validate + apply trong cart |
| **Reviews** | Có UI, hardcoded | CRUD qua API |
| **Wishlist** | Có bảng DB | Nút yêu thích + page |
| **Phòng (Phong)** | Không có bảng | Thêm bảng Phong |
