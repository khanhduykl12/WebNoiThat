import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { productAPI, getProductImage, formatPrice } from '../services/api';
import { ChevronLeft, ChevronRight, Star, Filter } from 'lucide-react';

const BRANDS = [
  { src: 'http://localhost:5000/Pic/Pic_LogoThuongHieu/LogoFascino.jpg', alt: 'NoiThatViet' },
  { src: 'http://localhost:5000/Pic/Pic_LogoThuongHieu/LogoDtFly.jpg', alt: 'GiaDinhNhapKhau' },
  { src: 'http://localhost:5000/Pic/Pic_LogoThuongHieu/LogoHector.jpg', alt: 'NhapKhauViet' },
];

const PHONG_MAP = { 'phong-khach': 1, 'phong-ngu': 2, 'phong-bep': 3, 'phong-tam': 4, 'ngoai-troi': 5, 'phong-lam-viec': 6 };
const CATEGORY_MAP = { sofa: 1, giuong: 2, ban: 3, ghe: 4, tu: 5, den: 6, 'trang-tri': 7, ke: 8, guong: 9, tham: 10 };
const ROOM_LABELS = { 'phong-khach': 'Phòng khách', 'phong-ngu': 'Phòng ngủ', 'phong-bep': 'Phòng bếp', 'phong-tam': 'Phòng tắm', 'ngoai-troi': 'Ngoài trời', 'phong-lam-viec': 'Phòng làm việc' };
const CATEGORY_LABELS = { sofa: 'Sofa', giuong: 'Giường', ban: 'Bàn', ghe: 'Ghế', tu: 'Tủ', den: 'Đèn', 'trang-tri': 'Trang trí', ke: 'Kệ', guong: 'Gương', tham: 'Thảm' };

const PRICE_RANGES = [
  { label: 'Dưới 1 triệu', gia_min: 0, gia_max: 1000000 },
  { label: '1 – 5 triệu', gia_min: 1000000, gia_max: 5000000 },
  { label: '5 – 10 triệu', gia_min: 5000000, gia_max: 10000000 },
  { label: '10 – 20 triệu', gia_min: 10000000, gia_max: 20000000 },
  { label: 'Trên 20 triệu', gia_min: 20000000, gia_max: null },
];

const ROOMS = [
  { label: 'Phòng khách', param: 'phong-khach' },
  { label: 'Phòng ngủ', param: 'phong-ngu' },
  { label: 'Phòng bếp', param: 'phong-bep' },
  { label: 'Phòng tắm', param: 'phong-tam' },
  { label: 'Ngoài trời', param: 'ngoai-troi' },
  { label: 'Phòng làm việc', param: 'phong-lam-viec' },
];

const CATEGORIES = [
  { label: 'Sofa', param: 'sofa' },
  { label: 'Giường', param: 'giuong' },
  { label: 'Bàn', param: 'ban' },
  { label: 'Ghế', param: 'ghe' },
  { label: 'Tủ', param: 'tu' },
  { label: 'Đèn', param: 'den' },
  { label: 'Trang trí', param: 'trang-tri' },
  { label: 'Kệ', param: 'ke' },
  { label: 'Gương', param: 'guong' },
  { label: 'Thảm', param: 'tham' },
];

