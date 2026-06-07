import { formatPrice, getProductImage, FALLBACK_LOGO } from '../services/api';

export default function ProductCard({ product }) {
  const {
    id,
    MaSP,
    tenSP,
    TenSP,
    giaSauGiam,
    giaBan,
    giaGoc,
    khuyenMai,
    KhuyenMai,
    hinhAnh,
    HinhAnh,
    similarityScore,
    similarity,
  } = product;

  const salePrice = giaSauGiam || giaBan || 0;
  const originalPrice = giaGoc || giaBan || 0;
  const discount = khuyenMai || KhuyenMai || 0;
  const simScore = similarityScore || similarity || 0;
  const simPct = (simScore * 100).toFixed(1);
  const name = tenSP || TenSP || '';
  const imgSrc = getProductImage(hinhAnh || HinhAnh);
  const productId = id || MaSP;
  const link = `../TrangChiTiet/TrangChiTiet.html?id=${productId}`;

  return (
    <div className="ai-product-card flex flex-col h-full">
      <div className="ai-img-wrap">
        <a href={link} target="_blank" rel="noopener noreferrer">
          <img
            src={imgSrc}
            alt={name}
            className="ai-product-img"
            onError={(e) => { e.target.src = FALLBACK_LOGO; }}
          />
        </a>
        {discount > 0 && (
          <span className="ai-discount-badge">-{discount}%</span>
        )}
        {simScore > 0 && (
          <div className="ai-sim-score">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="inline mr-1">
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/>
            </svg>
            {simPct}%
          </div>
        )}
      </div>
      <div className="ai-product-info flex flex-col flex-1 p-3">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="ai-product-name text-sm font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-2 flex-1"
        >
          {name}
        </a>
        <div className="ai-product-price mt-2">
          {salePrice > 0 && (
            <span className="ai-price-sale">{formatPrice(salePrice)}</span>
          )}
          {originalPrice > salePrice && (
            <span className="ai-price-original">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
