import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Lock } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    TenDangNhap: '',
    Email: '',
    HoTen: '',
    MatKhau: '',
    XacNhanMk: '',
    GioiTinh: '',
    SoDienThoai: '',
    DiaChi: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.TenDangNhap || !form.Email || !form.HoTen || !form.MatKhau || !form.GioiTinh || !form.SoDienThoai || !form.DiaChi) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.'); return;
    }
    if (form.MatKhau !== form.XacNhanMk) {
      setError('Mật khẩu xác nhận không khớp!'); return;
    }
    if (form.MatKhau.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.'); return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TenDangNhap: form.TenDangNhap,
          Email: form.Email,
          HoTen: form.HoTen,
          MatKhau: form.MatKhau,
          GioiTinh: form.GioiTinh,
          SoDienThoai: form.SoDienThoai,
          DiaChi: form.DiaChi,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { window.location.href = '/DangNhap'; }, 2000);
      } else {
        setError(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch {
      setError('Không thể kết nối đến server.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-success">
          <div className="success-icon">✓</div>
          <h2>Đăng ký thành công!</h2>
          <p>Đang chuyển hướng đến trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <img
            src="http://localhost:5000/Pic/Pic_LogoShop/logoNoiThatXin.png"
            alt="NoiThatXin"
            className="auth-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="auth-tagline">Kiến tạo không gian sống hoàn hảo</h1>
          <p className="auth-sub">Hơn 15 năm đồng hành cùng gia đình Việt</p>
        </div>
        <div className="auth-bg-pattern"></div>
      </div>

      <div className="auth-right">
        <div className="auth-card auth-card-wide">
          <h2 className="auth-title">Tạo tài khoản</h2>
          <p className="auth-subtitle">Đăng ký để nhận ưu đãi đặc biệt dành cho thành viên</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-grid-2">
              <div className="form-field">
                <label>Tên đăng nhập <span className="required">*</span></label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input type="text" value={form.TenDangNhap} onChange={(e) => set('TenDangNhap', e.target.value)} placeholder="Tên đăng nhập" required />
                </div>
              </div>
              <div className="form-field">
                <label>Email <span className="required">*</span></label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input type="email" value={form.Email} onChange={(e) => set('Email', e.target.value)} placeholder="email@example.com" required />
                </div>
              </div>
            </div>

            <div className="form-field">
              <label>Họ và tên <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <User size={16} className="input-icon" />
                <input type="text" value={form.HoTen} onChange={(e) => set('HoTen', e.target.value)} placeholder="Họ và tên đầy đủ" required />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Mật khẩu <span className="required">*</span></label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input type={showPw ? 'text' : 'password'} value={form.MatKhau} onChange={(e) => set('MatKhau', e.target.value)} placeholder="Tối thiểu 6 ký tự" required />
                  <button type="button" className="input-eye" onClick={() => setShowPw(!showPw)}>{showPw ? '◉' : '○'}</button>
                </div>
              </div>
              <div className="form-field">
                <label>Xác nhận mật khẩu <span className="required">*</span></label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input type={showPw ? 'text' : 'password'} value={form.XacNhanMk} onChange={(e) => set('XacNhanMk', e.target.value)} placeholder="Nhập lại mật khẩu" required />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Giới tính <span className="required">*</span></label>
                <select value={form.GioiTinh} onChange={(e) => set('GioiTinh', e.target.value)} required>
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div className="form-field">
                <label>Số điện thoại <span className="required">*</span></label>
                <div className="input-icon-wrap">
                  <Phone size={16} className="input-icon" />
                  <input type="tel" value={form.SoDienThoai} onChange={(e) => set('SoDienThoai', e.target.value)} placeholder="0909 123 456" required />
                </div>
              </div>
            </div>

            <div className="form-field">
              <label>Địa chỉ <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <MapPin size={16} className="input-icon" />
                <input type="text" value={form.DiaChi} onChange={(e) => set('DiaChi', e.target.value)} placeholder="Địa chỉ liên hệ" required />
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
            </button>
          </form>

          <div className="auth-switch">
            Bạn đã có tài khoản?{' '}
            <Link to="/DangNhap" className="auth-link-bold">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
