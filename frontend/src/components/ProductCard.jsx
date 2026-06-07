import { getProductImage, formatPrice, FALLBACK_IMG } from '../services/api';

export default function ProductCard({ product }) {
  const {
    id, MaSP,
    TenSP, tenSP,
    GiaBan, giaBan, giaSauGiam,
    GiaGoc, giaGoc,
    KhuyenMai, khuyenMai,
    HinhAnh, hinhAnh,
    similarityScore, similarity,
  } = product;

  const salePrice = giaSauGiam || GiaBan || giaBan || 0;
  const originalPrice = GiaGoc || giaGoc || GiaBan || giaBan || 0;
  const disc = KhuyenMai || khuyenMai || 0;
  const simScore = similarityScore || similarity || 0;
  const simPct = (simScore * 100).toFixed(1);
  const name = TenSP || tenSP || '';
  const img = getProductImage(HinhAnh || hinhAnh);
  const pid = id || MaSP;
  const link = `../TrangChiTiet/TrangChiTiet.html?id=${pid}`;

  return (
    <div className="ai-product-card flex flex-column h-100">
      <div className="ai-img-wrap">
        <a href={link} target="_blank" rel="noopener noreferrer">
          <img src={img} alt={name} onError={(e) => { e.target.src = FALLBACK_IMG; }} />
        </a>
        {disc > 0 && <span className="ai-discount-badge">-{disc}%</span>}
        {simScore > 0 && (
          <span className="ai-sim-score">{simPct}%</span>
        )}
      </div>
      <div className="ai-product-info flex-fill">
        <a href={link} target="_blank" rel="noopener noreferrer" className="ai-product-name">
          {name}
        </a>
        <div className="mt-2">
          {salePrice > 0 && <span className="ai-price-sale">{formatPrice(salePrice)}</span>}
          {originalPrice > salePrice && <span className="ai-price-original">{formatPrice(originalPrice)}</span>}
        </div>
      </div>
    </div>
  );
}
