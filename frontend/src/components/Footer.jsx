export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <footer className="bg-[#1E4D36] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Column 1: Contact info */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Thông tin liên hệ</h4>
              <p className="mb-2 text-gray-300 text-sm">
                <span className="font-semibold text-white">Hotline:</span> 0909 123456
              </p>
              <p className="mb-2 text-gray-300 text-sm">
                <span className="font-semibold text-white">Email:</span> NoiThatXin@gmail.com
              </p>

              <h5 className="font-bold mt-5 mb-3 text-white">Phương thức thanh toán</h5>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {[
                  { src: 'http://localhost:5000/Pic/Pic_PThucThanhToan/LogoMomo.jpg', alt: 'MoMo' },
                  { src: 'http://localhost:5000/Pic/Pic_PThucThanhToan/LogoVisa.jpg', alt: 'Visa' },
                  { src: 'http://localhost:5000/Pic/Pic_PThucThanhToan/LogoZaloPay.jpg', alt: 'ZaloPay' },
                  { src: 'http://localhost:5000/Pic/Pic_PThucThanhToan/LogoVNPay.jpg', alt: 'VNPay' },
                ].map((img) => (
                  <img
                    key={img.alt}
                    src={img.src}
                    alt={img.alt}
                    className="h-10 w-auto object-contain rounded"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>

              <h5 className="font-bold mt-5 mb-3 text-white">Kết nối với chúng tôi</h5>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {[
                  { src: 'http://localhost:5000/Pic/Pic_LogoLKetNoi/LogoFacebook.jpg', alt: 'Facebook' },
                  { src: 'http://localhost:5000/Pic/Pic_LogoLKetNoi/LogoTwitter.jpg', alt: 'Twitter' },
                  { src: 'http://localhost:5000/Pic/Pic_LogoLKetNoi/LogoTiktok.jpg', alt: 'TikTok' },
                  { src: 'http://localhost:5000/Pic/Pic_LogoLKetNoi/LogoYoutube.jpg', alt: 'YouTube' },
                ].map((img) => (
                  <img
                    key={img.alt}
                    src={img.src}
                    alt={img.alt}
                    className="h-10 w-auto object-contain rounded"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            </div>

            {/* Column 2: Policies */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Thông tin và chính sách</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Hướng dẫn mua hàng', href: '#' },
                  { label: 'Chính sách giao hàng', href: '#' },
                  { label: 'Chính sách bảo hành', href: '#' },
                  { label: 'Chính sách bảo mật', href: '#' },
                  { label: 'Chính sách đổi trả hàng', href: '#' },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-gray-300 hover:text-white transition-colors text-sm d-inline-block py-0.5">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Stores */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Cửa hàng</h4>
              <ul className="space-y-3">
                {[
                  'CH1: 140 Lê Trọng Tấn, Phường Tây Thạnh, Quận Tân Phú, TP.HCM',
                  'CH2: 93 Tân Kỳ Tân Quý, Phường Tân Sơn Nhì, TP.HCM',
                  'CH3: 31 Chế Lan Viên, Phường Tây Thạnh, TP.HCM',
                ].map((addr) => (
                  <li key={addr} className="text-gray-300 text-sm">
                    {addr}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bg-[#153326] text-gray-300 text-center py-4 text-sm">
          &copy; {new Date().getFullYear()} NoiThatXin. All rights reserved.
        </div>
      </footer>

      {/* Back to top */}
      <button
        id="backTop"
        onClick={scrollTop}
        aria-label="Quay về đầu trang"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          background: '#1E4D36',
          color: 'white',
          border: 'none',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontSize: '18px',
          transition: 'opacity 0.3s',
        }}
      >
        &#8593;
      </button>
    </>
  );
}
