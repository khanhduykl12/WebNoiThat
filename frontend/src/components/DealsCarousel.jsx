import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { productAPI, getProductImage, formatPrice, FALLBACK_IMG } from '../services/api';

const FALLBACK_PRODUCTS = [
  { MaSP: 1, TenSP: 'Sofa Vải Nhung 3 Chỗ Màu Xanh Navy', GiaBan: 8500000, GiaGoc: 9500000, KhuyenMai: 10, HinhAnh: 'http://localhost:5000/Pic/Pic_SanPham/Sofa/Sofa01.jpg' },
  { MaSP: 2, TenSP: 'Sofa Da Cao Cấp 3 Chỗ', GiaBan: 13500000, GiaGoc: 15000000, KhuyenMai: 10, HinhAnh: 'http://localhost:5000/Pic/Pic_SanPham/Sofa/Sofa01.jpg' },
  { MaSP: 11, TenSP: 'Giường Ngủ Đôi Khung Gỗ Sồi', GiaBan: 15900000, GiaGoc: 18000000, KhuyenMai: 11, HinhAnh: 'http://localhost:5000/Pic/Pic_SanPham/Giuong/Giuong01.jpg' },
  { MaSP: 15, TenSP: 'Ga Giường Cotton 100% King Size', GiaBan: 950000, GiaGoc: 1200000, KhuyenMai: 20, HinhAnh: 'http://localhost:5000/Pic/Pic_SanPham/Giuong/Giuong01.jpg' },
  { MaSP: 17, TenSP: 'Đèn Bàn Ngủ LED Cảm Ứng', GiaBan: 520000, GiaGoc: 650000, KhuyenMai: 20, HinhAnh: 'http://localhost:5000/Pic/Pic_SanPham/Den/Den01.jpg' },
  { MaSP: 18, TenSP: 'Bàn Ăn Gỗ Tự Nhiên 6 Chỗ', GiaBan: 10500000, GiaGoc: 12000000, KhuyenMai: 12, HinhAnh: 'http://localhost:5000/Pic/Pic_SanPham/Ban/Ban01.jpg' },
  { MaSP: 20, TenSP: 'Bàn Làm Việc Có Ngăn Kéo', GiaBan: 3900000, GiaGoc: 4500000, KhuyenMai: 13, HinhAnh: 'http://localhost:5000/Pic/Pic_SanPham/Ban/Ban02.jpg' },
  { MaSP: 21, TenSP: 'Ghế Văn Phòng Lưng Lưới Mesh', GiaBan: 2700000, GiaGoc: 3200000, KhuyenMai: 15, HinhAnh: 'http://localhost:5000/Pic/Pic_SanPham/Ghe/Ghe01.jpg' },
];

function ProductCard({ product }) {
  const {
    MaSP, id,
    TenSP, tenSP,
    GiaBan, giaBan, giaSauGiam,
    GiaGoc, giaGoc,
    KhuyenMai, khuyenMai,
    HinhAnh, hinhAnh,
  } = product;

  const price = giaSauGiam || GiaBan || giaBan || 0;
  const oldPrice = GiaGoc || giaGoc || GiaBan || giaBan || 0;
  const disc = KhuyenMai || khuyenMai || 0;
  const name = TenSP || tenSP || '';
  const img = getProductImage(HinhAnh || hinhAnh);
  const pid = id || MaSP;
  const badge = disc > 0 ? `-${disc}%` : 'HOTS';

  return (
    <li className="deal-item flex-shrink-0">
      <a
        href={`../TrangChiTiet/TrangChiTiet.html?id=${pid}`}
        className="deal-link"
      >
        <div className="deal-badge">{badge}</div>
        <div className="deal-image-box">
          <img
            src={img}
            alt={name}
            className="deal-img"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
        </div>
        <div className="deal-info">
          <h3 className="deal-title">{name}</h3>
          <div className="deal-price">
            <span className="new-price">{formatPrice(price)}</span>
            {oldPrice > price && (
              <span className="old-price">{formatPrice(oldPrice)}</span>
            )}
          </div>
        </div>
      </a>
    </li>
  );
}

export default function DealsCarousel({ title, apiParams = {}, icon }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const scrollRef = useRef(null);
  const thumbRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setUsedFallback(false);
    productAPI.list({ ...apiParams, per_page: 20 })
      .then((data) => {
        if (data.success && data.data?.length) {
          setProducts(data.data);
        } else {
          setProducts(FALLBACK_PRODUCTS);
          setUsedFallback(true);
        }
      })
      .catch(() => {
        setProducts(FALLBACK_PRODUCTS);
        setUsedFallback(true);
      })
      .finally(() => setLoading(false));
  }, [JSON.stringify(apiParams)]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector('.deal-item');
    const amount = card ? card.offsetWidth + 4 : 320;
    scrollRef.current.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!scrollRef.current || !thumbRef.current) return;
    const el = scrollRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const pct = (el.scrollLeft / maxScroll) * 100;
    thumbRef.current.style.transform = `translateX(${pct}%)`;
  };

  return (
    <section className="deals-section">
      <div className="deals-header">
        <h2 className="deals-heading flex items-center gap-3">
          {icon}
          {title}
          {usedFallback && (
            <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full font-normal">
              Demo
            </span>
          )}
        </h2>
        <div className="deals-nav-buttons">
          <button onClick={() => scroll(-1)} className="deals-btn" aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => scroll(1)} className="deals-btn" aria-label="Next">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        {loading ? (
          <div className="flex gap-1 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[calc(25%-3px)] min-w-[300px]">
                <div className="bg-gray-700 animate-pulse" style={{ height: '550px' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <ul
            ref={scrollRef}
            className="deals-container"
            onScroll={handleScroll}
          >
            {products.map((p, i) => (
              <ProductCard key={p.id || p.MaSP || i} product={p} />
            ))}
          </ul>
        )}

        {/* Scrollbar */}
        <div className="deals-scrollbar-track">
          <div ref={thumbRef} className="deals-scrollbar-thumb"></div>
        </div>
      </div>
    </section>
  );
}
