import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import DealsCarousel from '../components/DealsCarousel';
import SearchModal from '../components/SearchModal';
import { Flame, Tag } from 'lucide-react';

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

        {/* Outdoor Banner 1 */}
        <OutdoorBanner
          img="http://localhost:5000/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia4.jpg"
          title="Outdoor up to 40% off**"
          link="../TrangDanhMucSanPham/TrangSanPham.html?phong=ngoai-troi"
          caption="Outdoor Dining Table and 5 Chairs"
        />

        {/* Hot deals */}
        <DealsCarousel
          title="Sản Phẩm Hot"
          icon={<Flame size={22} />}
          apiParams={{ ban_chay: 1 }}
        />

        {/* Outdoor Banner 2 */}
        <OutdoorBanner
          img="http://localhost:5000/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia6.jpg"
          title="Living room up to 30% off**"
          link="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-khach"
          caption="Relaxation Sofa"
        />

        {/* Khuyến mãi */}
        <DealsCarousel
          title="Khuyến Mãi Hot"
          icon={<Tag size={22} />}
          apiParams={{ khuyen_mai: 1 }}
        />

        {/* Outdoor Banner 3 */}
        <OutdoorBanner
          img="http://localhost:5000/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia7.jpg"
          title="OUR NEWEST COLLECTION"
          link="../TrangDanhMucSanPham/TrangSanPham.html"
          caption="NoiThatXin"
        />

        {/* Values section */}
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
  return (
    <div className="outdoor-banner-container">
      <img
        src={img}
        alt={title}
        className="outdoor-bg-img"
        onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia4.jpg'; }}
      />
      <div className="outdoor-overlay-content">
        <h2 className="outdoor-title">{title}</h2>
        <a href={link} className="outdoor-btn-shop">SHOP OUTDOOR</a>
      </div>
      {caption && <p className="outdoor-caption-text">{caption}</p>}
    </div>
  );
}

function ValuesSection() {
  const VALUES = [
    {
      icon: '🏠',
      title: 'About NoiThatXin',
      desc: 'Who we are, our legacy, and the purpose that drives us every day.',
      href: '../TrangGioiThieu/TrangGioiThieu.html',
    },
    {
      icon: '🌍',
      title: 'Beyond Home Promise',
      desc: "Learn about our retail commitment to the people, planet and organizations we're most passionate about.",
      href: '#',
    },
    {
      icon: '🏢',
      title: 'Corporate Social Responsibility',
      desc: "Get the whole picture on what the NoiThatXin family of companies is doing to help our employees, environment and community.",
      href: '#',
    },
    {
      icon: '👥',
      title: 'Refer a friend',
      desc: 'Share with a friend, save with a friend.',
      href: '#',
    },
  ];

  return (
    <section className="values-section">
      <h2 className="values-main-heading">Our Values</h2>
      <div className="container">
        <div className="values-grid">
          {VALUES.map((v, i) => (
            <a key={i} href={v.href} className="text-decoration-none">
              <div className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h3 className="value-title">
                  <a href={v.href}>{v.title}</a>
                </h3>
                <p className="value-desc">{v.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
