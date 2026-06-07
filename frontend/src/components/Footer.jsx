import { useState } from 'react';
import { Phone, Mail, MapPin, ArrowUp, ChevronRight } from 'lucide-react';

// Custom SVG social icons (lucide doesn't have social brand icons)
const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path fill="white" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon fill="white" points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const PAYMENT_METHODS = [
  { src: 'http://localhost:5000/Pic/Pic_PThucThanhToan/LogoMomo.jpg', alt: 'MoMo' },
  { src: 'http://localhost:5000/Pic/Pic_PThucThanhToan/LogoVisa.jpg', alt: 'Visa' },
  { src: 'http://localhost:5000/Pic/Pic_PThucThanhToan/LogoZaloPay.jpg', alt: 'ZaloPay' },
  { src: 'http://localhost:5000/Pic/Pic_PThucThanhToan/LogoVNPay.jpg', alt: 'VNPay' },
];

const SOCIAL_LINKS = [
  { icon: <FacebookIcon />, href: '#', label: 'Facebook' },
  { icon: <TwitterIcon />, href: '#', label: 'Twitter' },
  { icon: <InstagramIcon />, href: '#', label: 'Instagram' },
  { icon: <YoutubeIcon />, href: '#', label: 'YouTube' },
];

const POLICY_LINKS = [
  'Hướng dẫn mua hàng',
  'Chính sách giao hàng',
  'Chính sách bảo hành',
  'Chính sách bảo mật',
  'Chính sách đổi trả',
  'Câu hỏi thường gặp',
];

const STORE_ADDRESSES = [
  'CH1: 140 Lê Trọng Tấn, P. Tây Thạnh, Q. Tân Phú, TP.HCM',
  'CH2: 93 Tân Kỳ Tân Quý, P. Tân Sơn Nhì, TP.HCM',
  'CH3: 31 Chế Lan Viên, P. Tây Thạnh, TP.HCM',
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <>
      <footer className="site-footer">

        {/* Brand bar + Newsletter */}
        <div className="footer-brand-bar">
          <div className="footer-brand-inner">
            <div className="footer-brand-left">
              <img
                src="http://localhost:5000/Pic/Pic_LogoShop/logoNoiThatXin.png"
                alt="NoiThatXin"
                className="footer-logo"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <p className="footer-tagline">" Kiến tạo không gian sống hoàn hảo "</p>
            </div>

            <div className="footer-newsletter">
              <p className="footer-newsletter-label">
                Nhận ưu đãi đặc biệt
              </p>
              {subscribed ? (
                <p style={{ color: '#c8a165', fontSize: '13px', fontWeight: 600 }}>
                  ✦ Cảm ơn bạn! Đã đăng ký thành công.
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="footer-newsletter-row">
                  <input
                    type="email"
                    placeholder="Nhập email của bạn..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Email đăng ký nhận ưu đãi"
                  />
                  <button type="submit">Đăng ký</button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="footer-main-grid">

          {/* Column 1: Contact */}
          <div>
            <h4 className="footer-col-title">
              Liên hệ
              <div className="footer-col-divider"></div>
            </h4>

            <div className="footer-contact-item">
              <Phone size={15} />
              <div>
                <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>Hotline</div>
                <div>0909 123 456 — 24/7</div>
              </div>
            </div>

            <div className="footer-contact-item">
              <Mail size={15} />
              <div>
                <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>Email</div>
                <div>NoiThatXin@gmail.com</div>
              </div>
            </div>

            <div className="footer-contact-item">
              <MapPin size={15} />
              <div>
                <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontSize: '13px', marginBottom: '6px' }}>Cửa hàng</div>
                {STORE_ADDRESSES.map((addr) => (
                  <div key={addr} style={{ fontSize: '12.5px', marginBottom: '4px', lineHeight: 1.4 }}>{addr}</div>
                ))}
              </div>
            </div>

            {/* Social */}
            <h4 className="footer-col-title" style={{ marginTop: '28px' }}>
              Kết nối
              <div className="footer-col-divider"></div>
            </h4>
            <div className="footer-social-row">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.label} href={s.href} className="footer-social-btn" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Policies */}
          <div>
            <h4 className="footer-col-title">
              Hỗ trợ
              <div className="footer-col-divider"></div>
            </h4>
            <ul className="footer-link-col">
              {POLICY_LINKS.map((label) => (
                <li key={label}>
                  <a href="#">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ChevronRight size={12} style={{ color: '#c8a165', flexShrink: 0 }} />
                      {label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: About */}
          <div>
            <h4 className="footer-col-title">
              Về chúng tôi
              <div className="footer-col-divider"></div>
            </h4>
            <ul className="footer-link-col">
              {[
                'Giới thiệu NoiThatXin',
                'Tin tức & khuyến mãi',
                'Tuyển dụng',
                'Hệ thống cửa hàng',
                'Hợp tác kinh doanh',
                'Chính sách CSR',
              ].map((label) => (
                <li key={label}>
                  <a href="#">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ChevronRight size={12} style={{ color: '#c8a165', flexShrink: 0 }} />
                      {label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Payment */}
          <div>
            <h4 className="footer-col-title">
              Thanh toán
              <div className="footer-col-divider"></div>
            </h4>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', lineHeight: 1.6 }}>
              An toàn, bảo mật. Hỗ trợ nhiều phương thức thanh toán.
            </p>
            <div className="footer-payment-row">
              {PAYMENT_METHODS.map((pm) => (
                <img
                  key={pm.alt}
                  src={pm.src}
                  alt={pm.alt}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ))}
            </div>

            <h4 className="footer-col-title" style={{ marginTop: '28px' }}>
              Chứng nhận
              <div className="footer-col-divider"></div>
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '12px',
            }}>
              {['Đạt chuẩn ISO 9001', 'Hàng hóa chính hãng', 'Bảo vệ người tiêu dùng'].map((cert) => (
                <div key={cert} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: '#c8a165', fontSize: '10px' }}>✦</span> {cert}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} NoiThatXin. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Sitemap</a>
          </div>
        </div>

      </footer>

      {/* Back to top */}
      <button
        onClick={scrollTop}
        aria-label="Quay về đầu trang"
        title="Quay về đầu trang"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 999,
          background: 'linear-gradient(135deg, #1E4D36, #2a6b52)',
          color: 'white',
          border: 'none',
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          fontSize: '18px',
          transition: 'all 0.3s ease',
          opacity: 0.85,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <ArrowUp size={20} strokeWidth={2.5} />
      </button>
    </>
  );
}
