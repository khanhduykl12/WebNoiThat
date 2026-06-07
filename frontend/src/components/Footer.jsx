export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Cột 1: Thông tin liên hệ */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-primary">Thông tin liên hệ</h4>
            <p className="mb-2 text-gray-600">
              <span className="font-semibold">Hotline:</span> 0909 123456
            </p>
            <p className="mb-2 text-gray-600">
              <span className="font-semibold">Email:</span> NoiThatXin@gmail.com
            </p>

            <h5 className="font-bold mt-4 mb-3">Phương thức thanh toán</h5>
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

            <h5 className="font-bold mt-4 mb-3">Kết nối với chúng tôi</h5>
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

          {/* Cột 2: Thông tin và chính sách */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-primary">Thông tin và chính sách</h4>
            <ul className="space-y-2">
              {[
                'Hướng dẫn mua hàng',
                'Chính sách giao hàng',
                'Chính sách bảo hành',
                'Chính sách bảo mật',
                'Chính sách đổi trả hàng',
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-600 hover:text-primary transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Cửa hàng */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-primary">Cửa hàng</h4>
            <ul className="space-y-3">
              {[
                'CH1: 140 Lê Trọng Tấn, Phường Tây Thạnh, Quận Tân Phú, TP.HCM',
                'CH2: 93 Tân Kỳ Tân Quý, Phường Tân Sơn Nhì, TP.HCM',
                'CH3: 31 Chế Lan Viên, Phường Tây Thạnh, TP.HCM',
              ].map((addr) => (
                <li key={addr} className="text-gray-600 text-sm">
                  <a href="#" className="hover:text-primary transition-colors">{addr}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-primary text-white text-center py-4 text-sm">
        &copy; {new Date().getFullYear()} NoiThatXin. All rights reserved.
      </div>
    </footer>
  );
}
