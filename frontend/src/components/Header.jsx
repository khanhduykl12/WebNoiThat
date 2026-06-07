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

  return (
    <header className="site-header sticky top-0 z-50 shadow-lg">
      {/* Top strip */}
      <div className="bg-primary-dark text-white text-xs py-1 px-4 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
          Địa điểm
        </span>
        <span className="flex items-center gap-1">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M3 4h10.5l-2.25 3H5.25L3 4z"/></svg>
          Miễn phí giao hàng cho đơn từ 2.000.000đ
        </span>
      </div>

      {/* Main header */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Search box */}
          <div className="flex-1 max-w-xl flex items-center bg-white rounded-full overflow-hidden px-4 py-2">
            <input
              type="text"
              placeholder="Nhập tên sản phẩm..."
              className="flex-1 outline-none text-sm text-gray-800"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onOpenSearch) {
                  onOpenSearch('text');
                }
              }}
            />
            <button
              className="p-1 text-primary hover:text-primary-light"
              onClick={() => onOpenSearch?.('text')}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              className="p-1 text-primary hover:text-primary-light border-l border-gray-300 pl-3"
              onClick={() => onOpenSearch?.()}
              aria-label="Advanced search"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Logo */}
          <a href="../TrangChu/TrangChu.html" className="flex-shrink-0">
            <img
              src="http://localhost:5000/Pic/Pic_LogoShop/logoNoiThatXin.png"
              alt="NoiThatXin Logo"
              className="h-12 object-contain"
              onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_LogoShop/logoNoiThatXin.png'; }}
            />
          </a>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-white text-sm hidden sm:block">
                  Xin chào, {user.HoTen || user.TenDangNhap}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full text-sm transition-colors"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <a
                href="../Login/DangNhap.html"
                className="bg-accent hover:bg-amber-600 text-white px-5 py-2 rounded-full font-bold text-sm transition-colors"
              >
                Đăng nhập
              </a>
            )}

            {/* Cart */}
            <a
              href="../TrangThanhToan/GioHang.html"
              className="relative p-2 text-white hover:text-accent transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className={`bg-primary-light ${menuOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="px-4">
          <ul className="flex flex-col lg:flex-row lg:items-center gap-1 py-2">
            <li>
              <a href="../TrangChu/TrangChu.html" className="block px-4 py-2 text-white hover:bg-primary-dark rounded-lg transition-colors font-semibold">
                Trang chủ
              </a>
            </li>

            {/* Danh mục dropdown */}
            <li
              className="relative"
              onMouseEnter={() => setOpenDropdown('danh-muc')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <a href="../TrangDanhMucSanPham/TrangSanPham.html" className="flex items-center gap-1 px-4 py-2 text-white hover:bg-primary-dark rounded-lg transition-colors font-semibold cursor-pointer">
                Danh mục ▾
              </a>
              {openDropdown === 'danh-muc' && (
                <div className="lg:absolute left-0 top-full mt-1 bg-white rounded-xl shadow-2xl py-3 min-w-[220px] z-50">
                  <ul className="divide-y divide-gray-100">
                    {ROOMS.map((room) => (
                      <li key={room.param}>
                        <a
                          href={`../TrangDanhMucSanPham/TrangSanPham.html?phong=${room.param}`}
                          className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm"
                        >
                          {room.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>

            {/* Phòng khách */}
            <li
              className="relative"
              onMouseEnter={() => setOpenDropdown('phong-khach')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <a className="flex items-center gap-1 px-4 py-2 text-white hover:bg-primary-dark rounded-lg transition-colors font-semibold cursor-pointer">
                Phòng khách ▾
              </a>
              {openDropdown === 'phong-khach' && (
                <div className="lg:absolute left-0 top-full mt-1 bg-white rounded-xl shadow-2xl py-3 min-w-[240px] z-50">
                  <ul className="divide-y divide-gray-100">
                    <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-khach" className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm">Xem tất cả</a></li>
                    <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-khach&noi_bat=1" className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm">Bộ sưu tập mới</a></li>
                    <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-khach" className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm">Đồ nội thất trang trí</a></li>
                  </ul>
                </div>
              )}
            </li>

            {/* Phòng ngủ */}
            <li
              className="relative"
              onMouseEnter={() => setOpenDropdown('phong-ngu')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <a className="flex items-center gap-1 px-4 py-2 text-white hover:bg-primary-dark rounded-lg transition-colors font-semibold cursor-pointer">
                Phòng ngủ ▾
              </a>
              {openDropdown === 'phong-ngu' && (
                <div className="lg:absolute left-0 top-full mt-1 bg-white rounded-xl shadow-2xl py-3 min-w-[240px] z-50">
                  <ul className="divide-y divide-gray-100">
                    <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-ngu" className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm">Xem tất cả</a></li>
                    <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-ngu&noi_bat=1" className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm">Bộ sưu tập mới</a></li>
                    <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-ngu" className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm">Đồ nội thất trang trí</a></li>
                  </ul>
                </div>
              )}
            </li>

            {/* Phòng bếp */}
            <li
              className="relative"
              onMouseEnter={() => setOpenDropdown('phong-bep')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <a className="flex items-center gap-1 px-4 py-2 text-white hover:bg-primary-dark rounded-lg transition-colors font-semibold cursor-pointer">
                Phòng bếp ▾
              </a>
              {openDropdown === 'phong-bep' && (
                <div className="lg:absolute left-0 top-full mt-1 bg-white rounded-xl shadow-2xl py-3 min-w-[240px] z-50">
                  <ul className="divide-y divide-gray-100">
                    <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-bep" className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm">Xem tất cả</a></li>
                    <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-bep&noi_bat=1" className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm">Bộ sưu tập mới</a></li>
                    <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-bep" className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm">Đồ nội thất trang trí</a></li>
                  </ul>
                </div>
              )}
            </li>

            {/* Phòng tắm */}
            <li
              className="relative"
              onMouseEnter={() => setOpenDropdown('phong-tam')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <a className="flex items-center gap-1 px-4 py-2 text-white hover:bg-primary-dark rounded-lg transition-colors font-semibold cursor-pointer">
                Phòng tắm ▾
              </a>
              {openDropdown === 'phong-tam' && (
                <div className="lg:absolute left-0 top-full mt-1 bg-white rounded-xl shadow-2xl py-3 min-w-[240px] z-50">
                  <ul className="divide-y divide-gray-100">
                    <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-tam" className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm">Xem tất cả</a></li>
                    <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-tam&noi_bat=1" className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm">Bộ sưu tập mới</a></li>
                    <li><a href="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-tam" className="block px-5 py-2.5 text-gray-700 hover:bg-primary hover:text-white rounded-lg mx-2 transition-colors text-sm">Đồ nội thất trang trí</a></li>
                  </ul>
                </div>
              )}
            </li>

            <li>
              <a href="../TrangGioiThieu/TrangGioiThieu.html" className="block px-4 py-2 text-white hover:bg-primary-dark rounded-lg transition-colors font-semibold">
                Giới thiệu
              </a>
            </li>
            <li>
              <a href="../TrangLienHe/TrangLienHe.html" className="block px-4 py-2 text-white hover:bg-primary-dark rounded-lg transition-colors font-semibold">
                Liên hệ
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Bottom strip */}
      <div className="bg-primary-dark text-white text-xs py-1.5 text-center font-bold">
        Miễn phí vận chuyển cho đơn hàng từ 2.000.000đ ‡*
      </div>
    </header>
  );
}
