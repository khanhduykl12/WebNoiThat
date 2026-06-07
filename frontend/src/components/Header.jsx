import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';

const ROOMS = [
  { label: 'Phòng khách', param: 'phong-khach' },
  { label: 'Phòng ngủ', param: 'phong-ngu' },
  { label: 'Phòng bếp', param: 'phong-bep' },
  { label: 'Phòng tắm', param: 'phong-tam' },
  { label: 'Ngoài trời', param: 'ngoai-troi' },
];

const CATEGORIES = [
  { label: 'Sofa', param: 'sofa' },
  { label: 'Giường', param: 'giuong' },
  { label: 'Bàn', param: 'ban' },
  { label: 'Ghế', param: 'ghe' },
  { label: 'Tủ', param: 'tu' },
  { label: 'Đèn', param: 'den' },
  { label: 'Trang trí', param: 'trang-tri' },
  { label: 'Kệ', param: 'ke' },
  { label: 'Gương', param: 'guong' },
  { label: 'Thảm', param: 'tham' },
];

export default function Header({ onOpenSearch, cartCount = 0, user = null, onLogout, onCartCountChange }) {
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
    onCartCountChange?.(0);
    window.location.href = '../Login/DangNhap.html';
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      onOpenSearch?.('text');
    }
  };

  const handleCartClick = () => {
    window.location.href = '/GioHang';
  };

  return (
    <header className="site-header sticky-top">
      {/* Top bar */}
      <div className="header-top-bar">
        <span>
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
          Địa điểm
        </span>
        <span>
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M3 4h10.5l-2.25 3H5.25L3 4z"/></svg>
          Miễn phí giao hàng cho đơn từ 2.000.000đ
        </span>
      </div>

      {/* Main bar */}
      <div className="header-main-bar">
        <button
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          style={{ color: '#1a1a1a' }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Search */}
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="outline-none"
            onKeyDown={handleSearchKeyDown}
            aria-label="Tìm kiếm sản phẩm"
          />
          <button onClick={() => onOpenSearch?.('text')} aria-label="Tìm kiếm">
            <Search size={17} />
          </button>
          <button
            onClick={() => onOpenSearch?.()}
            aria-label="Tìm kiếm nâng cao"
            style={{ borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: '10px', marginLeft: '2px' }}
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>

        {/* Logo */}
        <div className="header-logo-center">
          <a href="/">
            <img
              src="http://localhost:5000/Pic/Pic_LogoShop/logoNoiThatXin.png"
              alt="NoiThatXin"
              onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_LogoShop/logoNoiThatXin.png'; e.onError = null; }}
            />
          </a>
        </div>

        {/* Actions */}
        <div className="header-actions-right">
          {user ? (
            <>
              <span className="greeting">
                Xin chào, <strong>{user.HoTen || user.TenDangNhap}</strong>
              </span>
              <button onClick={handleLogout} className="btn-logout">
                <LogOut size={14} />
                Đăng xuất
              </button>
            </>
          ) : (
            <a href="/DangNhap" className="btn-login-link">
              <button type="button" className="btn-login-text">
                <User size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Đăng nhập
              </button>
            </a>
          )}

          <a href="/GioHang" className="btn-cart-icon" aria-label="Giỏ hàng">
            <ShoppingCart size={23} />
            {cartCount > 0 && (
              <span className="badge">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </a>
        </div>
      </div>

      {/* Nav */}
      <nav className={`main-nav-bar ${menuOpen ? 'flex flex-col !items-start !gap-0 !px-4' : 'hidden'} lg:flex`}>
        <a href="/" className="nav-link-item">Trang chủ</a>

        {/* Danh mục */}
        <div
          className="nav-dropdown"
          onMouseEnter={() => setOpenDropdown('danh-muc')}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <a href="/SanPham" className="nav-link-item">Danh mục ▾</a>
          {openDropdown === 'danh-muc' && (
            <div className="nav-dropdown-content" style={{ minWidth: '360px', padding: '10px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                <div>
                  <div style={{ padding: '6px 18px', fontSize: '11px', fontWeight: 800, color: '#1E4D36', letterSpacing: '1px', textTransform: 'uppercase' }}>Theo phòng</div>
                  {ROOMS.map((r) => (
                    <a key={r.param} href={`/SanPham?phong=${r.param}`} style={{ padding: '8px 18px', display: 'block', fontSize: '13px', color: '#333', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(30,77,54,0.07)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                      {r.label}
                    </a>
                  ))}
                </div>
                <div>
                  <div style={{ padding: '6px 18px', fontSize: '11px', fontWeight: 800, color: '#1E4D36', letterSpacing: '1px', textTransform: 'uppercase' }}>Theo loại</div>
                  {CATEGORIES.map((c) => (
                    <a key={c.param} href={`/SanPham?ma_danh_muc=${c.param}`} style={{ padding: '8px 18px', display: 'block', fontSize: '13px', color: '#333', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(30,77,54,0.07)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                      {c.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Phòng khách */}
        <div className="nav-dropdown" onMouseEnter={() => setOpenDropdown('phong-khach')} onMouseLeave={() => setOpenDropdown(null)}>
          <a href="/SanPham?phong=phong-khach" className="nav-link-item">Phòng khách ▾</a>
          {openDropdown === 'phong-khach' && (
            <div className="nav-dropdown-content">
              <ul style={{ listStyle: 'none', padding: '6px 0', margin: 0 }}>
                <li><a href="/SanPham?phong=phong-khach">Xem tất cả</a></li>
                <li><a href="/SanPham?phong=phong-khach&ma_danh_muc=sofa">Sofa</a></li>
                <li><a href="/SanPham?phong=phong-khach&ma_danh_muc=ban">Bàn</a></li>
                <li><a href="/SanPham?phong=phong-khach&ma_danh_muc=ghe">Ghế</a></li>
                <li><a href="/SanPham?phong=phong-khach&ma_danh_muc=tu">Tủ</a></li>
                <li><a href="/SanPham?phong=phong-khach&ma_danh_muc=trang-tri">Trang trí</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* Phòng ngủ */}
        <div className="nav-dropdown" onMouseEnter={() => setOpenDropdown('phong-ngu')} onMouseLeave={() => setOpenDropdown(null)}>
          <a href="/SanPham?phong=phong-ngu" className="nav-link-item">Phòng ngủ ▾</a>
          {openDropdown === 'phong-ngu' && (
            <div className="nav-dropdown-content">
              <ul style={{ listStyle: 'none', padding: '6px 0', margin: 0 }}>
                <li><a href="/SanPham?phong=phong-ngu">Xem tất cả</a></li>
                <li><a href="/SanPham?phong=phong-ngu&ma_danh_muc=giuong">Giường</a></li>
                <li><a href="/SanPham?phong=phong-ngu&ma_danh_muc=ban">Bàn</a></li>
                <li><a href="/SanPham?phong=phong-ngu&ma_danh_muc=ghe">Ghế</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* Phòng bếp */}
        <div className="nav-dropdown" onMouseEnter={() => setOpenDropdown('phong-bep')} onMouseLeave={() => setOpenDropdown(null)}>
          <a href="/SanPham?phong=phong-bep" className="nav-link-item">Phòng bếp ▾</a>
          {openDropdown === 'phong-bep' && (
            <div className="nav-dropdown-content">
              <ul style={{ listStyle: 'none', padding: '6px 0', margin: 0 }}>
                <li><a href="/SanPham?phong=phong-bep">Xem tất cả</a></li>
                <li><a href="/SanPham?phong=phong-bep&ma_danh_muc=ban">Bàn ăn</a></li>
                <li><a href="/SanPham?phong=phong-bep&ma_danh_muc=ghe">Ghế ăn</a></li>
                <li><a href="/SanPham?phong=phong-bep&ma_danh_muc=tu">Tủ bếp</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* Phòng tắm */}
        <div className="nav-dropdown" onMouseEnter={() => setOpenDropdown('phong-tam')} onMouseLeave={() => setOpenDropdown(null)}>
          <a href="/SanPham?phong=phong-tam" className="nav-link-item">Phòng tắm ▾</a>
          {openDropdown === 'phong-tam' && (
            <div className="nav-dropdown-content">
              <ul style={{ listStyle: 'none', padding: '6px 0', margin: 0 }}>
                <li><a href="/SanPham?phong=phong-tam">Xem tất cả</a></li>
                <li><a href="/SanPham?phong=phong-tam&ma_danh_muc=tu">Tủ phòng tắm</a></li>
                <li><a href="/SanPham?phong=phong-tam&ma_danh_muc=trang-tri">Trang trí</a></li>
              </ul>
            </div>
          )}
        </div>

        <a href="/SanPham" className="nav-link-item">Sản phẩm</a>
        <a href="/GioiThieu" className="nav-link-item">Giới thiệu</a>
        <a href="/LienHe" className="nav-link-item">Liên hệ</a>
      </nav>

      {/* Bottom strip */}
      <div className="header-bottom-strip">
        Miễn phí vận chuyển cho đơn hàng từ 2.000.000đ ‡*
      </div>
    </header>
  );
}
