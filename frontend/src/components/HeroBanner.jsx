import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bannerAPI } from '../services/api';

const DEFAULT_BANNERS = [
  {
    DuongDanAnh: 'http://localhost:5000/Pic/Pic_TrangChu/Pic_Carousel/Carousel5.jpg',
    TenBanner: 'Sale Lớn Mùa Hè',
    LinkDen: '../TrangDanhMucSanPham/TrangSanPham.html',
    ChuThich: '',
  },
  {
    DuongDanAnh: 'http://localhost:5000/Pic/Pic_TrangChu/Pic_Carousel/Carousel6.jpg',
    TenBanner: 'Nội Thất Phòng Khách',
    LinkDen: '../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-khach',
    ChuThich: '',
  },
  {
    DuongDanAnh: 'http://localhost:5000/Pic/Pic_TrangChu/Pic_Carousel/Carousel7.jpg',
    TenBanner: 'Ngoài Trời Giảm 40%',
    LinkDen: '../TrangDanhMucSanPham/TrangSanPham.html?phong=ngoai-troi',
    ChuThich: '',
  },
];

export default function HeroBanner() {
  const [banners, setBanners] = useState(DEFAULT_BANNERS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    bannerAPI.list('carousel')
      .then((data) => {
        if (data.success && data.data?.length) setBanners(data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [banners.length]);

  const goTo = (idx) => {
    clearInterval(intervalRef.current);
    setActiveIndex(idx);
    if (banners.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((i) => (i + 1) % banners.length);
      }, 5000);
    }
  };

  const prev = () => goTo((activeIndex - 1 + banners.length) % banners.length);
  const next = () => goTo((activeIndex + 1) % banners.length);

  return (
    <section className="hero-banner-section">
      {/* Ticker */}
      <div className="banner-ticker-top">
        <div className="ticker-track">
          <span>✦ &nbsp; GOING ON NOW &nbsp; ✦ &nbsp; GOING ON NOW &nbsp; ✦ &nbsp; GOING ON NOW &nbsp; ✦ &nbsp; GOING ON NOW &nbsp; ✦ &nbsp; GOING ON NOW &nbsp; ✦ &nbsp; GOING ON NOW &nbsp; &nbsp;&nbsp;&nbsp;</span>
          <span>✦ &nbsp; GOING ON NOW &nbsp; ✦ &nbsp; GOING ON NOW &nbsp; ✦ &nbsp; GOING ON NOW &nbsp; ✦ &nbsp; GOING ON NOW &nbsp; ✦ &nbsp; GOING ON NOW &nbsp; ✦ &nbsp; GOING ON NOW &nbsp; &nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>

      {/* Carousel */}
      <div
        className="hero-carousel-wrapper relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className={`hero-carousel-item transition-opacity duration-700 ${idx === activeIndex ? 'block' : 'hidden'}`}
          >
            <a href={banner.LinkDen || '#'}>
              <img
                src={banner.DuongDanAnh}
                alt={banner.TenBanner || ''}
                className="hero-bg-img"
                onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_TrangChu/Pic_Carousel/Carousel5.jpg'; }}
              />
            </a>

            {/* Caption */}
            <div className="hero-caption-overlay">
              <p className="hero-sub-title">✦ &nbsp; Memorial Day Sale &nbsp; ✦</p>
              <h1 className="hero-main-title">
                Up to 60% Off
                <span className="thin-text">select items online</span>
              </h1>
              <div style={{ marginTop: '28px' }}>
                <a
                  href={banner.LinkDen || '../TrangDanhMucSanPham/TrangSanPham.html'}
                  className="btn-shop-now"
                >
                  Shop the Sale
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        {banners.length > 1 && (
          <>
            <button onClick={prev} className={`carousel-arrow prev ${isHovered ? '' : ''}`} style={{ opacity: isHovered ? 1 : 0 }} aria-label="Previous">
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <button onClick={next} className={`carousel-arrow next ${isHovered ? '' : ''}`} style={{ opacity: isHovered ? 1 : 0 }} aria-label="Next">
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {/* Indicators */}
      {banners.length > 1 && (
        <div className="custom-indicators">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`indicator-dot ${idx === activeIndex ? 'active' : ''}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Footer bar */}
      <div className="hero-footer-bar">
        <span className="brand">NoiThatXin</span>
        <span className="accent">Advantage</span>
        <span>— Miễn phí giao hàng &amp; lắp đặt tại nhà ‡*</span>
      </div>
    </section>
  );
}
