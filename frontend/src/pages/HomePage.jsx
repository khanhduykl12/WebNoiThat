import { useState, useEffect } from 'react';
import {
  Home, Globe, Building2, Users, ArrowRight, Flame, Tag, Sofa, Bed, ChefHat, Bath, TreePine
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import DealsCarousel from '../components/DealsCarousel';
import SearchModal from '../components/SearchModal';

const OUTDOOR_BANNERS = [
  {
    img: 'http://localhost:5000/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia4.jpg',
    title: 'Outdoor Living\nUp to 40% Off',
    link: '../TrangDanhMucSanPham/TrangSanPham.html?phong=ngoai-troi',
    caption: 'Outdoor Dining Collection',
  },
  {
    img: 'http://localhost:5000/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia6.jpg',
    title: 'Living Room\nUp to 30% Off',
    link: '../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-khach',
    caption: 'Premium Sofa & Lounge Seating',
  },
  {
    img: 'http://localhost:5000/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia7.jpg',
    title: 'Newest\nCollection',
    link: '../TrangDanhMucSanPham/TrangSanPham.html',
    caption: 'Discover NoiThatXin',
  },
];

const ROOM_ICONS = {
  'phong-khach': <Sofa size={28} />,
  'phong-ngu': <Bed size={28} />,
  'phong-bep': <ChefHat size={28} />,
  'phong-tam': <Bath size={28} />,
  'ngoai-troi': <TreePine size={28} />,
};

const VALUES = [
  {
    icon: <Home size={26} />,
    title: 'Về NoiThatXin',
    desc: 'Hơn 15 năm kiến tạo không gian sống. Cam kết chất lượng, dịch vụ tận tâm.',
    href: '../TrangGioiThieu/TrangGioiThieu.html',
  },
  {
    icon: <Globe size={26} />,
    title: 'Cam Kết Vượt Trội',
    desc: 'Chính sách bảo hành dài hạn, đổi trả linh hoạt, hỗ trợ 24/7 cho mọi khách hàng.',
    href: '#',
  },
  {
    icon: <Building2 size={26} />,
    title: 'Trách Nhiệm Cộng Đồng',
    desc: 'Hoạt động xanh bền vững, hỗ trợ đối tác địa phương và các chương trình từ thiện.',
    href: '#',
  },
  {
    icon: <Users size={26} />,
    title: 'Giới Thiệu Bạn Bè',
    desc: 'Giới thiệu bạn bè, cùng nhau tiết kiệm. Ưu đãi đặc biệt khi mua theo nhóm.',
    href: '#',
  },
];

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTab, setSearchTab] = useState('text');
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try { setUser(JSON.parse(userStr)); } catch {}
    }
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((s, i) => s + (i.SoLuong || 1), 0));
    } catch {}
  }, []);

  const handleLogout = (u) => setUser(u);
  const openSearch = (tab = 'text') => {
    setSearchTab(tab);
    setIsSearchOpen(true);
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header
        onOpenSearch={openSearch}
        cartCount={cartCount}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-grow-1 p-0">

        <HeroBanner />

        {/* Outdoor Banners */}
        {OUTDOOR_BANNERS.map((b, i) => (
          <OutdoorBanner key={i} {...b} />
        ))}

        {/* Hot deals */}
        <DealsCarousel
          title="Sản Phẩm Hot"
          icon={<Flame size={22} />}
          apiParams={{ ban_chay: 1 }}
        />

        {/* Khuyến mãi */}
        <DealsCarousel
          title="Khuyến Mãi Hot"
          icon={<Tag size={22} />}
          apiParams={{ khuyen_mai: 1 }}
        />

        {/* Values */}
        <ValuesSection />

      </main>

      <Footer />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialTab={searchTab}
      />
    </div>
  );
}

function OutdoorBanner({ img, title, link, caption }) {
  const lines = title.split('\n');
  return (
    <div className="outdoor-banner-container">
      <img
        src={img}
        alt={caption || lines[0]}
        className="outdoor-bg-img"
        onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia4.jpg'; }}
      />
      <div className="outdoor-overlay-content">
        <h2 className="outdoor-title" style={{ whiteSpace: 'pre-line' }}>
          {lines.map((line, i) => (
            <span key={i} style={{ display: 'block', lineHeight: 1.2 }}>{line}</span>
          ))}
        </h2>
        <a href={link} className="outdoor-btn-shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          Mua ngay
          <ArrowRight size={14} />
        </a>
      </div>
      {caption && <p className="outdoor-caption-text">{caption}</p>}
    </div>
  );
}

function ValuesSection() {
  return (
    <section className="values-section">
      <h2 className="values-main-heading">
        <span>Our Values</span>
        Tại Sao Chọn NoiThatXin?
      </h2>
      <div className="container">
        <div className="values-grid">
          {VALUES.map((v, i) => (
            <div key={i} className="value-card animate-enter" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="value-icon">{v.icon}</div>
              <h3 className="value-title">{v.title}</h3>
              <p className="value-desc">{v.desc}</p>
              <a
                href={v.href}
                className="d-inline-flex align-items-center gap-1 mt-3"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1E4D36',
                  textDecoration: 'none',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  transition: 'gap 0.2s',
                }}
              >
                Tìm hiểu thêm
                <ArrowRight size={12} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
