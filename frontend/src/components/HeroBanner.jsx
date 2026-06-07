import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bannerAPI } from '../services/api';

const DEFAULT_BANNERS = [
  {
    DuongDanAnh: 'http://localhost:5000/Pic/Pic_TrangChu/Pic_Carousel/Carousel5.jpg',
    TenBanner: 'Sale Lớn Mùa Hè',
    LinkDen: '../TrangDanhMucSanPham/TrangSanPham.html',
    ChuThich: 'GIAM DEN 60%',
  },
  {
    DuongDanAnh: 'http://localhost:5000/Pic/Pic_TrangChu/Pic_Carousel/Carousel6.jpg',
    TenBanner: 'Nội Thất Phòng Khách',
    LinkDen: '../TrangDanhMucSanPham/TrangSanPham.html?phong=phong-khach',
    ChuThich: 'NOI THAT PHONG KHACH',
  },
  {
    DuongDanAnh: 'http://localhost:5000/Pic/Pic_TrangChu/Pic_Carousel/Carousel7.jpg',
    TenBanner: 'Ngoài Trời Giảm 40%',
    LinkDen: '../TrangDanhMucSanPham/TrangSanPham.html?phong=ngoai-troi',
    ChuThich: 'NGOAI TROI GIAM 40%',
  },
];

export default function HeroBanner() {
  const [banners, setBanners] = useState(DEFAULT_BANNERS);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    bannerAPI.list('carousel')
      .then((data) => {
        if (data.success && data.data?.length) {
          setBanners(data.data);
        }
      })
      .catch((err) => {
        // DB offline → keep DEFAULT_BANNERS
        console.warn('[HeroBanner] Banner API failed, using defaults:', err.message);
      });
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

  return (
    <section className="relative w-full">
      {/* Ticker */}
      <div className="bg-primary-dark text-white overflow-hidden py-1">
        <div className="flex whitespace-nowrap" style={{ animation: 'marquee 20s linear infinite' }}>
          {[...Array(2)].map((_, mi) => (
            <span key={mi} className="inline-flex">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="mx-8 text-xs font-bold tracking-widest">
                  GOING ON NOW &nbsp;&bull;&nbsp;
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Carousel */}
      <div id="ashleyHeroCarousel" className="relative">
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className={`transition-opacity duration-700 ${idx === activeIndex ? 'block' : 'hidden'}`}
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

            {/* Overlay caption */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
              <p className="text-white/80 text-sm md:text-base font-bold tracking-[0.3em] mb-4 drop-shadow-lg">
                MEMORIAL DAY SALE
              </p>
              <h1 className="text-white text-4xl md:text-7xl font-extrabold leading-tight drop-shadow-2xl">
                Up to 60% off**
                <br />
                <span className="font-light text-2xl md:text-4xl">select items</span>
              </h1>
              <a
                href={banner.LinkDen || '../TrangDanhMucSanPham/TrangSanPham.html'}
                className="mt-8 pointer-events-auto bg-accent hover:bg-amber-600 text-white px-10 py-4 rounded-full font-bold tracking-widest text-sm transition-colors"
              >
                SHOP THE SALE
              </a>
            </div>
          </div>
        ))}

        {/* Prev / Next */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => goTo((activeIndex - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => goTo((activeIndex + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${idx === activeIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer info bar */}
      <div className="bg-primary py-3 px-6 text-center text-white">
        <p className="text-xs md:text-sm font-bold">
          NoiThatXin{' '}
          <span className="text-accent font-normal">advantage</span>
          {' '} — Trả góp ưu đãi đặc biệt trong 24 tháng‡*
        </p>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
