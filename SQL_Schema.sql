-- ============================================================
-- CO SO DU LIEU: NoiThatXin E-Commerce
-- Mo ta: Website thuong mai dien tu noi that
-- Phien ban: 3.0 (SQL Server)
-- ============================================================

-- ============================================================
-- 1. TAO DATABASE
-- ============================================================
IF DB_ID('noithatxin_db') IS NULL
    CREATE DATABASE noithatxin_db;
GO

USE noithatxin_db;
GO

-- ============================================================
-- 2. BANG PHONG (phan loai theo khong gian)
-- ============================================================
CREATE TABLE Phong (
    MaPhong INT IDENTITY(1,1) PRIMARY KEY,
    TenPhong NVARCHAR(100) NOT NULL,
    BiDanh NVARCHAR(100),
    MoTa NVARCHAR(MAX),
    HinhAnh NVARCHAR(255),
    ThuTu INT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 3. BANG TINH THANH VIET NAM
-- ============================================================
CREATE TABLE TinhThanh (
    MaTT INT IDENTITY(1,1) PRIMARY KEY,
    TenTT NVARCHAR(100) NOT NULL,
    Loai NVARCHAR(20) DEFAULT 'tinh',
    MaVung NVARCHAR(20)
);
GO

CREATE TABLE QuanHuyen (
    MaQH INT IDENTITY(1,1) PRIMARY KEY,
    MaTT INT NOT NULL,
    TenQH NVARCHAR(100) NOT NULL,
    Loai NVARCHAR(20) DEFAULT 'quan'
);
GO

CREATE TABLE PhuongXa (
    MaPX INT IDENTITY(1,1) PRIMARY KEY,
    MaQH INT NOT NULL,
    TenPX NVARCHAR(100) NOT NULL,
    Loai NVARCHAR(20) DEFAULT 'phuong'
);
GO

-- ============================================================
-- 4. BANG DANH MUC SAN PHAM
-- ============================================================
CREATE TABLE DanhMuc (
    MaDanhMuc INT IDENTITY(1,1) PRIMARY KEY,
    TenDanhMuc NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(MAX),
    HinhAnh NVARCHAR(255),
    BiDanh NVARCHAR(100),
    MaPhong INT,
    ThuTu INT DEFAULT 0,
    TrangThai NVARCHAR(20) DEFAULT 'active',
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 5. BANG LOAI SAN PHAM (Chi tiet danh muc)
-- ============================================================
CREATE TABLE LoaiSanPham (
    MaLoai INT IDENTITY(1,1) PRIMARY KEY,
    MaDanhMuc INT NOT NULL,
    TenLoai NVARCHAR(150) NOT NULL,
    MoTa NVARCHAR(MAX),
    BiDanh NVARCHAR(100),
    ThuTu INT DEFAULT 0
);
GO

-- ============================================================
-- 6. BANG SAN PHAM (San pham chinh)
-- ============================================================
CREATE TABLE SanPham (
    MaSP INT IDENTITY(1,1) PRIMARY KEY,
    TenSP NVARCHAR(255) NOT NULL,
    MoTa NVARCHAR(MAX),
    MoTaChiTiet NVARCHAR(MAX),
    GiaGoc DECIMAL(15, 2) NOT NULL DEFAULT 0,
    GiaBan DECIMAL(15, 2) NOT NULL DEFAULT 0,
    SoLuongTon INT NOT NULL DEFAULT 0,
    HinhAnh NVARCHAR(500),
    HinhAnhPhu1 NVARCHAR(500),
    HinhAnhPhu2 NVARCHAR(500),
    HinhAnhPhu3 NVARCHAR(500),
    HinhAnhPhu4 NVARCHAR(500),
    MaLoai INT,
    MaDanhMuc INT,
    MaPhong INT,
    ThuongHieu NVARCHAR(100),
    XuatXu NVARCHAR(100),
    ChatLieu NVARCHAR(200),
    MauSac NVARCHAR(200),
    KichThuoc NVARCHAR(100),
    TrongLuong DECIMAL(10, 2),
    BaoHanh NVARCHAR(100),
    KhuyenMai INT DEFAULT 0,
    NoiBat BIT DEFAULT 0,
    BanChay BIT DEFAULT 0,
    TrangThai NVARCHAR(20) DEFAULT 'active',
    EmbeddingVector NVARCHAR(MAX),
    YOLOLabel NVARCHAR(100),
    YOLOConfidence DECIMAL(5, 4),
    MetaTitle NVARCHAR(255),
    MetaDescription NVARCHAR(MAX),
    SoLuotXem INT DEFAULT 0,
    SoLuotMua INT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 7. BANG BIEN THE SAN PHAM (Mau sac / Kich thuoc)
-- ============================================================
CREATE TABLE BienTheSanPham (
    MaBienThe INT IDENTITY(1,1) PRIMARY KEY,
    MaSP INT NOT NULL,
    MauSac NVARCHAR(100) NOT NULL,
    KichThuoc NVARCHAR(50),
    MaMau NVARCHAR(7),
    GiaBanBienThe DECIMAL(15, 2),
    SoLuongTon INT DEFAULT 0,
    HinhAnhBienThe NVARCHAR(500),
    SKU NVARCHAR(50) UNIQUE,
    TrangThai NVARCHAR(20) DEFAULT 'active'
);
GO

-- ============================================================
-- 8. BANG HINH ANH SAN PHAM (nhieu anh phu)
-- ============================================================
CREATE TABLE HinhAnhSanPham (
    MaHinhAnh INT IDENTITY(1,1) PRIMARY KEY,
    MaSP INT NOT NULL,
    DuongDan NVARCHAR(500) NOT NULL,
    LaAnhChinh BIT DEFAULT 0,
    ThuTu INT DEFAULT 0,
    MoTaAlt NVARCHAR(255)
);
GO

-- ============================================================
-- 9. BANG TAI KHOAN / NGUOI DUNG
-- ============================================================
CREATE TABLE NguoiDung (
    MaND INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    SoDienThoai NVARCHAR(20),
    TenDangNhap NVARCHAR(50) NOT NULL UNIQUE,
    MatKhau NVARCHAR(255) NOT NULL,
    VaiTro NVARCHAR(20) DEFAULT 'customer',
    GioiTinh NVARCHAR(10) DEFAULT N'Khac',
    NgaySinh DATE,
    DiaChi NVARCHAR(500),
    MaTinhThanh INT,
    MaQuanHuyen INT,
    MaPhuongXa INT,
    HinhDaiDien NVARCHAR(500),
    TrangThai NVARCHAR(20) DEFAULT 'active',
    RefreshToken NVARCHAR(MAX),
    TokenExpire DATETIME,
    XacMinhEmail BIT DEFAULT 0,
    OTP NVARCHAR(6),
    OTPExpire DATETIME,
    NgayTao DATETIME DEFAULT GETDATE(),
    LanDangNhapCuoi DATETIME
);
GO

-- ============================================================
-- 10. BANG GIO HANG
-- ============================================================
CREATE TABLE GioHang (
    MaGioHang INT IDENTITY(1,1) PRIMARY KEY,
    MaND INT NOT NULL,
    MaSP INT NOT NULL,
    MaBienThe INT,
    SoLuong INT NOT NULL DEFAULT 1,
    GiaTaiThoiDiemMua DECIMAL(15, 2),
    NgayThem DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 11. BANG DON HANG
-- ============================================================
CREATE TABLE DonHang (
    MaDonHang INT IDENTITY(1,1) PRIMARY KEY,
    MaND INT NOT NULL,
    MaDonHangHienThi NVARCHAR(20) UNIQUE,
    HoTenNguoiNhan NVARCHAR(100) NOT NULL,
    SoDienThoaiNguoiNhan NVARCHAR(20) NOT NULL,
    EmailNguoiNhan NVARCHAR(255),
    DiaChiGiaoHang NVARCHAR(500) NOT NULL,
    MaTinhThanhGiao INT,
    MaQuanHuyenGiao INT,
    MaPhuongXaGiao INT,
    GhiChu NVARCHAR(MAX),
    TongTienTruocGiam DECIMAL(15, 2) DEFAULT 0,
    GiamGia DECIMAL(15, 2) DEFAULT 0,
    PhiVanChuyen DECIMAL(15, 2) DEFAULT 0,
    TongTienSauGiam DECIMAL(15, 2) NOT NULL,
    PhuongThucThanhToan NVARCHAR(20) NOT NULL,
    TrangThaiThanhToan NVARCHAR(20) DEFAULT 'chua_thanh_toan',
    MaGiaoDich NVARCHAR(100),
    TrangThaiDonHang NVARCHAR(20) DEFAULT 'cho_xac_nhan',
    LyDoHuy NVARCHAR(MAX),
    MaND_XuLy INT,
    GhiChuXuLy NVARCHAR(MAX),
    NgayDat DATETIME DEFAULT GETDATE(),
    NgayXacNhan DATETIME,
    NgayGiaoHang DATETIME,
    NgayNhanHang DATETIME,
    NgayHuy DATETIME
);
GO

-- ============================================================
-- 12. BANG CHI TIET DON HANG
-- ============================================================
CREATE TABLE ChiTietDonHang (
    MaCTDH INT IDENTITY(1,1) PRIMARY KEY,
    MaDonHang INT NOT NULL,
    MaSP INT NOT NULL,
    MaBienThe INT,
    SoLuong INT NOT NULL DEFAULT 1,
    DonGia DECIMAL(15, 2) NOT NULL,
    ThanhTien DECIMAL(15, 2) NOT NULL,
    GiamGiaSP DECIMAL(15, 2) DEFAULT 0
);
GO

-- ============================================================
-- 13. BANG DANH GIA / BINH LUAN
-- ============================================================
CREATE TABLE DanhGia (
    MaDanhGia INT IDENTITY(1,1) PRIMARY KEY,
    MaSP INT NOT NULL,
    MaND INT NOT NULL,
    SoSao INT NOT NULL,
    TieuDe NVARCHAR(255),
    NoiDung NVARCHAR(MAX),
    HinhAnhDanhGia1 NVARCHAR(500),
    HinhAnhDanhGia2 NVARCHAR(500),
    HinhAnhDanhGia3 NVARCHAR(500),
    TraLoiAdmin NVARCHAR(MAX),
    NgayTraLoiAdmin DATETIME,
    TrangThai NVARCHAR(20) DEFAULT 'approved',
    HelpfulCount INT DEFAULT 0,
    NgayDanhGia DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 14. BANG YEU THICH / WISHLIST
-- ============================================================
CREATE TABLE YeuThich (
    MaYT INT IDENTITY(1,1) PRIMARY KEY,
    MaND INT NOT NULL,
    MaSP INT NOT NULL,
    NgayThem DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 15. BANG MA GIAM GIA / VOUCHER
-- ============================================================
CREATE TABLE Voucher (
    MaVoucher INT IDENTITY(1,1) PRIMARY KEY,
    TenVoucher NVARCHAR(100) NOT NULL,
    MaCode NVARCHAR(50) NOT NULL UNIQUE,
    LoaiGiam NVARCHAR(20) NOT NULL,
    GiaTriGiam DECIMAL(15, 2) NOT NULL,
    GiaTriToiDa DECIMAL(15, 2),
    DonHangToiThieu DECIMAL(15, 2) DEFAULT 0,
    SoLuong INT NOT NULL DEFAULT 0,
    DaSuDung INT DEFAULT 0,
    SoLanDungMotUser INT DEFAULT 1,
    NgayBatDau DATETIME NOT NULL,
    NgayKetThuc DATETIME NOT NULL,
    ApDungCho NVARCHAR(20) DEFAULT 'all',
    MaApDung NVARCHAR(255),
    ApDungVaiTro NVARCHAR(20) DEFAULT 'all',
    TrangThai NVARCHAR(20) DEFAULT 'active',
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 16. BANG LICH SU SU DUNG VOUCHER
-- ============================================================
CREATE TABLE LichSuSuDungVoucher (
    MaLichSu INT IDENTITY(1,1) PRIMARY KEY,
    MaVoucher INT NOT NULL,
    MaND INT NOT NULL,
    MaDonHang INT NOT NULL,
    SoTienGiam DECIMAL(15, 2) NOT NULL,
    NgaySuDung DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 17. BANG NHAT KY HE THONG
-- ============================================================
CREATE TABLE NhatKyHeThong (
    MaNK INT IDENTITY(1,1) PRIMARY KEY,
    MaND INT,
    HanhDong NVARCHAR(100) NOT NULL,
    BangBiTacDong NVARCHAR(50),
    MaBanGhi INT,
    MoTa NVARCHAR(MAX),
    DuLieuCu NVARCHAR(MAX),
    DuLieuMoi NVARCHAR(MAX),
    DiaIP NVARCHAR(45),
    UserAgent NVARCHAR(500),
    ThoiGian DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 18. BANG CAU HINH HE THONG
-- ============================================================
CREATE TABLE CauHinhHeThong (
    MaCH INT IDENTITY(1,1) PRIMARY KEY,
    KhoiTao NVARCHAR(100) NOT NULL UNIQUE,
    GiaTri NVARCHAR(MAX),
    MoTa NVARCHAR(MAX),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 19. BANG TIM KIEM HINH ANH (AI Search Log)
-- ============================================================
CREATE TABLE LichSuTimKiemAnh (
    MaTimKiem INT IDENTITY(1,1) PRIMARY KEY,
    MaND INT,
    DuongDanAnh NVARCHAR(500),
    YOLOLabels NVARCHAR(MAX),
    YOLOConfidences NVARCHAR(MAX),
    YOLOBBoxes NVARCHAR(MAX),
    SoKetQua INT DEFAULT 0,
    ThoiGianXuLyYOLO DECIMAL(8, 3),
    ThoiGianXuLyVector DECIMAL(8, 3),
    ThoiGianTong DECIMAL(8, 3),
    KetQuaTimKiem NVARCHAR(MAX),
    TrangThai NVARCHAR(20) DEFAULT 'success',
    DiaIP NVARCHAR(45),
    ThoiGian DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 20. BANG BANNER / KHUYEN MAI (cho carousel trang chu)
-- ============================================================
CREATE TABLE Banner (
    MaBanner INT IDENTITY(1,1) PRIMARY KEY,
    TenBanner NVARCHAR(255) NOT NULL,
    Loai NVARCHAR(20) DEFAULT 'banner_small',
    DuongDanAnh NVARCHAR(500) NOT NULL,
    LinkDen NVARCHAR(500),
    TieuDe NVARCHAR(255),
    MoTa NVARCHAR(MAX),
    ChuThich NVARCHAR(255),
    MauNen NVARCHAR(7),
    ViTriHienThi INT DEFAULT 0,
    ThuTu INT DEFAULT 0,
    NgayBatDau DATETIME,
    NgayKetThuc DATETIME,
    SoLuotXem INT DEFAULT 0,
    SoLuotClick INT DEFAULT 0,
    TrangThai NVARCHAR(20) DEFAULT 'active',
    NgayTao DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 21. BANG BAI VIET / TIN TUC
-- ============================================================
CREATE TABLE BaiViet (
    MaBaiViet INT IDENTITY(1,1) PRIMARY KEY,
    TieuDe NVARCHAR(255) NOT NULL,
    NoiDungTomTat NVARCHAR(MAX),
    NoiDungChiTiet NVARCHAR(MAX),
    HinhAnh NVARCHAR(500),
    Loai NVARCHAR(20) DEFAULT 'blog',
    BiDanh NVARCHAR(255) UNIQUE,
    TacGia NVARCHAR(100),
    Tags NVARCHAR(500),
    SoLuotXem INT DEFAULT 0,
    TrangThai NVARCHAR(20) DEFAULT 'draft',
    NgayDang DATETIME,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 22. BANG THONG BAO
-- ============================================================
CREATE TABLE ThongBao (
    MaTB INT IDENTITY(1,1) PRIMARY KEY,
    MaND INT NOT NULL,
    Loai NVARCHAR(20) NOT NULL,
    TieuDe NVARCHAR(255) NOT NULL,
    NoiDung NVARCHAR(MAX),
    LinkDen NVARCHAR(500),
    DaDoc BIT DEFAULT 0,
    NgayGui DATETIME DEFAULT GETDATE()
);
GO

-- ============================================================
-- 23. BANG THONG SO PHI VAN CHUYEN
-- ============================================================
CREATE TABLE PhiVanChuyen (
    MaPhi INT IDENTITY(1,1) PRIMARY KEY,
    MaTinhThanh INT,
    Loai NVARCHAR(20) DEFAULT 'noi_thanh',
    PhiCoBan DECIMAL(15, 2) NOT NULL DEFAULT 0,
    PhiMoiKg DECIMAL(15, 2) DEFAULT 0,
    PhiToiDa DECIMAL(15, 2),
    ThoiGianGiaoUocTinh INT DEFAULT 3,
    TrangThai NVARCHAR(20) DEFAULT 'active'
);
GO

-- ============================================================
-- FOREIGN KEYS
-- ============================================================
ALTER TABLE QuanHuyen ADD CONSTRAINT FK_QuanHuyen_TinhThanh FOREIGN KEY (MaTT) REFERENCES TinhThanh(MaTT);
ALTER TABLE PhuongXa ADD CONSTRAINT FK_PhuongXa_QuanHuyen FOREIGN KEY (MaQH) REFERENCES QuanHuyen(MaQH);
ALTER TABLE DanhMuc ADD CONSTRAINT FK_DanhMuc_Phong FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong);
ALTER TABLE LoaiSanPham ADD CONSTRAINT FK_LoaiSanPham_DanhMuc FOREIGN KEY (MaDanhMuc) REFERENCES DanhMuc(MaDanhMuc);
ALTER TABLE SanPham ADD CONSTRAINT FK_SanPham_LoaiSanPham FOREIGN KEY (MaLoai) REFERENCES LoaiSanPham(MaLoai);
ALTER TABLE SanPham ADD CONSTRAINT FK_SanPham_DanhMuc FOREIGN KEY (MaDanhMuc) REFERENCES DanhMuc(MaDanhMuc);
ALTER TABLE SanPham ADD CONSTRAINT FK_SanPham_Phong FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong);
ALTER TABLE BienTheSanPham ADD CONSTRAINT FK_BienTheSanPham_SanPham FOREIGN KEY (MaSP) REFERENCES SanPham(MaSP);
ALTER TABLE HinhAnhSanPham ADD CONSTRAINT FK_HinhAnhSanPham_SanPham FOREIGN KEY (MaSP) REFERENCES SanPham(MaSP);
ALTER TABLE NguoiDung ADD CONSTRAINT FK_NguoiDung_TinhThanh FOREIGN KEY (MaTinhThanh) REFERENCES TinhThanh(MaTT);
ALTER TABLE NguoiDung ADD CONSTRAINT FK_NguoiDung_QuanHuyen FOREIGN KEY (MaQuanHuyen) REFERENCES QuanHuyen(MaQH);
ALTER TABLE NguoiDung ADD CONSTRAINT FK_NguoiDung_PhuongXa FOREIGN KEY (MaPhuongXa) REFERENCES PhuongXa(MaPX);
ALTER TABLE GioHang ADD CONSTRAINT FK_GioHang_NguoiDung FOREIGN KEY (MaND) REFERENCES NguoiDung(MaND);
ALTER TABLE GioHang ADD CONSTRAINT FK_GioHang_SanPham FOREIGN KEY (MaSP) REFERENCES SanPham(MaSP);
ALTER TABLE GioHang ADD CONSTRAINT FK_GioHang_BienTheSanPham FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe);
ALTER TABLE DonHang ADD CONSTRAINT FK_DonHang_NguoiDung FOREIGN KEY (MaND) REFERENCES NguoiDung(MaND);
ALTER TABLE DonHang ADD CONSTRAINT FK_DonHang_NguoiDung_XuLy FOREIGN KEY (MaND_XuLy) REFERENCES NguoiDung(MaND);
ALTER TABLE DonHang ADD CONSTRAINT FK_DonHang_TinhThanh FOREIGN KEY (MaTinhThanhGiao) REFERENCES TinhThanh(MaTT);
ALTER TABLE DonHang ADD CONSTRAINT FK_DonHang_QuanHuyen FOREIGN KEY (MaQuanHuyenGiao) REFERENCES QuanHuyen(MaQH);
ALTER TABLE DonHang ADD CONSTRAINT FK_DonHang_PhuongXa FOREIGN KEY (MaPhuongXaGiao) REFERENCES PhuongXa(MaPX);
ALTER TABLE ChiTietDonHang ADD CONSTRAINT FK_ChiTietDonHang_DonHang FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang);
ALTER TABLE ChiTietDonHang ADD CONSTRAINT FK_ChiTietDonHang_SanPham FOREIGN KEY (MaSP) REFERENCES SanPham(MaSP);
ALTER TABLE ChiTietDonHang ADD CONSTRAINT FK_ChiTietDonHang_BienTheSanPham FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe);
ALTER TABLE DanhGia ADD CONSTRAINT FK_DanhGia_SanPham FOREIGN KEY (MaSP) REFERENCES SanPham(MaSP);
ALTER TABLE DanhGia ADD CONSTRAINT FK_DanhGia_NguoiDung FOREIGN KEY (MaND) REFERENCES NguoiDung(MaND);
ALTER TABLE YeuThich ADD CONSTRAINT FK_YeuThich_NguoiDung FOREIGN KEY (MaND) REFERENCES NguoiDung(MaND);
ALTER TABLE YeuThich ADD CONSTRAINT FK_YeuThich_SanPham FOREIGN KEY (MaSP) REFERENCES SanPham(MaSP);
ALTER TABLE LichSuSuDungVoucher ADD CONSTRAINT FK_LichSuSuDungVoucher_Voucher FOREIGN KEY (MaVoucher) REFERENCES Voucher(MaVoucher);
ALTER TABLE LichSuSuDungVoucher ADD CONSTRAINT FK_LichSuSuDungVoucher_NguoiDung FOREIGN KEY (MaND) REFERENCES NguoiDung(MaND);
ALTER TABLE LichSuSuDungVoucher ADD CONSTRAINT FK_LichSuSuDungVoucher_DonHang FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang);
ALTER TABLE NhatKyHeThong ADD CONSTRAINT FK_NhatKyHeThong_NguoiDung FOREIGN KEY (MaND) REFERENCES NguoiDung(MaND);
ALTER TABLE LichSuTimKiemAnh ADD CONSTRAINT FK_LichSuTimKiemAnh_NguoiDung FOREIGN KEY (MaND) REFERENCES NguoiDung(MaND);
ALTER TABLE ThongBao ADD CONSTRAINT FK_ThongBao_NguoiDung FOREIGN KEY (MaND) REFERENCES NguoiDung(MaND);
ALTER TABLE PhiVanChuyen ADD CONSTRAINT FK_PhiVanChuyen_TinhThanh FOREIGN KEY (MaTinhThanh) REFERENCES TinhThanh(MaTT);
GO

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_phong ON Phong(ThuTu);
CREATE INDEX idx_ma_tt ON QuanHuyen(MaTT);
CREATE INDEX idx_ma_qh ON PhuongXa(MaQH);
CREATE INDEX idx_phong_dm ON DanhMuc(MaPhong);
CREATE INDEX idx_danh_muc_lsp ON LoaiSanPham(MaDanhMuc);
CREATE INDEX idx_ten_sp ON SanPham(TenSP);
CREATE INDEX idx_gia_ban ON SanPham(GiaBan);
CREATE INDEX idx_danh_muc_sp ON SanPham(MaDanhMuc);
CREATE INDEX idx_loai_sp ON SanPham(MaLoai);
CREATE INDEX idx_phong_sp ON SanPham(MaPhong);
CREATE INDEX idx_noi_bat ON SanPham(NoiBat);
CREATE INDEX idx_ban_chay ON SanPham(BanChay);
CREATE INDEX idx_trang_thai_sp ON SanPham(TrangThai);
CREATE INDEX idx_ma_sp_bienthe ON BienTheSanPham(MaSP);
CREATE INDEX idx_ma_sp_hinhanh ON HinhAnhSanPham(MaSP);
CREATE INDEX idx_email_nd ON NguoiDung(Email);
CREATE INDEX idx_ten_dang_nhap ON NguoiDung(TenDangNhap);
CREATE INDEX idx_ma_tinh_nd ON NguoiDung(MaTinhThanh);
CREATE INDEX idx_ma_nd_giohang ON GioHang(MaND);
CREATE INDEX idx_ma_nd_donhang ON DonHang(MaND);
CREATE INDEX idx_trang_thai_dh ON DonHang(TrangThaiDonHang);
CREATE INDEX idx_thanh_toan_dh ON DonHang(TrangThaiThanhToan);
CREATE INDEX idx_ngay_dat ON DonHang(NgayDat);
CREATE INDEX idx_ma_hien_thi ON DonHang(MaDonHangHienThi);
CREATE INDEX idx_ma_dh_chitiet ON ChiTietDonHang(MaDonHang);
CREATE INDEX idx_ma_sp_danhgia ON DanhGia(MaSP);
CREATE INDEX idx_so_sao ON DanhGia(SoSao DESC);
CREATE INDEX idx_ma_nd_yeuthich ON YeuThich(MaND);
CREATE INDEX idx_ma_code_voucher ON Voucher(MaCode);
CREATE INDEX idx_trang_thai_voucher ON Voucher(TrangThai);
CREATE INDEX idx_ma_nd_nhatky ON NhatKyHeThong(MaND);
CREATE INDEX idx_thoi_gian_nhatky ON NhatKyHeThong(ThoiGian DESC);
CREATE INDEX idx_hanh_dong ON NhatKyHeThong(HanhDong);
CREATE INDEX idx_ma_nd_timkiem ON LichSuTimKiemAnh(MaND);
CREATE INDEX idx_thoi_gian_timkiem ON LichSuTimKiemAnh(ThoiGian DESC);
CREATE INDEX idx_trang_thai_banner ON Banner(TrangThai);
CREATE INDEX idx_loai_banner ON Banner(Loai);
CREATE INDEX idx_loai_bai_viet ON BaiViet(Loai);
CREATE INDEX idx_trang_thai_bai_viet ON BaiViet(TrangThai);
CREATE INDEX idx_ma_nd_thongbao ON ThongBao(MaND);
CREATE INDEX idx_da_doc ON ThongBao(DaDoc);
CREATE INDEX idx_ma_tinh_phi ON PhiVanChuyen(MaTinhThanh);
GO

-- ============================================================
-- ============================================================
-- DU LIEU MAU
-- ============================================================
-- ============================================================

-- PHONG
SET IDENTITY_INSERT Phong ON;
INSERT INTO Phong (MaPhong, TenPhong, BiDanh, MoTa, ThuTu) VALUES
(1, N'Phòng khách', 'phong-khach', N'Sofa, bàn trà, kệ trưng bày cho không gian sinh hoạt chung', 1),
(2, N'Phòng ngủ', 'phong-ngu', N'Giường, tủ, bàn trang điểm cho không gian nghỉ ngơi', 2),
(3, N'Phòng bếp', 'bep', N'Bàn ăn, tủ bếp, kệ bếp cho không gian nấu nướng', 3),
(4, N'Phòng tắm', 'phong-tam', N'Gương, tủ, kệ cho phòng tắm', 4),
(5, N'Văn phòng / Làm việc', 'van-phong', N'Bàn làm việc, ghế văn phòng, kệ sách', 5),
(6, N'Ngoài trời', 'ngoai-troi', N'Bàn ghế, xích đu ngoài trời', 6),
(7, N'Phòng ăn', 'phong-an', N'Bàn ăn, ghế ăn cho không gian bếp ăn', 7),
(8, N'Trang trí', 'trang-tri', N'Tranh, cây cảnh, bình hoa, gối trang trí', 8);
SET IDENTITY_INSERT Phong OFF;
GO

-- TINH THANH
SET IDENTITY_INSERT TinhThanh ON;
INSERT INTO TinhThanh (MaTT, TenTT, Loai, MaVung) VALUES
-- Mien Nam
(1, N'Hồ Chí Minh', 'thanh_pho', 'Mien Nam'),
(2, N'Cần Thơ', 'thanh_pho', 'Mien Nam'),
(3, N'Biên Hòa', 'thanh_pho', 'Mien Nam'),
(4, N'Bình Dương', 'tinh', 'Mien Nam'),
(5, N'Long An', 'tinh', 'Mien Nam'),
(6, N'Đồng Nai', 'tinh', 'Mien Nam'),
(7, N'Bà Rịa - Vũng Tàu', 'tinh', 'Mien Nam'),
(8, N'An Giang', 'tinh', 'Mien Nam'),
(9, N'Bạc Liêu', 'tinh', 'Mien Nam'),
(10, N'Bến Tre', 'tinh', 'Mien Nam'),
(11, N'Bình Phước', 'tinh', 'Mien Nam'),
(12, N'Bình Thuận', 'tinh', 'Mien Nam'),
(13, N'Cà Mau', 'tinh', 'Mien Nam'),
(14, N'Đồng Tháp', 'tinh', 'Mien Nam'),
(15, N'Hậu Giang', 'tinh', 'Mien Nam'),
(16, N'Kiên Giang', 'tinh', 'Mien Nam'),
(17, N'Sóc Trăng', 'tinh', 'Mien Nam'),
(18, N'Tây Ninh', 'tinh', 'Mien Nam'),
(19, N'Tiền Giang', 'tinh', 'Mien Nam'),
(20, N'Trà Vinh', 'tinh', 'Mien Nam'),
(21, N'Vĩnh Long', 'tinh', 'Mien Nam'),
-- Mien Bac
(22, N'Hà Nội', 'thanh_pho', 'Mien Bac'),
(23, N'Hải Phòng', 'thanh_pho', 'Mien Bac'),
(24, N'Hải Dương', 'tinh', 'Mien Bac'),
(25, N'Vĩnh Phúc', 'tinh', 'Mien Bac'),
(26, N'Quảng Ninh', 'tinh', 'Mien Bac'),
(27, N'Bắc Ninh', 'tinh', 'Mien Bac'),
(28, N'Bắc Kạn', 'tinh', 'Mien Bac'),
(29, N'Cao Bằng', 'tinh', 'Mien Bac'),
(30, N'Điện Biên', 'tinh', 'Mien Bac'),
(31, N'Hà Giang', 'tinh', 'Mien Bac'),
(32, N'Hà Nam', 'tinh', 'Mien Bac'),
(33, N'Hòa Bình', 'tinh', 'Mien Bac'),
(34, N'Hưng Yên', 'tinh', 'Mien Bac'),
(35, N'Lai Châu', 'tinh', 'Mien Bac'),
(36, N'Lạng Sơn', 'tinh', 'Mien Bac'),
(37, N'Lào Cai', 'tinh', 'Mien Bac'),
(38, N'Nam Định', 'tinh', 'Mien Bac'),
(39, N'Ninh Bình', 'tinh', 'Mien Bac'),
(40, N'Phú Thọ', 'tinh', 'Mien Bac'),
(41, N'Sơn La', 'tinh', 'Mien Bac'),
(42, N'Thái Bình', 'tinh', 'Mien Bac'),
(43, N'Thái Nguyên', 'tinh', 'Mien Bac'),
(44, N'Tuyên Quang', 'tinh', 'Mien Bac'),
(45, N'Yên Bái', 'tinh', 'Mien Bac'),
-- Mien Trung
(46, N'Đà Nẵng', 'thanh_pho', 'Mien Trung'),
(47, N'Nha Trang', 'thanh_pho', 'Mien Trung'),
(48, N'Thanh Hóa', 'tinh', 'Mien Trung'),
(49, N'Nghệ An', 'tinh', 'Mien Trung'),
(50, N'Bình Định', 'tinh', 'Mien Trung'),
(51, N'Đắk Lắk', 'tinh', 'Mien Trung'),
(52, N'Đắk Nông', 'tinh', 'Mien Trung'),
(53, N'Gia Lai', 'tinh', 'Mien Trung'),
(54, N'Hà Tĩnh', 'tinh', 'Mien Trung'),
(55, N'Khánh Hòa', 'tinh', 'Mien Trung'),
(56, N'Kon Tum', 'tinh', 'Mien Trung'),
(57, N'Lâm Đồng', 'tinh', 'Mien Trung'),
(58, N'Ninh Thuận', 'tinh', 'Mien Trung'),
(59, N'Phú Yên', 'tinh', 'Mien Trung'),
(60, N'Quảng Bình', 'tinh', 'Mien Trung'),
(61, N'Quảng Nam', 'tinh', 'Mien Trung'),
(62, N'Quảng Ngãi', 'tinh', 'Mien Trung'),
(63, N'Quảng Trị', 'tinh', 'Mien Trung'),
(64, N'Thừa Thiên Huế', 'tinh', 'Mien Trung');
SET IDENTITY_INSERT TinhThanh OFF;
GO

-- QUAN HUYEN
SET IDENTITY_INSERT QuanHuyen ON;
INSERT INTO QuanHuyen (MaQH, MaTT, TenQH, Loai) VALUES
(1, 1, N'Quận 1', 'quan'),
(2, 1, N'Quận 3', 'quan'),
(3, 1, N'Quận 4', 'quan'),
(4, 1, N'Quận 5', 'quan'),
(5, 1, N'Quận 6', 'quan'),
(6, 1, N'Quận 7', 'quan'),
(7, 1, N'Quận 8', 'quan'),
(8, 1, N'Quận 10', 'quan'),
(9, 1, N'Quận 11', 'quan'),
(10, 1, N'Quận 12', 'quan'),
(11, 1, N'Quận Bình Thạnh', 'quan'),
(12, 1, N'Quận Gò Vấp', 'quan'),
(13, 1, N'Quận Phú Nhuận', 'quan'),
(14, 1, N'Quận Tân Bình', 'quan'),
(15, 1, N'Quận Tân Phú', 'quan'),
(16, 1, N'Thành phố Thủ Đức', 'thanh_pho'),
(17, 1, N'Huyện Bình Chánh', 'huyen'),
(18, 1, N'Huyện Củ Chi', 'huyen'),
(19, 1, N'Huyện Hóc Môn', 'huyen'),
(20, 1, N'Huyện Nhà Bè', 'huyen'),
(21, 1, N'Huyện Cần Giờ', 'huyen');
SET IDENTITY_INSERT QuanHuyen OFF;
GO

-- PHUONG XA
SET IDENTITY_INSERT PhuongXa ON;
INSERT INTO PhuongXa (MaPX, MaQH, TenPX, Loai) VALUES
(1, 1, N'Phường Tân Định', 'phuong'),
(2, 1, N'Phường Đa Kao', 'phuong'),
(3, 1, N'Phường Bến Nghé', 'phuong'),
(4, 2, N'Phường Võ Thị Sáu', 'phuong'),
(5, 2, N'Phường 4', 'phuong'),
(6, 2, N'Phường 5', 'phuong'),
(7, 6, N'Phường Tân Thuận Đông', 'phuong'),
(8, 6, N'Phường Tân Thuận Tây', 'phuong'),
(9, 6, N'Phường Tân Kiểng', 'phuong'),
(10, 12, N'Phường 3', 'phuong'),
(11, 12, N'Phường 5', 'phuong'),
(12, 12, N'Phường 7', 'phuong');
SET IDENTITY_INSERT PhuongXa OFF;
GO

-- DANH MUC
SET IDENTITY_INSERT DanhMuc ON;
INSERT INTO DanhMuc (MaDanhMuc, TenDanhMuc, MoTa, BiDanh, MaPhong, ThuTu) VALUES
(1, N'Sofa', N'Ghế sofa các loại', 'sofa', 1, 1),
(2, N'Bàn trà / Bàn nước', N'Bàn trà, bàn nước phòng khách', 'ban-tra', 1, 2),
(3, N'Kệ trưng bày / Kệ TV', N'Kệ TV, kệ trưng bày', 'ke-trung-bay', 1, 3),
(4, N'Rèm cửa', N'Rèm cửa các loại', 'rem-cua', 1, 4),
(5, N'Thảm trải sàn', N'Thảm phòng khách', 'tham-trai-san', 1, 5),
(6, N'Gối trang trí', N'Gối tựa lưng, gối trang trí', 'goi-trang-tri', 1, 6),
(7, N'Giường ngủ', N'Giường đơn, giường đôi, giường tầng', 'giuong-ngu', 2, 7),
(8, N'Tủ quần áo', N'Tủ quần áo các loại', 'tu-quan-ao', 2, 8),
(9, N'Bàn trang điểm', N'Bàn trang điểm có gương', 'ban-trang-diem', 2, 9),
(10, N'Ga giường / Drap', N'Ga giường, drap, vỏ gối', 'ga-giuong', 2, 10),
(11, N'Kệ đầu giường', N'Kệ nhỏ đầu giường', 'ke-dau-giuong', 2, 11),
(12, N'Đèn ngủ', N'Đèn bàn, đèn treo đầu giường', 'den-ngu', 2, 12),
(13, N'Bàn ăn', N'Bàn ăn gia đình', 'ban-an', 7, 13),
(14, N'Ghế ăn', N'Ghế ăn, ghế bar', 'ghe-an', 7, 14),
(15, N'Tủ bếp', N'Tủ bếp trên và dưới', 'tu-bep', 3, 15),
(16, N'Khăn trải bàn', N'Khăn trải bàn ăn', 'khan-trai-ban', 7, 16),
(17, N'Gương phòng tắm', N'Gương có đèn, gương treo tường', 'guong-phong-tam', 4, 17),
(18, N'Tủ phòng tắm', N'Tủ nhỏ phòng tắm', 'tu-phong-tam', 4, 18),
(19, N'Bàn làm việc', N'Bàn văn phòng, bàn gaming', 'ban-lam-viec', 5, 19),
(20, N'Ghế văn phòng', N'Ghế xoay, ghế ergonomic', 'ghe-van-phong', 5, 20),
(21, N'Kệ sách', N'Kệ sách, kệ để máy', 'ke-sach', 5, 21),
(22, N'Bàn ghế ngoài trời', N'Bàn và ghế ngoài trời', 'ban-ghe-ngoai-troi', 6, 22),
(23, N'Tranh treo tường', N'Tranh, ảnh treo tường', 'tranh-treo-tuong', 8, 23),
(24, N'Cây cảnh / Lọ hoa', N'Cây giả trang trí, lọ hoa', 'cay-canh', 8, 24),
(25, N'Bình hoa / Tượng', N'Bình hoa gốm, tượng trang trí', 'binh-hoa', 8, 25);
SET IDENTITY_INSERT DanhMuc OFF;
GO

-- LOAI SAN PHAM
SET IDENTITY_INSERT LoaiSanPham ON;
INSERT INTO LoaiSanPham (MaLoai, MaDanhMuc, TenLoai, BiDanh, ThuTu) VALUES
(1, 1, N'Sofa vải', 'sofa-vai', 1),
(2, 1, N'Sofa da', 'sofa-da', 2),
(3, 1, N'Sofa gỗ', 'sofa-go', 3),
(4, 1, N'Sofa giường (gấp)', 'sofa-giuong-gap', 4),
(5, 1, N'Sofa góc (corner)', 'sofa-goc', 5),
(6, 1, N'Sofa modular', 'sofa-modular', 6),
(7, 2, N'Bàn trà gỗ', 'ban-tra-go', 1),
(8, 2, N'Bàn trà kính', 'ban-tra-kinh', 2),
(9, 2, N'Bàn nước đơn', 'ban-nuoc-don', 3),
(10, 3, N'Kệ TV', 'ke-tv', 1),
(11, 3, N'Kệ trưng bày mở', 'ke-trung-bay-mo', 2),
(12, 3, N'Kệ góc', 'ke-goc', 3),
(13, 3, N'Tủ TV', 'tu-tv', 4),
(14, 4, N'Rèm cửa sổ', 'rem-cua-so', 1),
(15, 4, N'Rèm lá dọc', 'rem-la-doc', 2),
(16, 4, N'Rèm roman', 'rem-roman', 3),
(17, 4, N'Rèm cuốn', 'rem-cuon', 4),
(18, 5, N'Thảm trải phòng khách', 'tham-phong-khach', 1),
(19, 5, N'Thảm phòng ngủ', 'tham-phong-ngu', 2),
(20, 5, N'Thảm trải bàn', 'tham-trai-ban', 3),
(21, 6, N'Gối tựa lưng', 'goi-tua-lung', 1),
(22, 6, N'Gối ôm', 'goi-om', 2),
(23, 6, N'Gối trang trí hình', 'goi-hinh', 3),
(24, 7, N'Giường đôi', 'giuong-doi', 1),
(25, 7, N'Giường đơn', 'giuong-don', 2),
(26, 7, N'Giường tầng', 'giuong-tang', 3),
(27, 7, N'Giường gỗ', 'giuong-go', 4),
(28, 7, N'Giường da / nỉ', 'giuong-da-ni', 5),
(29, 8, N'Tủ 2 cánh', 'tu-2-canh', 1),
(30, 8, N'Tủ 4 cánh', 'tu-4-canh', 2),
(31, 8, N'Tủ trượt', 'tu-truot', 3),
(32, 8, N'Tủ gương', 'tu-guong', 4),
(33, 9, N'Bàn trang điểm có gương', 'ban-trang-diem-co-guong', 1),
(34, 9, N'Bàn trang điểm treo tường', 'ban-trang-diem-treo-tuong', 2),
(35, 10, N'Ga giường', 'ga-giuong', 1),
(36, 10, N'Drap', 'drap', 2),
(37, 10, N'Vỏ gối', 'vo-goi', 3),
(38, 10, N'Nệm lót', 'nem-lot', 4),
(39, 11, N'Kệ đầu giường 1 ngăn', 'ke-dau-giuong-1-ngan', 1),
(40, 11, N'Kệ đầu giường 2 ngăn', 'ke-dau-giuong-2-ngan', 2),
(41, 12, N'Đèn bàn ngủ', 'den-ban-ngu', 1),
(42, 12, N'Đèn ngủ để bàn', 'den-ngu-de-ban', 2),
(43, 12, N'Đèn LED dán tường', 'den-led-dan-tuong', 3),
(44, 13, N'Bàn ăn 4 chỗ', 'ban-an-4-cho', 1),
(45, 13, N'Bàn ăn 6 chỗ', 'ban-an-6-cho', 2),
(46, 13, N'Bàn ăn 8 chỗ', 'ban-an-8-cho', 3),
(47, 13, N'Bàn ăn gấp', 'ban-an-gap', 4),
(48, 14, N'Ghế ăn gỗ', 'ghe-an-go', 1),
(49, 14, N'Ghế ăn đệm', 'ghe-an-dem', 2),
(50, 14, N'Ghế bar', 'ghe-bar', 3),
(51, 15, N'Tủ bếp trên', 'tu-bep-tren', 1),
(52, 15, N'Tủ bếp dưới', 'tu-bep-duoi', 2),
(53, 15, N'Tủ bếp góc', 'tu-bep-goc', 3),
(54, 16, N'Khăn trải bàn tròn', 'khan-trai-ban-tron', 1),
(55, 16, N'Khăn trải bàn chữ nhật', 'khan-trai-ban-chu-nhat', 2),
(56, 17, N'Gương có đèn LED', 'guong-co-den-led', 1),
(57, 17, N'Gương treo tường', 'guong-treo-tuong', 2),
(58, 17, N'Gương đứng', 'guong-dung', 3),
(59, 18, N'Tủ treo tường nhỏ', 'tu-treo-tuong-nho', 1),
(60, 18, N'Kệ phòng tắm', 'ke-phong-tam', 2),
(61, 19, N'Bàn làm việc đơn giản', 'ban-lam-viec-don-gian', 1),
(62, 19, N'Bàn làm việc có ngăn kéo', 'ban-lam-viec-co-ngan-keo', 2),
(63, 19, N'Bàn standing desk', 'ban-standing-desk', 3),
(64, 19, N'Bàn gaming', 'ban-gaming', 4),
(65, 20, N'Ghế xoay văn phòng', 'ghe-xoay-van-phong', 1),
(66, 20, N'Ghế ergonomic', 'ghe-ergonomic', 2),
(67, 20, N'Ghế lưới (mesh)', 'ghe-luoi', 3),
(68, 20, N'Ghế giám đốc', 'ghe-giam-doc', 4),
(69, 21, N'Kệ sách 4 tầng', 'ke-sach-4-tang', 1),
(70, 21, N'Kệ sách 5 tầng', 'ke-sach-5-tang', 2),
(71, 21, N'Kệ sách treo tường', 'ke-sach-treo-tuong', 3),
(72, 21, N'Kệ để máy in', 'ke-de-may-in', 4),
(73, 22, N'Bàn ngoài trời', 'ban-ngoai-troi', 1),
(74, 22, N'Ghế ngoài trời', 'ghe-ngoai-troi', 2),
(75, 22, N'Xích đu ngoài trời', 'xich-du-ngoai-troi', 3),
(76, 22, N'Ô che nắng', 'o-che-nang', 4),
(77, 23, N'Tranh canvas', 'tranh-canvas', 1),
(78, 23, N'Tranh ảnh', 'tranh-anh', 2),
(79, 23, N'Tranh thêu', 'tranh-theu', 3),
(80, 23, N'Đồng hồ treo tường', 'dong-ho-treo-tuong', 4),
(81, 24, N'Cây giả trang trí', 'cay-gia-trang-tri', 1),
(82, 24, N'Lọ hoa gốm', 'lo-hoa-gom', 2),
(83, 24, N'Cây treo tường', 'cay-treo-tuong', 3),
(84, 25, N'Bình hoa gốm', 'binh-hoa-gom', 1),
(85, 25, N'Bình hoa thủy tinh', 'binh-hoa-thuy-tinh', 2),
(86, 25, N'Tượng trang trí', 'tuong-trang-tri', 3);
SET IDENTITY_INSERT LoaiSanPham OFF;
GO

-- SAN PHAM
SET IDENTITY_INSERT SanPham ON;
INSERT INTO SanPham (MaSP, TenSP, MoTa, GiaGoc, GiaBan, SoLuongTon, HinhAnh, MaLoai, MaDanhMuc, MaPhong, ThuongHieu, ChatLieu, MauSac, KichThuoc, KhuyenMai, NoiBat, BanChay, TrangThai, YOLOLabel, SoLuotXem, SoLuotMua) VALUES
(1, N'Sofa Vải Nhung 3 Chỗ Màu Xanh Navy', N'Sofa vải nhung cao cấp, thiết kế hiện đại, phù hợp phòng khách sang trọng.', 9500000, 8500000, 25, '/Pic/Pic_SanPham/Sofa/Sofa01.svg', 1, 1, 1, 'NoiThatXin', N'Vải nhung cao cấp', N'Xanh Navy', '220 x 95 x 85 cm', 10, 1, 1, 'active', 'sofa', 150, 12),
(2, N'Sofa Da Cao Cấp 3 Chỗ Màu Nâu Sáng', N'Sofa da thật 100%, bọc êm ái, chân gỗ tự nhiên, thiết kế tối giản châu Âu.', 15000000, 13500000, 15, '/Pic/Pic_SanPham/Sofa/Sofa02.svg', 2, 1, 1, 'NoiThatXin', N'Da thật', N'Nâu sáng', '230 x 100 x 90 cm', 10, 1, 0, 'active', 'sofa', 120, 8),
(3, N'Sofa Giường Gấp Được - Màu Xám', N'Sofa đa năng có thể gấp thành giường ngủ, tiết kiệm diện tích tối đa.', 7000000, 6200000, 30, '/Pic/Pic_SanPham/Sofa/Sofa03.svg', 4, 1, 1, 'Müller', N'Vải bố', N'Xám', '180 x 85 x 75 cm', 11, 0, 1, 'active', 'sofa_bed', 90, 5),
(4, N'Sofa Góc Modular Phải - Be', N'Sofa góc L-shape modular, ghế ngồi rộng, có đệm lót êm ái.', 22000000, 19500000, 8, '/Pic/Pic_SanPham/Sofa/Sofa04.svg', 5, 1, 1, 'ModernLiving', N'Vải nỉ', N'Be', '280 x 180 x 85 cm', 11, 0, 0, 'active', 'corner_sofa', 60, 3),
(5, N'Bàn Trà Gỗ Tự Nhiên Hình Oval - Nâu', N'Bàn trà phòng khách nhỏ gọn, mặt oval hiện đại, chân gỗ sồi.', 3200000, 2800000, 35, '/Pic/Pic_SanPham/BanTra/BanTra01.svg', 7, 2, 1, 'WoodArt', N'Gỗ sồi tự nhiên', N'Nâu', '100 x 60 x 45 cm', 12, 0, 1, 'active', 'coffee_table', 80, 15),
(6, N'Kệ TV Gỗ Công Nghiệp 150cm - Trắng', N'Kệ TV 2 ngăn, thiết kế treo tường hoặc đặt sàn, màu trắng sang trọng.', 4500000, 3800000, 40, '/Pic/Pic_SanPham/KeTV/KeTV01.svg', 10, 3, 1, 'HomeStyle', N'MDF veneer sơn trắng', N'Trắng', '150 x 40 x 50 cm', 8, 0, 0, 'active', 'tv_stand', 70, 10),
(7, N'Kệ Trưng Bày Mở 5 Tầng - Gỗ Sồi', N'Kệ trưng bày phòng khách, 5 tầng, gỗ sồi tự nhiên, phong cách Scandinavia.', 5800000, 4900000, 25, '/Pic/Pic_SanPham/KeTrungBay/KeTrungBay01.svg', 11, 3, 1, 'NordicHome', N'Gỗ sồi', N'Nâu sáng', '80 x 30 x 180 cm', 15, 0, 0, 'active', 'display_shelf', 45, 6),
(8, N'Thảm Trải Sàn Phòng Khách 200x300cm - Xám', N'Thảm len wool blend mềm mại, hoa văn geometric hiện đại, chống trượt.', 2500000, 2100000, 50, '/Pic/Pic_SanPham/Tham/Tham01.svg', 18, 5, 1, 'RugArt', N'Len wool blend', N'Xám', '200 x 300 cm', 16, 0, 1, 'active', 'rug', 100, 20),
(9, N'Rèm Cửa Sổ 2 Lớp Voan + Blackout - Trắng', N'Rèm 2 lớp: lớp voan trong suốt + lớp blackout chống nắng, bền đẹp.', 1800000, 1500000, 80, '/Pic/Pic_SanPham/Rem/Rem01.svg', 14, 4, 1, 'CurtainLux', N'Voan + Polyester blackout', N'Trắng', '200 x 270 cm', 16, 0, 0, 'active', 'curtain', 60, 18),
(10, N'Gối Tựa Lưng Sofa Hình Tròn - Nhiều Màu', N'Gối tựa lưng tròn, vỏ nỉ mềm, nhồi bông foam, nhiều màu lựa chọn.', 350000, 280000, 200, '/Pic/Pic_SanPham/Goi/Goi01.svg', 21, 6, 1, 'CushionCo', N'Nỉ + Bông foam', N'Nhiều màu', '40 x 40 cm', 20, 0, 1, 'active', 'decorative_pillow', 200, 50),
(11, N'Giường Ngủ Đôi Khung Gỗ Sồi Tự Nhiên', N'Giường đôi khung gỗ sồi chắc chắn, đầu giường bọc vải nỉ sang trọng.', 18000000, 15900000, 12, '/Pic/Pic_SanPham/Giuong/Giuong01.svg', 24, 7, 2, 'DreamSleep', N'Gỗ sồi + Vải nỉ', N'Nâu đậm', '180 x 200 x 95 cm', 11, 1, 1, 'active', 'bed', 180, 15),
(12, N'Giường Ngủ Đơn Có Ngăn Kéo - Trắng', N'Giường đơn cho bé hoặc người lớn, có 2 ngăn kéo bên dưới tiện dụng.', 9500000, 8200000, 18, '/Pic/Pic_SanPham/GiuongDon/GiuongDon01.svg', 25, 7, 2, 'KidsZone', N'MDF veneer sơn trắng', N'Trắng', '120 x 200 x 80 cm', 13, 0, 0, 'active', 'single_bed', 70, 8),
(13, N'Tủ Quần Áo 4 Cánh Có Gương - Trắng Sứ', N'Tủ quần áo 4 cánh, tích hợp gương lớn, có ngăn kéo bên trong, ray trượt êm.', 14000000, 12500000, 10, '/Pic/Pic_SanPham/TuQuanAo/TuQuanAo01.svg', 30, 8, 2, 'SmartStorage', N'MDF sơn trắng sứ', N'Trắng', '180 x 60 x 220 cm', 10, 1, 0, 'active', 'wardrobe', 110, 9),
(14, N'Bàn Trang Điểm Có Gương LED - Trắng', N'Bàn trang điểm nhỏ gọn, gương tròn có đèn LED xung quanh, ngăn kéo đựng đồ.', 4500000, 3800000, 22, '/Pic/Pic_SanPham/BanTrangDiem/BanTrangDiem01.svg', 33, 9, 2, 'VanityHome', N'MDF sơn trắng', N'Trắng', '80 x 40 x 75 cm', 15, 0, 0, 'active', 'dressing_table', 55, 4),
(15, N'Ga Giường Cotton 100% Màu Trắng - King Size', N'Ga giường cotton 100%, mềm mát, thấm hút tốt, an toàn cho da nhạy cảm.', 1200000, 950000, 150, '/Pic/Pic_SanPham/GaGiuong/GaGiuong01.svg', 35, 10, 2, 'BedNest', N'Cotton 100%', N'Trắng', '220 x 240 cm', 20, 0, 1, 'active', 'bed_sheet', 130, 35),
(16, N'Kệ Đầu Giường 2 Ngăn Gỗ - Nâu', N'Kệ nhỏ đầu giường 2 ngăn, đặt bên cạnh giường để điện thoại và đồng hồ.', 1800000, 1500000, 60, '/Pic/Pic_SanPham/KeDauGiuong/KeDauGiuong01.svg', 40, 11, 2, 'BedSide', N'MDF veneer gỗ sồi', N'Nâu', '40 x 35 x 55 cm', 16, 0, 0, 'active', 'nightstand', 45, 12),
(17, N'Đèn Bàn Ngủ LED Cảm Ứng - Trắng Warm', N'Đèn bàn ngủ LED cảm ứng chạm, điều chỉnh 3 cấp độ sáng, 3 màu ánh sáng.', 650000, 520000, 100, '/Pic/Pic_SanPham/Den/Den01.svg', 41, 12, 2, 'BrightLight', N'ABS + LED', N'Trắng', 'H: 35 cm', 20, 0, 1, 'active', 'bedside_lamp', 180, 45),
(18, N'Bàn Ăn Gỗ Tự Nhiên 6 Chỗ - Nâu Đậm', N'Bàn ăn gỗ sồi tự nhiên nguyên khối, kiểu dáng tối giản, phù hợp phòng ăn hiện đại.', 12000000, 10500000, 20, '/Pic/Pic_SanPham/BanAn/BanAn01.svg', 44, 13, 7, 'WoodArt', N'Gỗ sồi tự nhiên', N'Nâu đậm', '150 x 90 x 75 cm', 12, 1, 1, 'active', 'dining_table', 95, 11),
(19, N'Ghế Ăn Đệm Vải Lịch Sự - Xám', N'Ghế ăn bọc đệm vải êm ái, chân gỗ sồi tự nhiên, kiểu dáng thanh lịch.', 2200000, 1850000, 60, '/Pic/Pic_SanPham/GheAn/GheAn01.svg', 49, 14, 7, 'DiningStyle', N'Vải bố + Gỗ sồi', N'Xám', '45 x 52 x 85 cm', 15, 0, 1, 'active', 'dining_chair', 75, 18),
(20, N'Bàn Làm Việc Có Ngăn Kéo - Trắng', N'Bàn làm việc thiết kế tối giản, tích hợp 3 ngăn kéo tiện dụng, chân sắt sơn tĩnh điện.', 4500000, 3900000, 40, '/Pic/Pic_SanPham/BanLamViec/BanLamViec01.svg', 62, 19, 5, 'WorkPro', N'MDF sơn trắng + Sắt sơn tĩnh điện', N'Trắng', '120 x 60 x 75 cm', 13, 0, 1, 'active', 'desk', 100, 20),
(21, N'Ghế Văn Phòng Lưng Lưới Mesh Có Tay Đẩy', N'Ghế xoay văn phòng, lưng lưới mesh thoáng khí, đệm ngồi êm, có tay đẩy.', 3200000, 2700000, 50, '/Pic/Pic_SanPham/GheVanPhong/GheVanPhong01.svg', 66, 20, 5, 'ErgoMax', N'Lưới mesh + Đệm foam', N'Đen', '65 x 65 x 115 cm', 15, 0, 1, 'active', 'office_chair', 140, 30),
(22, N'Kệ Sách 5 Tầng Gỗ Công Nghiệp - Nâu', N'Kệ sách 5 tầng, gỗ công nghiệp laminate bền đẹp, chịu lực tốt, dễ lắp ráp.', 2200000, 1850000, 55, '/Pic/Pic_SanPham/KeSach/KeSach01.svg', 70, 21, 5, 'BookNest', N'MDF laminate', N'Nâu', '80 x 30 x 180 cm', 15, 0, 1, 'active', 'bookshelf', 110, 25),
(23, N'Tranh Canvas Phong Cảnh Thiên Nhiên 3 Mảnh', N'Bộ tranh canvas 3 mảnh phong cảnh thiên nhiên, treo tường phòng khách sang trọng.', 850000, 680000, 90, '/Pic/Pic_SanPham/Tranh/Tranh01.svg', 77, 23, 8, 'ArtDecor', N'Canvas in UV', N'Nhiều màu', '30 x 40 cm x 3', 20, 0, 1, 'active', 'painting', 200, 55),
(24, N'Bình Hoa Gốm Trắng Hiện Đại Cao 35cm', N'Bình hoa gốm trắng cao cấp, kiểu dáng hiện đại, phù hợp đặt sàn hoặc bàn.', 580000, 450000, 120, '/Pic/Pic_SanPham/BinhHoa/BinhHoa01.svg', 84, 25, 8, 'CeramicArt', N'Gốm sứ trắng', N'Trắng', 'H: 35 cm, ĐK: 18 cm', 22, 0, 1, 'active', 'vase', 160, 40),
(25, N'Cây Giả Trang Trí Để Sàn - Xương Rồng Mix', N'Bộ 3 cây xương rồng giả trang trí, chậu gốm trắng, không cần tưới nước.', 420000, 350000, 180, '/Pic/Pic_SanPham/CayCanh/CayCanh01.svg', 81, 24, 8, 'GreenDecor', N'Cây giả nhựa cao cấp + Chậu gốm', N'Xanh', 'H: 25-40 cm', 16, 0, 1, 'active', 'plant', 250, 70),
(26, N'Bàn Ngoài Trời Gỗ Tự Nhiên Acacia 120cm', N'Bàn ngoài trời gỗ Acacia chịu nước, mặt tròn thoáng mát, phù hợp ban công, sân vườn.', 8500000, 7200000, 15, '/Pic/Pic_SanPham/BanNgoaiTroi/BanNgoaiTroi01.svg', 73, 22, 6, 'OutdoorLife', N'Gỗ Acacia tự nhiên', N'Nâu tự nhiên', 'ĐK: 120 cm, H: 75 cm', 15, 0, 0, 'active', 'outdoor_table', 35, 4),
(27, N'Ghế Ngoài Trời Nan Gỗ Có Đệm - Be', N'Ghế ngoài trời nan gỗ tự nhiên, có đệm ngồi êm, chân nhôm sơn tĩnh điện.', 4200000, 3600000, 25, '/Pic/Pic_SanPham/GheNgoaiTroi/GheNgoaiTroi01.svg', 74, 22, 6, 'OutdoorLife', N'Gỗ tự nhiên + Nhôm', N'Be', '60 x 65 x 90 cm', 14, 0, 0, 'active', 'outdoor_chair', 30, 3),
(28, N'Gương Phòng Tắm Có Đèn LED Cảm Ứng - 60x80cm', N'Gương phòng tắm chống hơi nước, đèn LED xung quanh cảm ứng chạm, thiết kế sang trọng.', 2800000, 2400000, 35, '/Pic/Pic_SanPham/GuongPhongTam/GuongPhongTam01.svg', 56, 17, 4, 'MirrorPro', N'Kính tempered + Khung nhôm', N'Đen viền', '60 x 80 cm', 14, 0, 0, 'active', 'bathroom_mirror', 65, 7),
(29, N'Kệ Phòng Tắm Treo Tường 3 Tầng - Inox', N'Kệ nhỏ phòng tắm treo tường 3 tầng, chất liệu inox 304 chống gỉ sét.', 850000, 680000, 70, '/Pic/Pic_SanPham/KePhongTam/KePhongTam01.svg', 60, 18, 4, 'BathRoom', N'Inox 304', N'Bạc', '30 x 60 cm', 20, 0, 0, 'active', 'bathroom_shelf', 85, 22);
SET IDENTITY_INSERT SanPham OFF;
GO

-- NGUOI DUNG
SET IDENTITY_INSERT NguoiDung ON;
INSERT INTO NguoiDung (MaND, HoTen, Email, SoDienThoai, TenDangNhap, MatKhau, VaiTro, GioiTinh, NgaySinh, DiaChi, MaTinhThanh, MaQuanHuyen, MaPhuongXa, TrangThai) VALUES
(1, N'Admin NoiThatXin', 'admin@noithatxin.vn', '0909123456', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4u.VQ8z9pXRrAa5G', 'admin', N'Khác', NULL, N'140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP.HCM', 1, 15, NULL, 'active'),
(2, N'Nguyễn Văn Minh', 'minh.nguyen@email.com', '0912345678', 'minhnguyen', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4u.VQ8z9pXRrAa5G', 'customer', N'Nam', '1995-03-15', N'25 Nguyễn Trãi, Quận 1, TP.HCM', 1, 1, 1, 'active'),
(3, N'Trần Thị Lan', 'lan.tran@email.com', '0934567890', 'lantran', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4u.VQ8z9pXRrAa5G', 'customer', N'Nữ', '1998-07-22', N'88 Phạm Văn Đồng, Gò Vấp, TP.HCM', 1, 12, 10, 'active'),
(4, N'Lê Hoàng Nam', 'nam.le@email.com', '0978123456', 'namle', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4u.VQ8z9pXRrAa5G', 'customer', N'Nam', '1992-11-08', N'42 Trần Hưng Đạo, Quận 5, TP.HCM', 1, 4, NULL, 'active'),
(5, N'Phạm Thị Hương', 'huong.pham@email.com', '0909888777', 'huongpham', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4u.VQ8z9pXRrAa5G', 'customer', N'Nữ', '1997-01-30', N'15 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', 1, 11, NULL, 'active');
SET IDENTITY_INSERT NguoiDung OFF;
GO

-- DON HANG
SET IDENTITY_INSERT DonHang ON;
INSERT INTO DonHang (MaDonHang, MaDonHangHienThi, MaND, HoTenNguoiNhan, SoDienThoaiNguoiNhan, EmailNguoiNhan, DiaChiGiaoHang, MaTinhThanhGiao, MaQuanHuyenGiao, MaPhuongXaGiao, PhuongThucThanhToan, TrangThaiDonHang, TrangThaiThanhToan, TongTienTruocGiam, GiamGia, PhiVanChuyen, TongTienSauGiam, NgayDat, NgayXacNhan, NgayGiaoHang) VALUES
(1, 'NDX-00001', 2, N'Nguyễn Văn Minh', '0912345678', 'minh.nguyen@email.com', N'25 Nguyễn Trãi, Quận 1, TP.HCM', 1, 1, 1, 'cod', 'da_giao_hang', 'da_thanh_toan', 15900000, 0, 0, 15900000, '2026-05-20 14:30:00', '2026-05-20 16:00:00', '2026-05-22 10:00:00'),
(2, 'NDX-00002', 3, N'Trần Thị Lan', '0934567890', 'lan.tran@email.com', N'88 Phạm Văn Đồng, Gò Vấp, TP.HCM', 1, 12, 10, 'vnpay', 'da_giao_hang', 'da_thanh_toan', 12430000, 0, 30000, 12430000, '2026-05-22 09:15:00', '2026-05-22 11:00:00', '2026-05-24 14:30:00'),
(3, 'NDX-00003', 4, N'Lê Hoàng Nam', '0978123456', 'nam.le@email.com', N'42 Trần Hưng Đạo, Quận 5, TP.HCM', 1, 4, NULL, 'cod', 'cho_xac_nhan', 'chua_thanh_toan', 8700000, 0, 0, 8700000, '2026-05-28 18:45:00', NULL, NULL),
(4, 'NDX-00004', 2, N'Nguyễn Văn Minh', '0912345678', 'minh.nguyen@email.com', N'25 Nguyễn Trãi, Quận 1, TP.HCM', 1, 1, 3, 'momo', 'dang_giao_hang', 'da_thanh_toan', 5500000, 200000, 30000, 5530000, '2026-05-29 10:20:00', '2026-05-29 12:00:00', NULL);
SET IDENTITY_INSERT DonHang OFF;
GO

-- CHI TIET DON HANG
SET IDENTITY_INSERT ChiTietDonHang ON;
INSERT INTO ChiTietDonHang (MaCTDH, MaDonHang, MaSP, MaBienThe, SoLuong, DonGia, ThanhTien, GiamGiaSP) VALUES
(1, 1, 11, NULL, 1, 15900000, 15900000, 0),
(2, 1, 16, NULL, 2, 1500000, 3000000, 0),
(3, 2, 1, NULL, 1, 8500000, 8500000, 0),
(4, 2, 19, NULL, 4, 1850000, 7400000, 0),
(5, 2, 17, NULL, 1, 520000, 520000, 0),
(6, 3, 20, NULL, 1, 3900000, 3900000, 0),
(7, 3, 21, NULL, 1, 2700000, 2700000, 0),
(8, 3, 22, NULL, 1, 1850000, 1850000, 0),
(9, 4, 23, NULL, 2, 680000, 1360000, 100000),
(10, 4, 24, NULL, 1, 450000, 450000, 50000),
(11, 4, 10, NULL, 1, 280000, 280000, 30000),
(12, 4, 17, NULL, 3, 520000, 1560000, 20000);
SET IDENTITY_INSERT ChiTietDonHang OFF;
GO

-- GIO HANG
SET IDENTITY_INSERT GioHang ON;
INSERT INTO GioHang (MaGioHang, MaND, MaSP, SoLuong, GiaTaiThoiDiemMua) VALUES
(1, 2, 2, 1, 13500000),
(2, 2, 20, 1, 3900000),
(3, 3, 11, 1, 15900000),
(4, 3, 5, 1, 2800000),
(5, 4, 23, 2, 680000),
(6, 4, 19, 1, 1850000),
(7, 5, 21, 1, 2700000);
SET IDENTITY_INSERT GioHang OFF;
GO

-- DANH GIA
SET IDENTITY_INSERT DanhGia ON;
INSERT INTO DanhGia (MaDanhGia, MaSP, MaND, SoSao, TieuDe, NoiDung, TrangThai) VALUES
(1, 1, 2, 5, N'Sofa đẹp vượt mong đợi!', N'Sofa vải nhung màu xanh navy như hình, giao hàng nhanh, đóng gói cẩn thận. Ngồi rất êm, màu đẹp, phù hợp phòng khách nhà tôi. Shop tư vấn nhiệt tình, sẽ ủng hộ tiếp!', 'approved'),
(2, 1, 3, 4, N'Chất lượng tốt nhưng giao hơi chậm', N'Sofa chất lượng tốt, màu sắc đúng như hình. Giao hàng chậm 2 ngày so với dự kiến. Ngoài ra thì rất hài lòng.', 'approved'),
(3, 11, 2, 5, N'Giường xứng đáng với giá tiền', N'Giường gỗ sồi rất chắc chắn, đầu giường bọc nỉ sang trọng. Ngủ rất ngon. Nhân viên giao hàng hỗ trợ đặt giường tận phòng. Tuyệt vời!', 'approved'),
(4, 20, 4, 5, N'Bàn làm việc chất lượng cao', N'Bàn làm việc đẹp, ngăn kéo rộng, chân sắt chắc chắn. Đúng như mô tả. Đáng đồng tiền!', 'approved'),
(5, 21, 3, 4, N'Ghế ergonomic tốt, ngồi không đau lưng', N'Ghế văn phòng lưng lưới mesh rất thoáng, ngồi lâu không bị đau lưng như ghế cũ. Đệm ngồi hơi mỏng, nên mua thêm đệm.', 'approved'),
(6, 23, 5, 5, N'Tranh canvas treo phòng khách rất đẹp', N'Bộ tranh 3 mảnh đẹp xuất sắc, màu sắc rực rỡ, chất lượng in sắc nét. Khung nhôm chắc chắn. Phòng khách lên hẳn 1 tone!', 'approved'),
(7, 24, 2, 5, N'Bình hoa gốm xinh xắn', N'Bình hoa gốm trắng đẹp y hình, kích thước vừa đặt bàn trà. Chất gốm mịn, trông rất sang. Giao nhanh!', 'approved'),
(8, 25, 4, 5, N'Cây giả y như thật!', N'Cây xương rồng giả nhìn y như thật, chậu gốm trắng xinh. Đặt phòng khách rất đẹp. Không phải tưới nước tiện lợi!', 'approved'),
(9, 18, 2, 3, N'Bàn ổn nhưng giao hơi trầy', N'Bàn ăn gỗ sồi chắc chắn, màu đẹp. Tuy nhiên giao hàng bị trầy nhẹ 1 góc. Shop đã hỗ trợ bồi thường voucher. Thái độ tốt.', 'approved');
SET IDENTITY_INSERT DanhGia OFF;
GO

-- VOUCHER
SET IDENTITY_INSERT Voucher ON;
INSERT INTO Voucher (MaVoucher, TenVoucher, MaCode, LoaiGiam, GiaTriGiam, GiaTriToiDa, DonHangToiThieu, SoLuong, NgayBatDau, NgayKetThuc, TrangThai) VALUES
(1, N'Giảm 15% cho đơn hàng đầu tiên', 'WELCOME15', 'phan_tram', 15, 300000, 0, 200, '2026-01-01', '2026-12-31', 'active'),
(2, N'Giảm 50K cho đơn từ 500K', 'GIAM50K', 'so_tien', 50000, NULL, 500000, 500, '2026-01-01', '2026-12-31', 'active'),
(3, N'Free Ship cho đơn từ 2 triệu', 'FREESHIP2M', 'so_tien', 30000, NULL, 2000000, 1000, '2026-01-01', '2026-12-31', 'active'),
(4, N'Giảm 10% cho khách VIP', 'VIP10', 'phan_tram', 10, 500000, 1000000, 50, '2026-01-01', '2026-12-31', 'active'),
(5, N'Giảm 20% dịp sinh nhật NoiThatXin', 'SINHNHAT20', 'phan_tram', 20, 1000000, 0, 100, '2026-06-01', '2026-06-30', 'active');
SET IDENTITY_INSERT Voucher OFF;
GO

-- CAU HINH HE THONG
SET IDENTITY_INSERT CauHinhHeThong ON;
INSERT INTO CauHinhHeThong (MaCH, KhoiTao, GiaTri, MoTa) VALUES
(1, 'SITE_NAME', 'NoiThatXin', N'Tên website'),
(2, 'SITE_SLOGAN', N'Nội Thất Thông Minh - Tìm Kiếm Bằng Hình Ảnh', 'Slogan'),
(3, 'SITE_DESCRIPTION', N'Chuyên cung cấp nội thất chất lượng cao cho không gian sống hiện đại', N'Mô tả SEO'),
(4, 'HOTLINE', '0909123456', N'Số hotline'),
(5, 'EMAIL', 'NoiThatXin@gmail.com', N'Email liên hệ'),
(6, 'ADDRESS', N'140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP.HCM', N'Địa chỉ'),
(7, 'LOGO_URL', '/Pic/Pic_LogoShop/logoNoiThatXin.png', N'URL logo'),
(8, 'LOGO_FOOTER_URL', '/Pic/Pic_LogoShop/LogoShop_NgangFullXanh.jpg', N'URL logo footer'),
(9, 'PHI_VAN_CHUYEN_MAC_DINH', '30000', N'Phí vận chuyển mặc định (VNĐ)'),
(10, 'NGUONG_FREESHIP', '2000000', N'Đơn hàng từ x triệu thì freeship (VNĐ)'),
(11, 'TIEN_COC_TOI_THIEU', '0', N'Tiền cọc tối thiểu (% đơn hàng)'),
(12, 'YOLO_CONFIDENCE_THRESHOLD', '0.25', N'Ngưỡng confidence của YOLOv12'),
(13, 'AI_TOP_K_RESULTS', '10', N'Số lượng kết quả tìm kiếm AI'),
(14, 'EMBEDDING_DIM', '384', N'Chiều vector ViT-Small'),
(15, 'EMBEDDING_MODEL', 'vit_small_patch16_224', N'Vision Transformer model'),
(16, 'YOLO_MODEL', 'yolov8n.pt', N'YOLO model file'),
(17, 'MAX_UPLOAD_SIZE_MB', '16', N'Kích thước ảnh upload tối đa (MB)'),
(18, 'JWT_SECRET', 'change-this-secret-key-in-production', N'JWT secret key'),
(19, 'JWT_EXPIRE_HOURS', '24', N'JWT token hết hạn sau x giờ'),
(20, 'PAGINATION_LIMIT', '12', N'Số sản phẩm mỗi trang');
SET IDENTITY_INSERT CauHinhHeThong OFF;
GO

-- BANNER
SET IDENTITY_INSERT Banner ON;
INSERT INTO Banner (MaBanner, TenBanner, Loai, DuongDanAnh, LinkDen, ChuThich, ViTriHienThi, ThuTu, NgayBatDau, NgayKetThuc, TrangThai) VALUES
(1, N'Banner Sale Lớn Mùa Hè', 'carousel', '/Pic/Pic_TrangChu/Pic_Carousel/Carousel5.jpg', '/TrangDanhMucSanPham/TrangSanPham.html', N'GIẢM ĐẾN 60%', 1, 1, '2026-05-01', '2026-06-30', 'active'),
(2, N'Banner Nội Thất Phòng Khách', 'carousel', '/Pic/Pic_TrangChu/Pic_Carousel/Carousel6.jpg', '/TrangDanhMucSanPham/TrangSanPham.html?phong=phong-khach', N'NỘI THẤT PHÒNG KHÁCH', 2, 2, '2026-05-01', '2026-12-31', 'active'),
(3, N'Banner Ngoài Trời', 'carousel', '/Pic/Pic_TrangChu/Pic_Carousel/Carousel7.jpg', '/TrangDanhMucSanPham/TrangSanPham.html?phong=ngoai-troi', N'NGOÀI TRỜI GIẢM 40%', 3, 3, '2026-05-01', '2026-08-31', 'active'),
(4, N'Banner Khuyến Mãi', 'banner_small', '/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia4.jpg', '/TrangDanhMucSanPham/TrangSanPham.html?khuyenMai=1', N'Ưu đãi đặc biệt', 1, 1, '2026-05-01', '2026-12-31', 'active'),
(5, N'Banner Phòng Ngủ', 'banner_small', '/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia6.jpg', '/TrangDanhMucSanPham/TrangSanPham.html?phong=phong-ngu', N'GIẢM 30% PHÒNG NGỦ', 1, 2, '2026-05-01', '2026-12-31', 'active'),
(6, N'Banner Bộ Sưu Tập Mới', 'banner_small', '/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia7.jpg', '/TrangDanhMucSanPham/TrangSanPham.html?noiBat=1', N'BỘ SƯU TẬP MỚI', 1, 3, '2026-05-01', '2026-12-31', 'active');
SET IDENTITY_INSERT Banner OFF;
GO

-- ============================================================
-- ============================================================
-- VIEWS THONG KE
-- ============================================================
-- ============================================================
IF OBJECT_ID('v_DashboardTongQuan', 'V') IS NOT NULL DROP VIEW v_DashboardTongQuan;
GO
CREATE VIEW v_DashboardTongQuan AS
SELECT
    (SELECT COUNT(*) FROM SanPham WHERE TrangThai = 'active') AS TongSanPham,
    (SELECT COUNT(*) FROM NguoiDung WHERE VaiTro = 'customer' AND TrangThai = 'active') AS TongKhachHang,
    (SELECT COUNT(*) FROM DonHang) AS TongDonHang,
    (SELECT ISNULL(SUM(TongTienSauGiam), 0) FROM DonHang WHERE TrangThaiThanhToan = 'da_thanh_toan' AND YEAR(NgayDat) = YEAR(GETDATE())) AS TongDoanhThuNam,
    (SELECT ISNULL(SUM(TongTienSauGiam), 0) FROM DonHang WHERE TrangThaiThanhToan = 'da_thanh_toan' AND CAST(NgayDat AS DATE) = CAST(GETDATE() AS DATE)) AS DoanhThuHomNay,
    (SELECT COUNT(*) FROM DonHang WHERE CAST(NgayDat AS DATE) = CAST(GETDATE() AS DATE)) AS DonHangHomNay,
    (SELECT COUNT(*) FROM NguoiDung WHERE VaiTro = 'customer' AND TrangThai = 'active' AND CAST(NgayTao AS DATE) = CAST(GETDATE() AS DATE)) AS KhachHangMoiHomNay,
    (SELECT COUNT(*) FROM DonHang WHERE TrangThaiDonHang = 'cho_xac_nhan') AS DonChoXacNhan,
    (SELECT COUNT(*) FROM SanPham WHERE SoLuongTon <= 5 AND SoLuongTon > 0) AS SanPhamSapHetHang,
    (SELECT COUNT(*) FROM SanPham WHERE SoLuongTon = 0) AS SanPhamHetHang;
GO

IF OBJECT_ID('v_DoanhThuTheoNgay', 'V') IS NOT NULL DROP VIEW v_DoanhThuTheoNgay;
GO
CREATE VIEW v_DoanhThuTheoNgay AS
SELECT
    CAST(NgayDat AS DATE) AS Ngay,
    COUNT(*) AS SoDonHang,
    SUM(TongTienSauGiam) AS TongDoanhThu,
    SUM(CASE WHEN TrangThaiThanhToan = 'da_thanh_toan' THEN TongTienSauGiam ELSE 0 END) AS DaThanhToan
FROM DonHang
WHERE NgayDat >= DATEADD(DAY, -7, CAST(GETDATE() AS DATE))
GROUP BY CAST(NgayDat AS DATE);
GO

IF OBJECT_ID('v_TopSanPhamBanChay', 'V') IS NOT NULL DROP VIEW v_TopSanPhamBanChay;
GO
CREATE VIEW v_TopSanPhamBanChay AS
SELECT TOP 20
    sp.MaSP, sp.TenSP, sp.HinhAnh, sp.GiaBan,
    ISNULL(SUM(ctdh.SoLuong), 0) AS TongSoLuongBan,
    ISNULL(SUM(ctdh.ThanhTien), 0) AS TongDoanhThu,
    sp.SoLuotXem,
    ROUND(AVG(CAST(dg.SoSao AS FLOAT)), 1) AS DiemDanhGiaTrungBinh,
    (SELECT COUNT(*) FROM DanhGia dg2 WHERE dg2.MaSP = sp.MaSP) AS SoDanhGia
FROM SanPham sp
LEFT JOIN ChiTietDonHang ctdh ON sp.MaSP = ctdh.MaSP
LEFT JOIN DonHang dh ON ctdh.MaDonHang = dh.MaDonHang AND dh.TrangThaiDonHang <> 'da_huy'
LEFT JOIN DanhGia dg ON sp.MaSP = dg.MaSP
GROUP BY sp.MaSP, sp.TenSP, sp.HinhAnh, sp.GiaBan, sp.SoLuotXem
ORDER BY TongSoLuongBan DESC;
GO

IF OBJECT_ID('v_DonHangGanhDay', 'V') IS NOT NULL DROP VIEW v_DonHangGanhDay;
GO
CREATE VIEW v_DonHangGanhDay AS
SELECT TOP 50
    dh.MaDonHang, dh.MaDonHangHienThi, dh.NgayDat,
    nd.HoTen AS TenKhachHang, nd.SoDienThoai,
    dh.TongTienSauGiam, dh.TrangThaiDonHang, dh.TrangThaiThanhToan,
    dh.PhuongThucThanhToan,
    COUNT(ctdh.MaCTDH) AS SoSanPham,
    DATEDIFF(HOUR, dh.NgayDat, GETDATE()) AS GioTuLucDat
FROM DonHang dh
JOIN NguoiDung nd ON dh.MaND = nd.MaND
LEFT JOIN ChiTietDonHang ctdh ON dh.MaDonHang = ctdh.MaDonHang
GROUP BY dh.MaDonHang, dh.MaDonHangHienThi, dh.NgayDat, nd.HoTen, nd.SoDienThoai,
         dh.TongTienSauGiam, dh.TrangThaiDonHang, dh.TrangThaiThanhToan, dh.PhuongThucThanhToan
ORDER BY dh.NgayDat DESC;
GO

IF OBJECT_ID('v_SanPhamNoiBat', 'V') IS NOT NULL DROP VIEW v_SanPhamNoiBat;
GO
CREATE VIEW v_SanPhamNoiBat AS
SELECT sp.*,
    ROUND(AVG(CAST(dg.SoSao AS FLOAT)), 1) AS DiemDanhGia,
    (SELECT COUNT(*) FROM DanhGia WHERE MaSP = sp.MaSP) AS SoDanhGia
FROM SanPham sp
LEFT JOIN DanhGia dg ON sp.MaSP = dg.MaSP
WHERE sp.TrangThai = 'active' AND sp.NoiBat = 1
GROUP BY sp.MaSP, sp.TenSP, sp.MoTa, sp.MoTaChiTiet, sp.GiaGoc, sp.GiaBan, sp.SoLuongTon,
         sp.HinhAnh, sp.HinhAnhPhu1, sp.HinhAnhPhu2, sp.HinhAnhPhu3, sp.HinhAnhPhu4,
         sp.MaLoai, sp.MaDanhMuc, sp.MaPhong, sp.ThuongHieu, sp.XuatXu, sp.ChatLieu,
         sp.MauSac, sp.KichThuoc, sp.TrongLuong, sp.BaoHanh, sp.KhuyenMai, sp.NoiBat,
         sp.BanChay, sp.TrangThai, sp.EmbeddingVector, sp.YOLOLabel, sp.YOLOConfidence,
         sp.MetaTitle, sp.MetaDescription, sp.SoLuotXem, sp.SoLuotMua, sp.NgayTao, sp.NgayCapNhat;
GO

-- ============================================================
-- STORED PROCEDURES
-- ============================================================
IF OBJECT_ID('sp_TaoMaDonHangHienThi', 'P') IS NOT NULL DROP PROCEDURE sp_TaoMaDonHangHienThi;
GO
CREATE PROCEDURE sp_TaoMaDonHangHienThi
    @p_MaDonHang INT,
    @p_MaHienThi NVARCHAR(20) OUTPUT
AS
BEGIN
    SET @p_MaHienThi = 'NDX-' + RIGHT('00000' + CAST(@p_MaDonHang AS NVARCHAR(5)), 5);
END;
GO

IF OBJECT_ID('sp_CapNhatTrangThaiDonHang', 'P') IS NOT NULL DROP PROCEDURE sp_CapNhatTrangThaiDonHang;
GO
CREATE PROCEDURE sp_CapNhatTrangThaiDonHang
    @p_MaDonHang INT,
    @p_TrangThaiMoi NVARCHAR(50)
AS
BEGIN
    UPDATE DonHang SET TrangThaiDonHang = @p_TrangThaiMoi WHERE MaDonHang = @p_MaDonHang;
    IF @p_TrangThaiMoi = 'da_xac_nhan'
        UPDATE DonHang SET NgayXacNhan = GETDATE() WHERE MaDonHang = @p_MaDonHang;
    ELSE IF @p_TrangThaiMoi = 'da_giao_hang'
        UPDATE DonHang SET NgayNhanHang = GETDATE() WHERE MaDonHang = @p_MaDonHang;
    ELSE IF @p_TrangThaiMoi = 'da_huy'
        UPDATE DonHang SET NgayHuy = GETDATE() WHERE MaDonHang = @p_MaDonHang;
END;
GO

IF OBJECT_ID('sp_CapNhatSoLuongVoucher', 'P') IS NOT NULL DROP PROCEDURE sp_CapNhatSoLuongVoucher;
GO
CREATE PROCEDURE sp_CapNhatSoLuongVoucher
    @p_MaVoucher INT
AS
BEGIN
    UPDATE Voucher SET DaSuDung = DaSuDung + 1 WHERE MaVoucher = @p_MaVoucher;
END;
GO

-- ============================================================
-- TRIGGERS
-- ============================================================
IF OBJECT_ID('trg_CapNhatTonKho_SauDatHang', 'TR') IS NOT NULL DROP TRIGGER trg_CapNhatTonKho_SauDatHang;
GO
CREATE TRIGGER trg_CapNhatTonKho_SauDatHang
ON ChiTietDonHang
AFTER INSERT
AS
BEGIN
    UPDATE SanPham SET SoLuongTon = SoLuongTon - i.SoLuong, SoLuotMua = SoLuotMua + i.SoLuong
    FROM SanPham sp
    JOIN inserted i ON sp.MaSP = i.MaSP;

    UPDATE SanPham SET TrangThai = 'out_of_stock'
    FROM SanPham sp
    JOIN inserted i ON sp.MaSP = i.MaSP
    WHERE sp.SoLuongTon <= 0;
END;
GO

IF OBJECT_ID('trg_TaoMaDonHangHienThi', 'TR') IS NOT NULL DROP TRIGGER trg_TaoMaDonHangHienThi;
GO
CREATE TRIGGER trg_TaoMaDonHangHienThi
ON DonHang
AFTER INSERT
AS
BEGIN
    UPDATE DonHang SET MaDonHangHienThi = 'NDX-' + RIGHT('00000' + CAST(i.MaDonHang AS NVARCHAR(5)), 5)
    FROM DonHang dh
    JOIN inserted i ON dh.MaDonHang = i.MaDonHang;
END;
GO

IF OBJECT_ID('trg_GiamSoLuongVoucher', 'TR') IS NOT NULL DROP TRIGGER trg_GiamSoLuongVoucher;
GO
CREATE TRIGGER trg_GiamSoLuongVoucher
ON LichSuSuDungVoucher
AFTER INSERT
AS
BEGIN
    UPDATE Voucher SET DaSuDung = DaSuDung + 1
    FROM Voucher v
    JOIN inserted i ON v.MaVoucher = i.MaVoucher;
END;
GO

-- ============================================================
-- INDEXES BO SUNG
-- ============================================================
CREATE INDEX idx_sp_gia_dm ON SanPham(GiaBan, MaDanhMuc, TrangThai);
CREATE INDEX idx_sp_luot_mua ON SanPham(SoLuotMua DESC);
CREATE INDEX idx_dh_trangthai_ngay ON DonHang(TrangThaiDonHang, NgayDat);
CREATE INDEX idx_dg_sosao ON DanhGia(SoSao DESC);
CREATE INDEX idx_gh_ma_nd ON GioHang(MaND);
CREATE INDEX idx_voucher_code ON Voucher(MaCode);
CREATE INDEX idx_banner_trang_thai ON Banner(TrangThai, NgayBatDau, NgayKetThuc);
GO

-- ============================================================
-- HOAN TAN - Script SQL da san sang
-- ============================================================
-- Chay script nay trong SQL Server Management Studio (SSMS).
-- Database: noithatxin_db
-- Username admin: admin / Password: 123456 (da hash bcrypt)
-- ============================================================
