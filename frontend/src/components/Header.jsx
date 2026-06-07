import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { formatPrice } from '../services/api';

const ROOMS = [
  { label: 'Phòng khách', param: 'phong-khach' },
  { label: 'Phòng ngủ', param: 'phong-ngu' },
  { label: 'Phòng bếp', param: 'phong-bep' },
  { label: 'Phòng tắm', param: 'phong-tam' },
  { label: 'Ngoài trời', param: 'ngoai-troi' },
];

export default function Header({ onOpenSearch, cartCount = 0, user = null, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (saved && token) {
      try { onLogout(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    onLogout?.(null);
    window.location.href = '../Login/DangNhap.html';
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      onOpenSearch?.('text');
    }
  };

  return (
    <header className="site-header sticky top-0 z-50 shadow-md">
      {/* Top dark bar */}
      <div className="header-top-bar">
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
          Địa điểm
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M3 4h10.5l-2.25 3H5.25L3 4z"/></svg>
          Miễn phí giao hàng cho đơn từ 2.000.000đ
        </span>
      </div>

      {/* Main header bar */}
      <div className="header-main-bar">
        {/* Mobile menu */}
        <button
          className="lg:hidden text-gray-700 p-2 -ml-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Search box — left side */}
        <div className="search-input-wrap">
          <input
            type="text"
            id="searchProductInput"
            placeholder="Nhập tên sản phẩm..."
            className="flex-1 outline-none text-sm text-gray-800"
            onKeyDown={handleSearchKeyDown}
          />
          <button
            className="p-1 text-gray-500 hover:text-primary transition-colors"
            onClick={() => onOpenSearch?.('text')}
            aria-label="Tìm kiếm"
          >
            <Search size={18} />
          </button>
          <button
            className="p-1 text-gray-500 hover:text-primary transition-colors border-l border-gray-300 pl-2"
            onClick={() => onOpenSearch?.()}
            aria-label="Tìm kiếm nâng cao"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Logo — center */}
        <div className="header-logo-center">
          <a href="../TrangChu/TrangChu.html" className="flex items-center justify-center">
            <img
              src="http://localhost:5000/Pic/Pic_LogoShop/logoNoiThatXin.png"
              alt="NoiThatXin Logo"
              className="h-16 object-contain"
              onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_LogoShop/logoNoiThatXin.png'; }}
            />
          </a>
        </div>

        {/* Actions — right side */}
        <div className="header-actions-right">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-700 text-sm hidden sm:block font-medium">
                Xin chào, {user.HoTen || user.TenDangNhap}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 text-sm transition-colors"
              >
                <LogOut size={15} />
                Đăng xuất
              </button>
            </div>
          ) : (
            <a href="../Login/DangNhap.html" className="btn-login-link">
              <button type="button" className="btn-login-text">Đăng nhập</button>
            </a>
          )}

          <a href="../TrangThanhToan/GioHang.html" className="btn-cart-icon" aria-label="Giỏ hàng">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="badge">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </a>
        </div>
      </div>

      {/* Nav bar */}
      <nav className={`main-nav-bar ${menuOpen ? 'flex flex-col' : 'hidden'} lg:flex`}>
        <a href="../TrangChu/TrangChu.html" className="nav-link-item">
          Trang chủ
        </a>

        {/* Danh mục dropdown */}
        <div
          className="nav-dropdown"
          onMouseEnter={() => setOpenDropdown('danh-muc')}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <a href="../TrangDanhMucSanPham/TrangSanPham.html" className="nav-link-item">
            Danh mục ▾
          </a>
          {openDropdown === 'danh-muc' && (
            <div className="nav-dropdown-content">
              <ul className="p-0 m-0" style={{ listStyle: 'none' }}>
                {ROOMS.map((room) => (
                  <li key={room.param}>
                    <a href={`../TrangDanhMucSanPham/TrangSanPham.html?phong=${room.param}`}>
                      {room.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Phòng khách */}
        <div
          className="nav-dropdown"
          onMouseEnter={() => setOpenDropdown('phong-khach')}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <a href="../TrangDanhMucSanPham/TrangSanPham.html" className="nav-link-item">
            Phòng khách ▾
          </a>
          {openDropdown === 'phong-khach' && (
            <div className="nav-dropdown-content">
              <ul className="p-0 m-0" style={{ listStyle: 'none' }}>
                <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-khach">Xem tất cả</a></li>
                <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-khach&noi_bat=1">Bộ sưu tập phòng khách mới</a></li>
                <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-khach">Đồ nội thất trang trí</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* Phòng ngủ */}
        <div
          className="nav-dropdown"
          onMouseEnter={() => setOpenDropdown('phong-ngu')}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <a href="../TrangDanhMucSanPham/TrangSanPham.html" className="nav-link-item">
            Phòng ngủ ▾
          </a>
          {openDropdown === 'phong-ngu' && (
            <div className="nav-dropdown-content">
              <ul className="p-0 m-0" style={{ listStyle: 'none' }}>
                <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-ngu">Xem tất cả</a></li>
                <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-ngu&noi_bat=1">Bộ sưu tập phòng ngủ mới</a></li>
                <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-ngu">Đồ nội thất trang trí</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* Phòng bếp */}
        <div
          className="nav-dropdown"
          onMouseEnter={() => setOpenDropdown('phong-bep')}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <a href="../TrangDanhMucSanPham/TrangSanPham.html" className="nav-link-item">
            Phòng bếp ▾
          </a>
          {openDropdown === 'phong-bep' && (
            <div className="nav-dropdown-content">
              <ul className="p-0 m-0" style={{ listStyle: 'none' }}>
                <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-bep">Xem tất cả</a></li>
                <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-bep&noi_bat=1">Bộ sưu tập phòng bếp mới</a></li>
                <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-bep">Đồ nội thất trang trí</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* Phòng tắm */}
        <div
          className="nav-dropdown"
          onMouseEnter={() => setOpenDropdown('phong-tam')}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <a href="../TrangDanhMucSanPham/TrangSanPham.html" className="nav-link-item">
            Phòng tắm ▾
          </a>
          {openDropdown === 'phong-tam' && (
            <div className="nav-dropdown-content">
              <ul className="p-0 m-0" style={{ listStyle: 'none' }}>
                <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-tam">Xem tất cả</a></li>
                <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-tam&noi_bat=1">Bộ sưu tập phòng tắm mới</a></li>
                <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-tam">Đồ nội thất trang trí</a></li>
              </ul>
            </div>
          )}
        </div>

        <a href="../TrangGioiThieu/TrangGioiThieu.html" className="nav-link-item">Giới thiệu</a>
        <a href="../TrangLienHe/TrangLienHe.html" className="nav-link-item">Liên hệ</a>
      </nav>

      {/* Bottom dark strip */}
      <div className="header-bottom-strip">
        Miễn phí vận chuyển cho đơn hàng từ 2.000.000đ ‡*
      </div>
    </header>
  );
}
