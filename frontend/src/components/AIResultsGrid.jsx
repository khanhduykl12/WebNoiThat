const COLOR_HEX = {
  'Đỏ': '#e74c3c',
  'Cam': '#e67e22',
  'Vàng': '#f1c40f',
  'Xanh lá': '#27ae60',
  'Xanh dương': '#2980b9',
  'Tím': '#8e44ad',
  'Hồng': '#fd79a8',
  'Nâu': '#a0522d',
  'Đen': '#2c2c2c',
  'Trắng': '#ecf0f1',
  'Xám': '#95a5a6',
};

function ColorDot({ color }) {
  const hex = COLOR_HEX[color] || '#999';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: '#f5f5f5',
      border: '1px solid #e0e0e0',
      borderRadius: '50px',
      padding: '3px 10px 3px 6px',
      fontSize: '12px',
      fontWeight: 600,
      color: '#333',
    }}>
      <span style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: hex,
        border: '1px solid rgba(0,0,0,0.15)',
        flexShrink: 0,
      }} />
      {color}
    </span>
  );
}

export default function AIResultsGrid({ results, meta, loading, error }) {
  const hasResults = results && results.length > 0;
  const hasDetections = meta?.detections?.length > 0;
  const pt = meta?.processingTime;
  const vf = meta?.visualFeatures;

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

      {/* YOLO Detections Panel */}
      {hasDetections && (
        <div className="ai-vit-panel mb-3">
          <div className="ai-vit-panel-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fff' }}>
              <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 6.5 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/>
            </svg>
            YOLO nhận diện
          </div>
          <div className="ai-vit-panel-body">
            <div className="d-flex flex-wrap gap-2">
              {meta.detections.map((d, i) => (
                <span key={i} className="ai-vit-tag">
                  {d.label}
                  <span className="ai-vit-conf ms-1">({(d.confidence * 100).toFixed(0)}%)</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visual Features Panel */}
      {vf && !loading && (
        <div className="ai-vit-panel mb-3">
          <div className="ai-vit-panel-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fff' }}>
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            ViT nhận diện từ ảnh
          </div>
          <div className="ai-vit-panel-body">
            {vf.dominateColors?.length > 0 && (
              <div className="ai-vit-row">
                <span className="ai-vit-label">Màu sắc:</span>
                <div className="ai-vit-tags">
                  {vf.dominateColors.map((c) => (
                    <ColorDot key={c} color={c} />
                  ))}
                </div>
              </div>
            )}
            {vf.materialEstimate && vf.materialEstimate !== 'Không xác định' && (
              <div className="ai-vit-row">
                <span className="ai-vit-label">Chất liệu:</span>
                <span className="ai-vit-tag">{vf.materialEstimate}</span>
              </div>
            )}
            {vf.styleEstimate && vf.styleEstimate !== 'Không xác định' && (
              <div className="ai-vit-row">
                <span className="ai-vit-label">Kiểu dáng:</span>
                <span className="ai-vit-tag">{vf.styleEstimate}</span>
              </div>
            )}
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
          <p className="text-muted small">YOLO nhận diện đồ nội thất và ViT trích xuất đặc trưng thị giác.</p>
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
