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
    // Load user from localStorage
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u?.MaND) setUser(u);
      } catch {}
    }

    // Load cart count from localStorage
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = cart.reduce((s, i) => s + (i.SoLuong || 1), 0);
      setCartCount(total);
    } catch {}
  }, []);

  const handleLogout = (u) => setUser(u);
  const handleCartUpdate = (count) => setCartCount(count);

  const openSearch = (tab = 'text') => {
    setSearchTab(tab);
    setIsSearchOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onOpenSearch={openSearch}
        cartCount={cartCount}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-0">
        {/* Hero Banner */}
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
          icon={<Flame className="text-red-500" size={24} />}
          apiParams={{ ban_chay: 1 }}
        />

        {/* Outdoor Banner 2 */}
        <OutdoorBanner
          img="http://localhost:5000/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia6.jpg"
          title="Living room up to 30% off**"
          link="../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-khach"
          caption="Relaxation Sofa"
          light
        />

        {/* Khuyến mãi */}
        <DealsCarousel
          title="Khuyến Mãi Hot"
          icon={<Tag className="text-orange-500" size={24} />}
          apiParams={{ khuyen_mai: 1 }}
        />

        {/* Outdoor Banner 3 */}
        <OutdoorBanner
          img="http://localhost:5000/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia7.jpg"
          title="OUR NEWEST COLLECTION"
          link="../TrangDanhMucSanPham/TrangSanPham.html"
          caption="NoiThatXin"
          light
        />

        {/* Values section */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-center text-3xl font-bold text-primary mb-10">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <a
                key={v.title}
                href="#"
                className="group p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all text-center"
              >
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">
                  {v.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2">{v.desc}</p>
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialTab={searchTab}
      />
    </div>
  );
}

function OutdoorBanner({ img, title, link, caption, light }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ maxHeight: '400px' }}>
      <img
        src={img}
        alt={title}
        className="w-full object-cover"
        style={{ height: '400px' }}
        onError={(e) => {
          e.target.src = 'http://localhost:5000/Pic/Pic_TrangChu/Pic_GiamGia/BannerGiamGia4.jpg';
        }}
      />
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
        <h1 className={`text-3xl md:text-5xl font-extrabold mb-4 ${light ? 'text-white' : 'text-white'}`}>
          {title}
        </h1>
        <a
          href={link}
          className={`px-10 py-3.5 rounded-full font-bold tracking-widest text-sm transition-transform hover:scale-105 ${light ? 'bg-white text-gray-900' : 'bg-accent text-white hover:bg-amber-600'}`}
        >
          SHOP OUTDOOR
        </a>
        <p className="mt-4 text-white/70 text-sm">{caption}</p>
      </div>
    </div>
  );
}

const VALUES = [
  {
    icon: '🏠',
    title: 'About NoiThatXin',
    desc: 'Who we are, our legacy, and the purpose that drives us every day.',
  },
  {
    icon: '🌍',
    title: 'Beyond Home Promise',
    desc: "Learn about our retail commitment to the people, planet and organizations we're most passionate about.",
  },
  {
    icon: '🏢',
    title: 'Corporate Social Responsibility',
    desc: 'Get the whole picture on what the NoiThatXin family of companies is doing to help our employees, environment and community.',
  },
  {
    icon: '👥',
    title: 'Refer a friend',
    desc: 'Share with a friend, save with a friend.',
  },
];
