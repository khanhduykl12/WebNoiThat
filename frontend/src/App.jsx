import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/SanPham" element={<ProductListPage />} />
        <Route path="/ChiTiet" element={<ProductDetailPage />} />
        <Route path="/DangNhap" element={<LoginPage />} />
        <Route path="/DangKy" element={<RegisterPage />} />
        <Route path="/GioHang" element={<CartPage />} />
      </Routes>
    </BrowserRouter>
  );
}