function ProductCard({ product }) {
  const { MaSP, id, TenSP, tenSP, GiaBan, giaBan, giaSauGiam, GiaGoc, giaGoc, KhuyenMai, khuyenMai, HinhAnh, hinhAnh } = product;
  const price = giaSauGiam || GiaBan || giaBan || 0;
  const oldPrice = GiaGoc || giaGoc || 0;
  const disc = KhuyenMai || khuyenMai || 0;
  const name = TenSP || tenSP || '';
  const img = getProductImage(HinhAnh || hinhAnh);
  const pid = id || MaSP;

  return (
    <Link to={`/ChiTiet?id=${pid}`} className="product-card-link">
      <div className="product-card">
        <div className="product-card-img-wrap">
          <img src={img} alt={name} onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_SanPham/default.svg'; }} />
          {disc > 0 && <span className="product-card-badge">Giảm {disc}%</span>}
        </div>
        <div className="product-card-body">
          <h3 className="product-card-title">{name}</h3>
          <div className="product-card-prices">
            <span className="product-card-price-current">{formatPrice(price)}</span>
            {oldPrice > price && <span className="product-card-price-original">{formatPrice(oldPrice)}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [openFilter, setOpenFilter] = useState(null);
  const perPage = 12;

  const params = {
    phong: searchParams.get('phong') || '',
    ma_danh_muc: searchParams.get('ma_danh_muc') || '',
    gia_min: searchParams.get('gia_min') || '',
    gia_max: searchParams.get('gia_max') || '',
    keyword: searchParams.get('keyword') || '',
  };

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setLoading(true);
    const filters = {
      page,
      per_page: perPage,
    };
    if (params.phong) filters.ma_phong = PHONG_MAP[params.phong] || '';
    if (params.ma_danh_muc) filters.ma_danh_muc = CATEGORY_MAP[params.ma_danh_muc] || '';
    if (params.gia_min) filters.gia_min = params.gia_min;
    if (params.gia_max) filters.gia_max = params.gia_max;
    if (params.keyword) filters.keyword = params.keyword;

    productAPI.list(filters)
      .then((data) => {
        if (data.success && data.data?.length) {
          setProducts(data.data);
          setTotalPages(data.pages || 1);
        } else {
          setProducts([]);
          setTotalPages(1);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [searchParams.toString()]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete('page');
    setSearchParams(next);
    setOpenFilter(null);
  };

  const clearAll = () => setSearchParams({});

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeRoom = ROOM_LABELS[params.phong];
  const activeCategory = CATEGORY_LABELS[params.ma_danh_muc];
  const breadcrumb = activeRoom || activeCategory || 'Tất cả sản phẩm';

  const pageTitle = activeRoom ? `${activeRoom} - NoiThatXin` : activeCategory ? `${activeCategory} - NoiThatXin` : 'Sản phẩm - NoiThatXin';

  return (
    <Layout>
      <div className="page-content">
        {/* Page title */}
        <div className="page-title-bar">
          <div className="container mx-auto px-4">
            <h1 className="page-heading">{breadcrumb}</h1>
            {(params.phong || params.ma_danh_muc || params.gia_min) && (
              <div className="active-filters">
                {activeRoom && <span className="filter-chip">{activeRoom}</span>}
                {activeCategory && <span className="filter-chip">{activeCategory}</span>}
                {params.gia_min && <span className="filter-chip">{PRICE_RANGES.find(r => r.gia_min == params.gia_min)?.label}</span>}
                <button onClick={clearAll} className="clear-filters-btn">✕ Xóa lọc</button>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 pb-5">
          {/* Brands */}
          <div className="brands-section">
            <h5 className="brands-heading">THƯƠNG HIỆU</h5>
            <div className="brands-container">
              {BRANDS.map((b) => (
                <img key={b.alt} src={b.src} alt={b.alt} className="brand-logo" onError={(e) => { e.target.style.display = 'none'; }} />
              ))}
            </div>
          </div>

          {/* Filter bar */}
          <div className="filter-section">
            <div className="filter-bar">
              <span className="filter-label">Lọc theo:</span>
              <div className="filter-buttons">
                {[
                  { id: 'price', label: 'Giá ▾' },
                  { id: 'category', label: 'Danh mục ▾' },
                  { id: 'room', label: 'Phòng ▾' },
                ].map((f) => (
                  <div key={f.id} className="filter-dropdown-wrap">
                    <button
                      className={`filter-btn ${openFilter === f.id ? 'active' : ''}`}
                      onClick={() => setOpenFilter(openFilter === f.id ? null : f.id)}
                    >
                      {f.label}
                    </button>
                    {openFilter === f.id && (
                      <div className="filter-dropdown-panel">
                        {f.id === 'price' && PRICE_RANGES.map((r) => (
                          <button key={r.label} onClick={() => updateFilter('gia_min', r.gia_min === 0 ? '' : r.gia_min.toString())} className="filter-option">
                            {r.label}
                          </button>
                        ))}
                        {f.id === 'category' && CATEGORIES.map((c) => (
                          <button key={c.param} onClick={() => updateFilter('ma_danh_muc', c.param)} className="filter-option">
                            {c.label}
                          </button>
                        ))}
                        {f.id === 'room' && ROOMS.map((r) => (
                          <button key={r.param} onClick={() => updateFilter('phong', r.param)} className="filter-option">
                            {r.label}
                          </button>
                        ))}
                        {(params.phong || params.ma_danh_muc || params.gia_min) && (
                          <button onClick={clearAll} className="filter-option filter-option-clear">
                            ✕ Xóa bộ lọc
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Products */}
          {loading ? (
            <div className="products-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="product-card-skeleton">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text skeleton-text-sm"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>Không tìm thấy sản phẩm nào.</p>
              <button onClick={clearAll} className="btn-clear-all">Xóa bộ lọc</button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((p) => (
                  <ProductCard key={p.id || p.MaSP} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-wrap">
                  <button
                    className="pagination-btn"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || Math.abs(p - page) <= 2) {
                      return (
                        <button
                          key={p}
                          className={`pagination-btn ${p === page ? 'active' : ''}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      );
                    } else if (Math.abs(p - page) === 3) {
                      return <span key={p} className="pagination-ellipsis">…</span>;
                    }
                    return null;
                  })}
                  <button
                    className="pagination-btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
