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
  const intervalRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    bannerAPI.list('carousel')
      .then((data) => {
        if (data.success && data.data?.length) {
          setBanners(data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % banners.length);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [banners.length]);

  const goTo = (idx) => {
    clearInterval(intervalRef.current);
    setActiveIndex(idx);
    if (banners.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((i) => (i + 1) % banners.length);
      }, 3000);
    }
  };

  const prev = () => goTo((activeIndex - 1 + banners.length) % banners.length);
  const next = () => goTo((activeIndex + 1) % banners.length);

  return (
    <section className="hero-banner-section">
      {/* Red ticker */}
      <div className="banner-ticker-top">
        <div className="ticker-track">
          <span>GOING ON NOW &bull; GOING ON NOW &bull; GOING ON NOW &bull; GOING ON NOW &bull; GOING ON NOW &bull; GOING ON NOW &nbsp;</span>
          <span>GOING ON NOW &bull; GOING ON NOW &bull; GOING ON NOW &bull; GOING ON NOW &bull; GOING ON NOW &bull; GOING ON NOW &nbsp;</span>
        </div>
      </div>

      {/* Carousel */}
      <div
        className="relative"
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
                onError={(e) => {
                  e.target.src = 'http://localhost:5000/Pic/Pic_TrangChu/Pic_Carousel/Carousel5.jpg';
                }}
              />
            </a>

            {/* Caption overlay */}
            <div className="hero-caption-overlay">
              <p className="hero-sub-title">MEMORIAL DAY SALE</p>
              <h1 className="hero-main-title">
                Up to 60% off**
                <br />
                <span className="thin-text">select items</span>
              </h1>
              <div className="mt-6">
                <a
                  href={banner.LinkDen || '../TrangDanhMucSanPham/TrangSanPham.html'}
                  className="btn-shop-now"
                >
                  SHOP THE SALE
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Arrow buttons — show on hover */}
        {banners.length > 1 && (
          <>
            <button onClick={prev} className={`carousel-arrow prev ${isHovered ? '' : '!opacity-0'}`} aria-label="Previous">
              <ChevronLeft size={24} />
            </button>
            <button onClick={next} className={`carousel-arrow next ${isHovered ? '' : '!opacity-0'}`} aria-label="Next">
              <ChevronRight size={24} />
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

      {/* Footer bar — red */}
      <div className="hero-footer-bar">
        <span className="font-bold text-base">NoiThatXin</span>
        <span className="accent">&nbsp;advantage</span>
        <span>&nbsp;— Trả góp ưu đãi đặc biệt trong 24 tháng‡*</span>
      </div>
    </section>
  );
}
