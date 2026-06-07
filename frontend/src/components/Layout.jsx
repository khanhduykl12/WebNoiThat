import Header from './Header';
import Footer from './Footer';
import SearchModal from './SearchModal';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTab, setSearchTab] = useState('text');
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

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
        onCartCountChange={setCartCount}
      />
      <main className="flex-grow-1 p-0">
        {children}
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
