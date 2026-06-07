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
  { MaSP: 23, TenSP: 'Tranh Canvas Phong Cảnh 3 Mảnh', GiaBan: 680000, GiaGoc: 850000, KhuyenMai: 20, HinhAnh: 'http://localhost:5000/Pic/Pic_SanPham/Tranh/Tranh01.jpg' },
  { MaSP: 25, TenSP: 'Cây Giả Trang Trí Xương Rồng Mix', GiaBan: 350000, GiaGoc: 420000, KhuyenMai: 16, HinhAnh: 'http://localhost:5000/Pic/Pic_SanPham/Cay/Cay01.jpg' },
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
  const badge = disc > 0 ? `GIAM ${disc}%` : 'HOTS';

  return (
    <li className="deal-item flex-shrink-0">
      <a
        href={`../TrangChiTiet/TrangChiTiet.html?id=${pid}`}
        className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100"
      >
        <div className="relative">
          <div className="deal-image-box" style={{ paddingTop: '100%', position: 'relative', overflow: 'hidden' }}>
            <img
              src={img}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
          </div>
          <div className="deal-badge absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            {badge}
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem]">{name}</h3>
          <div className="mt-2">
            <span className="new-price text-primary font-bold text-base">
              {formatPrice(price)}
            </span>
            {oldPrice > price && (
              <span className="old-price text-gray-400 text-xs line-through ml-2">
                {formatPrice(oldPrice)}
              </span>
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

  useEffect(() => {
    setLoading(true);
    setUsedFallback(false);
    productAPI.list({ ...apiParams, per_page: 20 })
      .then((data) => {
        if (data.success && data.data?.length) {
          setProducts(data.data);
        } else {
          // API returned empty → use fallback
          setProducts(FALLBACK_PRODUCTS);
          setUsedFallback(true);
        }
      })
      .catch((err) => {
        // API failed (e.g. DB offline) → use fallback
        console.warn('[DealsCarousel] API failed, using fallback:', err.message);
        setProducts(FALLBACK_PRODUCTS);
        setUsedFallback(true);
      })
      .finally(() => setLoading(false));
  }, [JSON.stringify(apiParams)]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector('.deal-item');
    const amount = card ? card.offsetWidth + 16 : 240;
    scrollRef.current.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <section className="deals-section px-4 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          {icon}
          {title}
          {usedFallback && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-normal">
              Demo
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="deals-btn btn-prev w-10 h-10 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="deals-btn btn-next w-10 h-10 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[calc(20%-12.8px)] min-w-[220px]">
                <div className="bg-gray-200 rounded-xl animate-pulse" style={{ paddingTop: '100%' }}></div>
                <div className="mt-3 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="mt-2 h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <ul ref={scrollRef} className="deals-container">
            {products.map((p, i) => (
              <ProductCard key={p.id || p.MaSP || i} product={p} />
            ))}
          </ul>
        )}

        {/* Scrollbar */}
        <div className="deals-scrollbar-track mt-4">
          <div className="deals-scrollbar-thumb"></div>
        </div>
      </div>
    </section>
  );
}
