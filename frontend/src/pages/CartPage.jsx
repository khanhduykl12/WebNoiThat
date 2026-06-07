import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { formatPrice } from '../services/api';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [orderNote, setOrderNote] = useState('');
  const [form, setForm] = useState({ HoTen: '', DiaChi: '', SoDienThoai: '', Email: '', payment_method: '' });
  const [formError, setFormError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const token = localStorage.getItem('access_token');
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, HoTen: user.HoTen || '', DiaChi: user.DiaChi || '', SoDienThoai: user.SoDienThoai || '', Email: user.Email || '' }));
    }
  }, []);

  const loadCart = () => {
    if (!token) { setItems([]); setLoading(false); return; }
    fetch('http://localhost:5000/api/cart/', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setItems(items);
        const total = items.reduce((s, i) => s + (i.ThanhTien || 0), 0);
        setSubtotal(total);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCart(); }, []);

  const updateQty = async (MaGioHang, change) => {
    const item = items.find((i) => i.MaGioHang === MaGioHang);
    if (!item) return;
    const newQty = (item.SoLuong || 1) + change;
    if (newQty < 1) return;
    await fetch('http://localhost:5000/api/cart/', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ MaGioHang, SoLuong: newQty }),
    });
    loadCart();
  };

  const removeItem = async (MaGioHang) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    await fetch('http://localhost:5000/api/cart/', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ MaGioHang }),
    });
    loadCart();
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!token) { window.location.href = '/DangNhap'; return; }
    if (!form.HoTen || !form.DiaChi || !form.SoDienThoai || !form.payment_method) {
      setFormError('Vui lòng điền đầy đủ thông tin bắt buộc.'); return;
    }
    setFormError('');
    setPlacing(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          HoTen: form.HoTen,
          DiaChi: form.DiaChi,
          SoDienThoai: form.SoDienThoai,
          Email: form.Email,
          payment_method: form.payment_method,
          GhiChu: orderNote,
        }),
      });
      if (res.ok) {
        setOrderSuccess(true);
        loadCart();
      } else {
        const d = await res.json();
        setFormError(d.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
      }
    } catch {
      setFormError('Không thể kết nối đến server.');
    }
    setPlacing(false);
  };

  if (!token) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-5 text-center">
          <h2 className="text-danger mb-3">Vui lòng đăng nhập để xem giỏ hàng</h2>
          <Link to="/DangNhap" className="btn btn-dark">Đăng nhập ngay</Link>
        </div>
      </Layout>
    );
  }

  if (orderSuccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-5 text-center">
          <div className="order-success-card">
            <div className="success-check">✓</div>
            <h2>Đặt hàng thành công!</h2>
            <p>Cảm ơn bạn đã đặt hàng tại NoiThatXin. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.</p>
            <div className="d-flex gap-3 justify-content-center mt-4">
              <Link to="/" className="btn btn-outline-dark">← Trang chủ</Link>
              <Link to="/SanPham" className="btn btn-dark">Tiếp tục mua sắm</Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-content">
        <div className="page-title-bar">
          <div className="container mx-auto px-4">
            <h1 className="page-heading">Giỏ hàng của bạn</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          <div className="cart-layout">
            {/* Left: Cart items */}
            <div className="cart-items-section">
              <div className="cart-section-header">
                <span className="step-badge">1</span>
                <h2>GIỎ HÀNG ({items.length} sản phẩm)</h2>
              </div>

              {loading ? (
                <div className="cart-loading">
                  <div className="spinner-border text-primary"></div>
                  <span>Đang tải giỏ hàng...</span>
                </div>
              ) : items.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingBag size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                  <h3>Giỏ hàng trống</h3>
                  <p>Khám phá các sản phẩm tuyệt vời của NoiThatXin!</p>
                  <Link to="/SanPham" className="btn btn-dark mt-3">Khám phá ngay</Link>
                </div>
              ) : (
                <div className="cart-table-wrap">
                  <table className="cart-table">
                    <thead>
                      <tr>
                        <th colSpan={2}>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.MaGioHang}>
                          <td className="cart-img-cell">
                            <img src={item.HinhAnh || 'http://localhost:5000/Pic/Pic_SanPham/default.svg'} alt={item.TenSP} onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_SanPham/default.svg'; }} />
                          </td>
                          <td className="cart-name-cell">
                            <Link to={`/ChiTiet?id=${item.MaSP || item.id}`} className="cart-product-name">{item.TenSP}</Link>
                          </td>
                          <td className="cart-price-cell">{formatPrice(item.Gia)}</td>
                          <td className="cart-qty-cell">
                            <div className="qty-control">
                              <button className="qty-btn-sm" onClick={() => updateQty(item.MaGioHang, -1)} disabled={item.SoLuong <= 1}><Minus size={12} /></button>
                              <span className="qty-value">{item.SoLuong}</span>
                              <button className="qty-btn-sm" onClick={() => updateQty(item.MaGioHang, 1)}><Plus size={12} /></button>
                            </div>
                          </td>
                          <td className="cart-total-cell">{formatPrice(item.ThanhTien)}</td>
                          <td>
                            <button className="btn-remove-item" onClick={() => removeItem(item.MaGioHang)} aria-label="Xóa">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right: Summary */}
            <div className="cart-summary-section">
              <div className="cart-summary-card">
                <div className="cart-summary-header">
                  <span className="step-badge">2</span>
                  <h2>TỔNG CỘNG</h2>
                </div>
                <div className="cart-summary-body">
                  <div className="summary-row">
                    <span>Tạm tính</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Phí vận chuyển</span>
                    <strong>{subtotal >= 2000000 ? 'Miễn phí' : formatPrice(30000)}</strong>
                  </div>
                  {subtotal < 2000000 && (
                    <div className="shipping-note">Mua thêm {formatPrice(2000000 - subtotal)} để được miễn phí vận chuyển</div>
                  )}
                  <hr />
                  <div className="summary-row summary-total">
                    <strong>Tổng cộng</strong>
                    <strong className="total-amount">{formatPrice(subtotal)}</strong>
                  </div>
                </div>
              </div>

              {/* Checkout form */}
              <div className="checkout-form-card">
                <div className="cart-section-header">
                  <span className="step-badge">3</span>
                  <h2>THÔNG TIN THANH TOÁN</h2>
                </div>
                <form onSubmit={placeOrder} className="checkout-form">
                  <div className="form-field">
                    <label>Họ và tên <span className="required">*</span></label>
                    <input type="text" value={form.HoTen} onChange={(e) => setForm((f) => ({ ...f, HoTen: e.target.value }))} placeholder="Họ và tên" required />
                  </div>
                  <div className="form-field">
                    <label>Địa chỉ giao hàng <span className="required">*</span></label>
                    <input type="text" value={form.DiaChi} onChange={(e) => setForm((f) => ({ ...f, DiaChi: e.target.value }))} placeholder="Số nhà, đường, phường, quận, thành phố" required />
                  </div>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Số điện thoại <span className="required">*</span></label>
                      <input type="tel" value={form.SoDienThoai} onChange={(e) => setForm((f) => ({ ...f, SoDienThoai: e.target.value }))} placeholder="0909 123 456" required />
                    </div>
                    <div className="form-field">
                      <label>Email (tùy chọn)</label>
                      <input type="email" value={form.Email} onChange={(e) => setForm((f) => ({ ...f, Email: e.target.value }))} placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Phương thức thanh toán <span className="required">*</span></label>
                    <select value={form.payment_method} onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))} required>
                      <option value="">-- Chọn --</option>
                      <option value="cash">Thanh toán tiền mặt (COD)</option>
                      <option value="banking">Chuyển khoản ngân hàng</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Ghi chú đơn hàng</label>
                    <textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} rows={3} placeholder="Ghi chú về đơn hàng..." />
                  </div>
                  {formError && <div className="auth-error">{formError}</div>}
                  <button type="submit" className="btn-checkout-submit" disabled={placing || items.length === 0}>
                    {placing ? 'Đang đặt hàng...' : 'ĐẶT HÀNG NGAY'} <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
