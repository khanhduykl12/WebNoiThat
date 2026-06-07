import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { productAPI, getProductImage, formatPrice } from '../services/api';
import { Minus, Plus, ShoppingCart, Star, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

function StarRating({ rating = 0 }) {
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          fill={i <= Math.round(rating) ? '#f5c518' : 'none'}
          color={i <= Math.round(rating) ? '#f5c518' : '#ccc'}
        />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    setLoading(true);
    setNotFound(false);
    productAPI.getById(id)
      .then((data) => {
        if (data.success && data.data) {
          setProduct(data.data);
          document.title = data.data.TenSP || 'Chi tiết sản phẩm';
          // Load related
          if (data.data.MaDanhMuc) {
            return productAPI.list({ ma_danh_muc: data.data.MaDanhMuc, per_page: 6 });
          }
        } else {
          setNotFound(true);
        }
      })
      .then((data) => {
        if (data?.success && data.data) {
          setRelated(data.data.filter((p) => (p.id || p.MaSP).toString() !== id.toString()).slice(0, 6));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/DangNhap';
      return;
    }
    setAddingToCart(true);
    try {
      const res = await fetch('http://localhost:5000/api/cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ MaSP: id, SoLuong: quantity }),
      });
      if (res.ok) {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        // Update cart badge
        try {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          const existing = cart.find((i) => (i.MaSP || i.id)?.toString() === id.toString());
          if (existing) {
            existing.SoLuong = (existing.SoLuong || 1) + quantity;
          } else {
            cart.push({ MaSP: id, SoLuong: quantity });
          }
          localStorage.setItem('cart', JSON.stringify(cart));
          window.dispatchEvent(new Event('cartUpdated'));
        } catch {}
      }
    } catch {}
    setAddingToCart(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-5">
          <div className="skeleton-page"></div>
        </div>
      </Layout>
    );
  }

  if (notFound || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-5 text-center">
          <h2 className="text-danger">Không tìm thấy sản phẩm</h2>
          <Link to="/SanPham" className="btn btn-dark mt-3">← Quay lại cửa hàng</Link>
        </div>
      </Layout>
    );
  }

  const p = product;
  const giaBan = p.GiaBan || p.giaBan || 0;
  const giaGoc = p.GiaGoc || p.giaGoc || 0;
  const khuyenMai = p.KhuyenMai || p.khuyenMai || 0;
  const moTa = p.MoTa || p.moTa || '';
  const moTaLines = moTa.split('\n').filter((l) => l.trim());

  return (
    <Layout>
      <div className="page-content">
        {/* Breadcrumb */}
        <div className="breadcrumb-bar">
          <div className="container mx-auto px-4">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb-list">
                <li><Link to="/">Trang chủ</Link></li>
                <li><Link to="/SanPham">Sản phẩm</Link></li>
                <li>{p.TenSP || p.tenSP}</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          {/* Product row */}
          <div className="detail-grid">
            {/* Left: Image */}
            <div className="detail-image-wrap">
              <div className="detail-img-container">
                <img
                  src={getProductImage(p.HinhAnh || p.hinhAnh)}
                  alt={p.TenSP || p.tenSP}
                  onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_SanPham/default.svg'; }}
                />
              </div>
              {/* Description */}
              {moTaLines.length > 0 && (
                <div className="detail-description">
                  <h3 className="detail-section-title">Mô tả sản phẩm</h3>
                  <ul className="detail-desc-list">
                    {moTaLines.map((line, i) => (
                      <li key={i}><CheckCircle size={14} style={{ color: '#1E4D36', flexShrink: 0 }} />{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="detail-info-wrap">
              <h1 className="detail-product-title">{p.TenSP || p.tenSP}</h1>

              {/* Price */}
              <div className="detail-price-row">
                <span className="detail-price-sale">{formatPrice(giaBan)}</span>
                {giaGoc > giaBan && (
                  <span className="detail-price-original">{formatPrice(giaGoc)}</span>
                )}
                {khuyenMai > 0 && (
                  <span className="detail-discount-tag">-{khuyenMai}%</span>
                )}
              </div>

              {/* Specs */}
              <div className="detail-specs">
                {[
                  { label: 'Thương hiệu', value: p.ThuongHieu || p.thuongHieu },
                  { label: 'Xuất xứ', value: p.XuatXu || p.xuatXu },
                  { label: 'Chất liệu', value: p.ChatLieu || p.chatLieu },
                  { label: 'Màu sắc', value: p.MauSac || p.mauSac },
                  { label: 'Kích thước', value: p.KichThuoc || p.kichThuoc },
                  { label: 'Trọng lượng', value: p.TrongLuong ? `${p.TrongLuong} kg` : null },
                  { label: 'Bảo hành', value: p.BaoHanh || p.baoHanh },
                ].map(({ label, value }) =>
                  value ? (
                    <div key={label} className="detail-spec-row">
                      <span className="detail-spec-label">{label}:</span>
                      <span className="detail-spec-value">{value}</span>
                    </div>
                  ) : null
                )}
              </div>

              {/* Quantity + Add to cart */}
              <div className="detail-actions">
                <div className="detail-qty-control">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Giảm"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={p.SoLuongTon || 999}
                    className="qty-input"
                  />
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Tăng"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  className={`btn-add-cart ${addedToCart ? 'added' : ''} ${addingToCart ? 'loading' : ''}`}
                  onClick={addToCart}
                  disabled={addingToCart}
                >
                  {addedToCart ? (
                    <><CheckCircle size={18} /> Đã thêm vào giỏ!</>
                  ) : addingToCart ? (
                    <>Đang thêm...</>
                  ) : (
                    <><ShoppingCart size={18} /> THÊM VÀO GIỎ HÀNG</>
                  )}
                </button>
              </div>

              {/* Promotions */}
              <div className="detail-promotions">
                <div className="promo-title">ƯU ĐÃI THÊM</div>
                <div className="promo-content">
                  <div className="promo-item"><CheckCircle size={14} color="#1E4D36" /> Miễn phí giao hàng nội thành cho đơn từ <strong>2.000.000đ</strong></div>
                  <div className="promo-item"><CheckCircle size={14} color="#1E4D36" /> Giảm thêm 5% khi mua từ 3 sản phẩm trở lên</div>
                  <div className="promo-item"><CheckCircle size={14} color="#1E4D36" /> Bảo hành 24 tháng, đổi trả trong 30 ngày</div>
                </div>
              </div>
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="related-section">
              <h2 className="related-heading">CÓ THỂ BẠN THÍCH</h2>
              <div className="related-grid">
                {related.map((rp) => (
                  <Link
                    key={rp.id || rp.MaSP}
                    to={`/ChiTiet?id=${rp.id || rp.MaSP}`}
                    className="related-card"
                  >
                    <div className="related-card-img">
                      <img
                        src={getProductImage(rp.HinhAnh || rp.hinhAnh)}
                        alt={rp.TenSP || rp.tenSP}
                        onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_SanPham/default.svg'; }}
                      />
                    </div>
                    <div className="related-card-body">
                      <h4 className="related-card-title">{rp.TenSP || rp.tenSP}</h4>
                      <div className="related-card-price">
                        <span className="price-sale">{formatPrice(rp.GiaBan || rp.giaBan)}</span>
                        {(rp.GiaGoc || rp.giaGoc) > (rp.GiaBan || rp.giaBan) && (
                          <span className="price-original">{formatPrice(rp.GiaGoc || rp.giaGoc)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
