import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) { setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!'); return; }
    setError('Đang đăng nhập...');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TenDangNhap: username.trim(), MatKhau: password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user?.VaiTro === 'admin') {
          window.location.href = '../TrangAdmin/TrangAdmin.html';
        } else {
          window.location.href = '/';
        }
      } else {
        setError(data.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
        setLoading(false);
      }
    } catch {
      setError('Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy.');
      setLoading(false);
    }
  };

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
        <div className="auth-card">
          <h2 className="auth-title">Đăng nhập</h2>
          <p className="auth-subtitle">Chào mừng bạn quay trở lại NoiThatXin</p>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-field">
              <label htmlFor="username">Tên đăng nhập</label>
              <div className="input-icon-wrap">
                <User size={16} className="input-icon" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-eye"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-extra-row">
              <a href="#" className="auth-link">Quên mật khẩu?</a>
            </div>

            {error && (
              <div className={`auth-error ${error.includes('Đang') ? 'auth-info' : ''}`}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
            </button>
          </form>

          <div className="auth-switch">
            Bạn chưa có tài khoản?{' '}
            <Link to="/DangKy" className="auth-link-bold">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
