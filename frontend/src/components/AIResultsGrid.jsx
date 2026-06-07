export default function AIResultsGrid({ results, meta, loading, error }) {
  const hasResults = results && results.length > 0;
  const hasDetections = meta?.detections?.length > 0;
  const pt = meta?.processingTime;

  if (!loading && !error && !hasResults) return null;

  return (
    <div className="mt-4 pt-4 border-top">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          <span className="ai-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/></svg>
            AI
          </span>
          {hasResults && (
            <span className="text-sm text-secondary">
              Tìm thấy <strong>{results.length}</strong> sản phẩm tương tự
            </span>
          )}
        </div>
        {pt && (
          <small className="text-muted">
            YOLO {pt.yolo_ms || 0}ms | ViT {pt.vit_ms || 0}ms | Tổng {pt.total_ms || 0}ms
          </small>
        )}
      </div>

      {/* Detections */}
      {hasDetections && (
        <div className="mb-3 p-3 bg-success bg-opacity-10 border border-success rounded">
          <p className="text-xs fw-bold text-success mb-2">Phát hiện đồ nội thất:</p>
          <div className="d-flex flex-wrap gap-2">
            {meta.detections.map((d, i) => (
              <span key={i} className="badge bg-dark">
                {d.label}
                <span className="opacity-75 ms-1">({(d.confidence * 100).toFixed(0)}%)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-5">
          <svg width="48" height="48" fill="none" stroke="#dc3545" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto d-block mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
          </svg>
          <p className="text-danger fw-semibold mb-1">{error}</p>
          <p className="text-muted small">Vui lòng kiểm tra server đang chạy và thử lại.</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success mb-3" role="status" style={{ width: '2rem', height: '2rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="fw-semibold text-success mb-1">Đang xử lý AI...</p>
          <p className="text-muted small">YOLO đang phát hiện đồ nội thất và ViT đang trích xuất đặc trưng.</p>
        </div>
      )}

      {/* Results grid */}
      {hasResults && !loading && (
        <div className="row g-3">
          {results.map((product, idx) => (
            <AIClientCard key={product.id || product.MaSP || idx} product={product} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!hasResults && !loading && !error && (
        <div className="text-center py-5 text-secondary">
          <p>Không tìm thấy sản phẩm tương tự.</p>
        </div>
      )}
    </div>
  );
}

function AIClientCard({ product }) {
  const {
    id, MaSP,
    TenSP, tenSP,
    giaSauGiam, GiaBan, giaBan,
    giaGoc, GiaGoc,
    khuyenMai, KhuyenMai,
    HinhAnh, hinhAnh,
    similarityScore, similarity,
  } = product;

  const salePrice = giaSauGiam || GiaBan || giaBan || 0;
  const originalPrice = GiaGoc || giaGoc || GiaBan || giaBan || 0;
  const disc = khuyenMai || KhuyenMai || 0;
  const simScore = similarityScore || similarity || 0;
  const simPct = (simScore * 100).toFixed(1);
  const name = TenSP || tenSP || '';
  const rawImg = HinhAnh || hinhAnh;
  const img = !rawImg ? 'http://localhost:5000/Pic/Pic_SanPham/default.svg'
    : rawImg.startsWith('http') ? rawImg
    : `http://localhost:5000${rawImg}`;
  const pid = id || MaSP;

  return (
    <div className="col-6 col-sm-4 col-md-3">
      <div className="ai-product-card h-100 d-flex flex-column">
        <div className="ai-img-wrap">
          <a href={`../TrangChiTiet/TrangChiTiet.html?id=${pid}`} target="_blank" rel="noopener noreferrer">
            <img src={img} alt={name} onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_SanPham/default.svg'; }} />
          </a>
          {disc > 0 && <span className="ai-discount-badge">-{disc}%</span>}
          {simScore > 0 && (
            <div className="ai-sim-score">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/></svg>
              {simPct}%
            </div>
          )}
        </div>
        <div className="ai-product-info d-flex flex-column flex-fill">
          <a href={`../TrangChiTiet/TrangChiTiet.html?id=${pid}`} target="_blank" rel="noopener noreferrer" className="ai-product-name">
            {name}
          </a>
          <div className="mt-auto pt-2">
            {salePrice > 0 && <span className="ai-price-sale">{formatVND(salePrice)}</span>}
            {originalPrice > salePrice && <span className="ai-price-original">{formatVND(originalPrice)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatVND(num) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num || 0);
}
