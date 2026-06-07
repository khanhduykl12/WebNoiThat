const API_BASE = 'http://localhost:5000/api';
const STATIC_BASE = 'http://localhost:5000';

export const api = {
  base: API_BASE,
  static: STATIC_BASE,

  async get(path, params = {}) {
    const url = new URL(`${API_BASE}${path}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') url.searchParams.set(k, v);
    });
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  },

  async postFormData(path, formData) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};

export const aiSearchAPI = {
  byBase64: (base64Image) => api.post('/ai/search-base64', { image: base64Image }),
  byFile: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.postFormData('/ai/search-image', form);
  },
};

export const productAPI = {
  list: (params = {}) => api.get('/products/', params),
  getById: (id) => api.get(`/products/${id}`),
  search: (q) => api.get('/products/', { q }),
};

export const bannerAPI = {
  list: (type = 'carousel') => api.get('/banners/', { type }),
};

export const cartAPI = {
  get: () => api.get('/cart/'),
  add: (data) => api.post('/cart/', data),
  update: (data) => api.post('/cart/', data),
  remove: (data) => api.post('/cart/delete', data),
};

export const orderAPI = {
  create: (data) => api.post('/orders/', data),
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout', {}),
  me: () => api.get('/auth/me'),
};

export const FALLBACK_IMG = `${STATIC_BASE}/Pic/Pic_SanPham/default.svg`;
export const FALLBACK_LOGO = `${STATIC_BASE}/Pic/Pic_LogoShop/logoNoiThatXin.png`;

export function formatPrice(num) {
  if (num == null || isNaN(num)) return '0 đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
}

export function getProductImage(hinhAnh) {
  if (!hinhAnh || hinhAnh === 'null') return FALLBACK_IMG;
  if (hinhAnh.startsWith('http')) return hinhAnh;
  return `${STATIC_BASE}${hinhAnh}`;
}

export function getProductLink(id) {
  return `/ChiTiet?id=${id}`;
}
