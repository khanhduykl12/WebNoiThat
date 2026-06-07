"""
AI Routes — YOLOv12 + ViT Image Search
POST /api/ai/search-image  → Upload ảnh → trả sản phẩm tương tự
POST /api/ai/search-base64 → Camera gửi base64 → trả sản phẩm tương tự
GET  /api/ai/stats         → Thống kê AI search
"""

import os
import io
import json
import base64
import uuid
import time
import urllib.parse
from datetime import datetime

from flask import Blueprint, request, jsonify, make_response
from markupsafe import escape
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from models import SanPham, make_absolute_image_url, LichSuTimKiemAnh
from extensions import db
from ai_service import get_ai_service
from config import Config

ai_bp = Blueprint('ai', __name__)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
AI_SEARCH_SESSION_STORE = {}
AI_SEARCH_SESSION_TTL_SECONDS = 900

FALLBACK_LABEL_KEYWORDS = {
    'ghe': ['ghế', 'ghe', 'chair', 'đôn', 'don'],
    'sofa': ['sofa', 'ghế sofa', 'salon'],
    'ban': ['bàn', 'ban', 'table', 'bàn ăn', 'bàn trà', 'bàn làm việc'],
    'giuong': ['giường', 'giuong', 'bed'],
    'den': ['đèn', 'den', 'lamp'],
    'tham': ['thảm', 'tham', 'rug', 'carpet'],
    'goi': ['gối', 'goi', 'pillow', 'cushion'],
    'tu': ['tủ', 'tu', 'cabinet', 'wardrobe'],
}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_upload_folder():
    folder = Config.UPLOAD_FOLDER
    os.makedirs(folder, exist_ok=True)
    return folder


def save_temp_image(file_storage, prefix='search_') -> str:
    """Lưu ảnh tạm, trả về đường dẫn tương đối"""
    ext = file_storage.filename.rsplit('.', 1)[1].lower() if '.' in file_storage.filename else 'jpg'
    filename = f"{prefix}{uuid.uuid4().hex[:12]}.{ext}"
    filepath = os.path.join(get_upload_folder(), filename)
    file_storage.save(filepath)
    return filepath


def save_temp_image_path(tmp_path: str, original_filename: str, prefix='search_') -> str:
    """Lưu ảnh tạm từ đường dẫn file đã có, trả về đường dẫn tương đối"""
    ext = os.path.splitext(original_filename)[1].lower().lstrip('.') if original_filename else 'jpg'
    if ext not in ALLOWED_EXTENSIONS:
        ext = 'jpg'
    filename = f"{prefix}{uuid.uuid4().hex[:12]}.{ext}"
    dest = os.path.join(get_upload_folder(), filename)
    import shutil
    shutil.copy2(tmp_path, dest)
    return dest


def save_base64_image(base64_str: str, prefix='camera_') -> str:
    """Lưu ảnh base64, trả về đường dẫn"""
    try:
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]
        img_data = base64.b64decode(base64_str)
        ext = 'jpg'
        filename = f"{prefix}{uuid.uuid4().hex[:12]}.{ext}"
        filepath = os.path.join(get_upload_folder(), filename)
        with open(filepath, 'wb') as f:
            f.write(img_data)
        return filepath
    except Exception as e:
        raise ValueError(f"Lỗi giải mã base64: {e}")


def load_products_by_ids(product_ids: list) -> dict:
    """Load sản phẩm từ DB, trả về dict {id: obj}"""
    if not product_ids:
        return {}
    products = SanPham.query.filter(
        SanPham.MaSP.in_(product_ids),
        SanPham.TrangThai == 'active'
    ).all()
    return {p.MaSP: p for p in products}


def build_label_keywords(top_label: str) -> list:
    label = (top_label or '').strip().lower()
    if not label:
        return []
    keywords = [label]
    mapped = FALLBACK_LABEL_KEYWORDS.get(label, [])
    for kw in mapped:
        if kw not in keywords:
            keywords.append(kw)
    return keywords


def save_ai_search_session(results, detections, top_label, processing_time, query_image):
    now = time.time()
    expired_keys = [key for key, value in AI_SEARCH_SESSION_STORE.items() if now - value.get('created_at', 0) > AI_SEARCH_SESSION_TTL_SECONDS]
    for key in expired_keys:
        AI_SEARCH_SESSION_STORE.pop(key, None)

    search_id = uuid.uuid4().hex
    AI_SEARCH_SESSION_STORE[search_id] = {
        'results': results,
        'detections': detections,
        'topLabel': top_label or '',
        'processingTime': processing_time or {},
        'queryImage': query_image or '',
        'created_at': now,
    }
    return search_id


def get_ai_search_session(search_id):
    session = AI_SEARCH_SESSION_STORE.get(search_id)
    if not session:
        return None

    if time.time() - session.get('created_at', 0) > AI_SEARCH_SESSION_TTL_SECONDS:
        AI_SEARCH_SESSION_STORE.pop(search_id, None)
        return None

    return {
        'results': session.get('results', []),
        'detections': session.get('detections', []),
        'topLabel': session.get('topLabel', ''),
        'processingTime': session.get('processingTime', {}),
        'queryImage': session.get('queryImage', ''),
    }


def format_sanpham(sp, similarity=None, yolo_label=None, request=None):
    """Format SanPham model → dict cho response"""
    gia_ban = float(sp.GiaBan or 0)
    khuyen_mai = sp.KhuyenMai or 0
    gia_sau_giam = round(gia_ban * (100 - khuyen_mai) / 100, -3)

    base_url = request.host_url.rstrip('/') if request else 'http://localhost:5000'
    hinh_anh = make_absolute_image_url(sp.HinhAnh, base_url=base_url)
    hinh_anh_phu = [
        make_absolute_image_url(sp.HinhAnhPhu1, base_url=base_url),
        make_absolute_image_url(sp.HinhAnhPhu2, base_url=base_url),
        make_absolute_image_url(sp.HinhAnhPhu3, base_url=base_url),
        make_absolute_image_url(sp.HinhAnhPhu4, base_url=base_url),
    ]

    data = {
        'id': sp.MaSP,
        'MaSP': sp.MaSP,
        'tenSP': sp.TenSP,
        'moTa': sp.MoTa,
        'giaGoc': float(sp.GiaGoc or 0),
        'giaBan': gia_ban,
        'giaSauGiam': gia_sau_giam,
        'khuyenMai': khuyen_mai,
        'hinhAnh': hinh_anh,
        'hinhAnhPhu': hinh_anh_phu,
        'thuongHieu': sp.ThuongHieu,
        'chatLieu': sp.ChatLieu,
        'mauSac': sp.MauSac,
        'kichThuoc': sp.KichThuoc,
        'soLuongTon': sp.SoLuongTon,
        'trangThai': sp.TrangThai,
        'yoloLabel': sp.YOLOLabel or yolo_label,
    }
    if similarity is not None:
        data['similarityScore'] = round(float(similarity), 4)
        data['similarityPercent'] = round(float(similarity) * 100, 1)
    return data


def log_search_history(user_id, image_path, detections, similar_products, processing_time):
    """Ghi lịch sử tìm kiếm vào DB"""
    try:
        labels = [d['label'] for d in detections]
        confidences = [d['confidence'] for d in detections]
        bboxes = [d['bbox'] for d in detections]

        history = LichSuTimKiemAnh(
            MaND=user_id,
            DuongDanAnh=image_path,
            YOLOLabels=json.dumps(labels),
            YOLOConfidences=json.dumps(confidences),
            YOLOBBoxes=json.dumps(bboxes),
            SoKetQua=len(similar_products),
            ThoiGianXuLyYOLO=processing_time.get('yolo_ms', 0),
            ThoiGianXuLyVector=processing_time.get('vit_ms', 0),
            ThoiGianTong=processing_time.get('total_ms', 0),
            KetQuaTimKiem=json.dumps(similar_products),
            TrangThai='success',
        )
        db.session.add(history)

        # Tăng lượt xem sản phẩm
        product_ids = [p['id'] for p in similar_products]
        if product_ids:
            products = SanPham.query.filter(SanPham.MaSP.in_(product_ids)).all()
            for p in products:
                p.SoLuotXem = (p.SoLuotXem or 0) + 1

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Loi ghi lich su tim kiem: {e}")


# ════════════════════════════════════════════════════════════════════════════════
# ROUTES
# ════════════════════════════════════════════════════════════════════════════════

@ai_bp.route('/search-image', methods=['POST'])
def search_by_image():
    """
    POST /api/ai/search-image
    Upload file ảnh → phát hiện đồ nội thất → tìm sản phẩm tương tự

    Form data:
        - image: file ảnh (jpg/png/webp)
    """
    if 'image' not in request.files:
        return jsonify({'success': False, 'message': 'Vui lòng gửi file ảnh'}), 400

    file = request.files['image']
    if not file or file.filename == '':
        return jsonify({'success': False, 'message': 'Chưa chọn ảnh'}), 400

    if not allowed_file(file.filename):
        return jsonify({'success': False, 'message': 'Định dạng không hỗ trợ. Dùng: jpg, jpeg, png, webp'}), 400

    try:
        image_bytes = file.read()
    except Exception:
        return jsonify({'success': False, 'message': 'Không đọc được file ảnh'}), 400

    # Lưu ảnh tạm
    try:
        file.seek(0)
        image_path = save_temp_image(file)
    except Exception:
        image_path = None

    return _do_ai_search(image_bytes, image_path, request)


# ─── Redirect-based search (dùng <form> POST thay vì fetch) ──────────────────
# Browser tự điều hướng sau khi backend trả HTML redirect.

@ai_bp.route('/search-image-redirect', methods=['POST'])
def search_image_redirect():
    """
    POST /api/ai/search-image-redirect
    Upload ảnh → xử lý AI → redirect sang TrangSanPham.html với kết quả trong URL fragment.
    """
    import traceback as tb_module

    if 'image' not in request.files:
        return _error_html("Vui lòng gửi file ảnh.", request)

    file = request.files['image']
    if not file or file.filename == '':
        return _error_html("Chưa chọn ảnh.", request)

    if not allowed_file(file.filename):
        return _error_html("Định dạng không hỗ trợ. Dùng: jpg, jpeg, png, webp.", request)

    # Đọc bytes TỪ BUFFER (không đọc trực tiếp từ file stream vì stream chỉ đọc được 1 lần)
    try:
        image_bytes = file.read()
    except Exception:
        return _error_html("Không đọc được file ảnh.", request)

    # Lưu ảnh tạm từ bytes (file stream đã bị consume bởi read() ở trên)
    try:
        import tempfile
        suffix = os.path.splitext(file.filename)[1] or '.jpg'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(image_bytes)
            tmp.flush()
            tmp_path = tmp.name
        image_path = save_temp_image_path(tmp_path, file.filename)
    except Exception as e:
        print(f"[AI REDIRECT] save_temp_image error: {e}", flush=True)
        image_path = None

    # Chạy AI search
    try:
        response = _do_ai_search(image_bytes, image_path, request)
    except Exception as e:
        tb_module.print_exc()
        return _error_html(f"Lỗi xử lý AI: {e}", request)

    # Xử lý response từ _do_ai_search
    status_code = 200
    if isinstance(response, tuple):
        response_obj, code = response
        status_code = code
        response = response_obj

    if status_code >= 400:
        try:
            payload = response.get_json() or {}
        except Exception:
            payload = {}
        msg = payload.get('message') or payload.get('error') or 'Xử lý thất bại.'
        return _error_html(msg, request)

    try:
        payload = response.get_json()
    except Exception:
        tb_module.print_exc()
        return _error_html("Không đọc được kết quả từ AI.", request)

    if not payload or not payload.get('success'):
        msg = 'Không nhận được kết quả tìm kiếm.'
        if isinstance(payload, dict):
            msg = payload.get('message') or payload.get('error') or msg
        return _error_html(msg, request)

    data = payload.get('data') or {}
    results = data.get('results') or []
    detections = data.get('detections') or []
    top_label = data.get('topLabel') or ''
    processing_time = data.get('processingTime') or None
    search_id = data.get('searchId') or ''

    redirect_path = request.form.get('redirect_url', '/TrangDanhMucSanPham/TrangSanPham.html')
    if not redirect_path.startswith('/'):
        redirect_path = '/TrangDanhMucSanPham/TrangSanPham.html'

    fragment_payload = {
        'results': results[:20],
        'meta': {
            'processingTime': processing_time,
            'detections': detections[:10],
            'topLabel': top_label,
            'queryImage': data.get('queryImage') or '',
            'ts': int(time.time() * 1000),
        }
    }

    try:
        json_str = json.dumps(fragment_payload, ensure_ascii=False)
        encoded = base64.urlsafe_b64encode(json_str.encode('utf-8')).decode('ascii').rstrip('=')
    except Exception as e:
        print(f"[AI REDIRECT] encode error: {e}", flush=True)
        encoded = ''

    params = {'ai_search': '1', 'count': str(len(results))}
    query_str = urllib.parse.urlencode(params)
    base_host = request.host_url.rstrip('/') if request else 'http://127.0.0.1:5000'
    next_page_url = f"{base_host}{redirect_path}?{query_str}"

    print(f"[AI REDIRECT] OK → {len(results)} sản phẩm → showing inline, redirect to {next_page_url}", flush=True)

    # Embed results + banner HTML directly — NO fetch/parse needed
    labels = ', '.join([d['label'] for d in detections[:3]]) if detections else (top_label or '')
    banner_subtitle = f" Nhận diện: {labels}" if labels else ""

    # Build product cards HTML server-side
    def _make_card(sp):
        img = sp.get('hinhAnh') or sp.get('HinhAnh') or f"{base_host}/Pic/Pic_SanPham/default.svg"
        ten = sp.get('tenSP') or sp.get('TenSP') or '(no name)'
        gia = int(sp.get('giaBan') or sp.get('GiaBan') or 0)
        gia_str = f"{gia:,}".replace(',', '.') + ' đ'
        gia_goc = int(sp.get('giaGoc') or sp.get('GiaGoc') or 0)
        km = int(sp.get('khuyenMai') or sp.get('KhuyenMai') or 0)
        sim = round(float(sp.get('similarityScore') or sp.get('similarity') or 0) * 100, 1)
        km_badge = f'<div class="discount-badge">Giảm {km}%</div>' if km > 0 else ''
        gia_goc_str = f'<span class="product-price-original">{gia_goc:,}'.replace(',', '.') + ' đ</span>' if gia_goc > gia else ''
        sim_badge = f'<div class="ai-sim-badge"><i class="bi bi-lightning-charge-fill"></i> {sim}%</div>' if sim > 0 else ''
        return f'''
                <div class="card" style="position:relative;width:240px;border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;background:#fff;transition:all .3s;box-shadow:0 2px 8px rgba(0,0,0,.06);margin:8px;">
                    {sim_badge}
                    <div class="card-img-top" style="width:100%;height:180px;overflow:hidden;background:#f5f5f5;display:flex;align-items:center;justify-content:center;">
                        {km_badge}
                        <img src="{img}" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.src='{base_host}/Pic/Pic_SanPham/default.svg'" />
                    </div>
                    <div class="card-body" style="padding:12px;">
                        <p class="card-title" style="font-size:13px;font-weight:600;color:#333;margin-bottom:8px;line-height:1.4;height:36px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">{ten}</p>
                        <div class="product-card-prices" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                            <span class="product-price-current" style="color:#dc3545;font-size:15px;font-weight:700;">{gia_str}</span>
                            {gia_goc_str}
                        </div>
                    </div>
                </div>'''

    cards_html = '\n'.join([_make_card(sp) for sp in results])

    # Save results to localStorage for TrangSanPham page (backup)
    # Use proper JSON stringify for localStorage (single quotes OK for JS string)
    results_escaped = json.dumps(results, ensure_ascii=False)
    meta_json = json.dumps({'topLabel': labels, 'count': len(results)}, ensure_ascii=False)

    next_url_js = json.dumps(next_page_url)
    html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Kết quả AI - NoiThatXinh</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: Arial, sans-serif; background: #f5f7f9; min-height: 100vh; }}
    .container {{ max-width: 1200px; margin: 0 auto; padding: 0 16px; }}
    .header {{
      background: #1E4D36;
      color: white;
      padding: 24px 16px;
      text-align: center;
      border-bottom: 4px solid #f59e0b;
    }}
    .header h1 {{ font-size: 1.6rem; margin-bottom: 6px; font-weight: 700; }}
    .header .subtitle {{ opacity: 0.85; font-size: 0.9rem; }}
    .count-bar {{
      background: #fff;
      padding: 14px 20px;
      text-align: center;
      font-size: 1rem;
      color: #333;
      border-bottom: 1px solid #e0e0e0;
    }}
    .count-bar strong {{ color: #1E4D36; font-size: 1.1rem; }}
    .count-bar .bi-check-circle-fill {{ color: #1E4D36; margin-right: 6px; }}
    .grid {{
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      padding: 24px 8px;
      gap: 0;
    }}
    .card:hover {{
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,.12) !important;
      border-color: #1E4D36 !important;
    }}
    .footer {{
      text-align: center;
      padding: 24px 16px 40px;
    }}
    .btn-detail {{
      display: inline-block;
      padding: 14px 36px;
      background: #1E4D36;
      color: white !important;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      text-decoration: none;
      transition: background .2s, transform .2s;
      margin: 6px;
    }}
    .btn-detail:hover {{
      background: #2a6b4d;
      transform: translateY(-2px);
      text-decoration: none;
      color: white;
    }}
    .btn-back {{
      display: inline-block;
      padding: 12px 28px;
      background: #f0f0f0;
      color: #555 !important;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      transition: background .2s;
      margin: 6px;
    }}
    .btn-back:hover {{
      background: #e0e0e0;
      text-decoration: none;
      color: #333;
    }}
    .footer-note {{
      margin-top: 16px;
      font-size: 0.82rem;
      color: #aaa;
    }}
    @media (max-width: 768px) {{
      .card {{ width: calc(50% - 16px) !important; }}
      .header h1 {{ font-size: 1.2rem; }}
    }}
  </style>
</head>
<body>
  <div class="header">
    <h1><i class="bi bi-lightning-charge-fill"></i> Kết quả tìm kiếm bằng ảnh</h1>
    <div class="subtitle">Dựa trên hình ảnh bạn đã tải lên</div>
  </div>
  <div class="count-bar">
    <i class="bi bi-check-circle-fill"></i>
    Tìm thấy <strong>{len(results)} sản phẩm</strong> tương tự{banner_subtitle}
  </div>
  <div class="grid" id="productGrid">
{cards_html}
  </div>
  <div class="footer">
    <a href="{next_page_url}" class="btn-detail"><i class="bi bi-arrow-right-circle-fill"></i> Xem chi tiết &rarr;</a>
    <a href="{base_host}/TrangChu/TrangChu.html" class="btn-back"><i class="bi bi-house-fill"></i> Quay lại trang chủ</a>
    <div class="footer-note">
      Sản phẩm được tìm thấy dựa trên hình ảnh bạn đã upload
    </div>
  </div>
  <script>
    // Save to localStorage so TrangSanPham page can also show results
    try {{
      localStorage.setItem('ai_search_results', {results_escaped});
      localStorage.setItem('ai_search_meta', {meta_json});
    }} catch(e) {{ console.warn('localStorage error:', e); }}
    console.log('[AI RESULT] Loaded {len(results)} products, localStorage saved');
  </script>
</body>
</html>"""

    resp = make_response(html)
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    resp.headers['Pragma'] = 'no-cache'
    resp.headers['Expires'] = '0'
    return resp


def _error_html(message, request=None):
    base_host = request.host_url.rstrip('/') if request else 'http://127.0.0.1:5000'
    home_url = f"{base_host}/TrangChu/TrangChu.html"
    html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Lỗi AI Search</title>
  <style>
    body {{ font-family: Arial, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#f6f7f9; }}
    .card {{ background:#fff; padding:28px 32px; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.08); text-align:center; max-width:420px; }}
    .icon {{ font-size:42px; margin-bottom:14px; }}
    h2 {{ color:#dc3545; margin:0 0 10px; }}
    p {{ color:#5f6b66; margin:0 0 18px; }}
    a {{ display:inline-block; padding:10px 18px; border-radius:10px; background:#1E4D36; color:#fff; text-decoration:none; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">!</div>
    <h2>Tìm kiếm thất bại</h2>
    <p>{escape(message)}</p>
    <a href="{home_url}">Quay lại trang chủ</a>
  </div>
</body>
</html>"""
    return make_response(html)


@ai_bp.route('/search-base64', methods=['POST'])
def search_by_base64():
    """
    POST /api/ai/search-base64
    Gửi ảnh dạng base64 (từ canvas camera) → tìm sản phẩm tương tự

    JSON body:
        - image: chuỗi base64 (có hoặc không có prefix "data:image/...")
    """
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'success': False, 'message': 'Vui lòng gửi ảnh base64'}), 400

    try:
        image_path = save_base64_image(data['image'])
        with open(image_path, 'rb') as f:
            image_bytes = f.read()
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi xử lý ảnh: {e}'}), 400

    return _do_ai_search(image_bytes, image_path, request)


def _do_ai_search(image_bytes, image_path=None, request=None):
    """
    Logic xử lý AI search chung cho cả upload file và base64.
    Tách riêng để tái sử dụng.
    """
    import traceback

    print(f"[AI SEARCH] image_bytes len={len(image_bytes)}, image_path={image_path}", flush=True)

    try:
        ai = get_ai_service()
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Lỗi khởi tạo AI: {e}',
        }), 500

    try:
        result = ai.search_by_image(image_bytes)
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Lỗi xử lý AI: {e}',
        }), 500

    detections = result.get('detections', [])
    similar = result.get('similar_products', [])
    proc_time = result.get('processing_time', {})
    top_label = result.get('top_label')
    query_vector = result.get('query_vector', [])

    # ── Fallback: nếu FAISS trả rỗng, dùng YOLO label hoặc vector để tìm ──
    if not similar:
        if top_label:
            print(f"[AI SEARCH] FAISS empty → fallback text search với label='{top_label}'", flush=True)
        else:
            print(f"[AI SEARCH] FAISS empty + no detections → fallback random san pham", flush=True)

        try:
            query = SanPham.query.filter(SanPham.TrangThai == 'active')
            fallback_products = []

            if top_label:
                keywords = build_label_keywords(top_label)
                print(f"[AI SEARCH] Fallback keywords: {keywords}", flush=True)
                conditions = [SanPham.YOLOLabel == top_label]
                for keyword in keywords:
                    conditions.extend([
                        SanPham.TenSP.ilike(f'%{keyword}%'),
                        SanPham.MoTa.ilike(f'%{keyword}%'),
                        SanPham.ChatLieu.ilike(f'%{keyword}%'),
                        SanPham.MauSac.ilike(f'%{keyword}%'),
                    ])
                fallback_products = query.filter(db.or_(*conditions)).limit(12).all()

            if not fallback_products:
                print('[AI SEARCH] No keyword match, fallback to random active products', flush=True)
                fallback_products = query.order_by(db.func.rand()).limit(12).all()

            for sp in fallback_products:
                similar.append({
                    'product_id': sp.MaSP,
                    'similarity': 0.0,
                    'yolo_label': sp.YOLOLabel or top_label or '',
                    '_fallback': True
                })
            print(f"[AI SEARCH] Fallback: tìm được {len(similar)} sản phẩm", flush=True)
        except Exception as e:
            print(f"[AI SEARCH] Fallback error: {e}", flush=True)

    # Load thông tin sản phẩm từ DB
    if similar:
        product_ids = [s['product_id'] for s in similar]
        products_map = load_products_by_ids(product_ids)

        formatted_results = []
        for s in similar:
            sp = products_map.get(s['product_id'])
            if sp:
                formatted_results.append(format_sanpham(
                    sp,
                    similarity=s['similarity'],
                    yolo_label=s.get('yolo_label'),
                    request=request
                ))
    else:
        formatted_results = []

    # Ghi lịch sử (nếu có user đăng nhập)
    try:
        user_id = None
        try:
            user_id = get_jwt_identity()
        except Exception:
            pass

        if user_id and image_path:
            log_search_history(user_id, image_path, detections, formatted_results, proc_time)
    except Exception as e:
        print(f"Loi ghi lich su: {e}")

    search_id = save_ai_search_session(
        results=formatted_results,
        detections=detections,
        top_label=result.get('top_label'),
        processing_time=proc_time,
        query_image=image_path,
    )

    return jsonify({
        'success': True,
        'data': {
            'searchId': search_id,
            'queryImage': image_path,
            'detections': detections,
            'topLabel': result.get('top_label'),
            'results': formatted_results,
            'totalResults': len(formatted_results),
            'visualFeatures': result.get('visual_features'),
            'processingTime': proc_time,
        }
    })


@ai_bp.route('/search-session/<string:search_id>', methods=['GET'])
def get_search_session(search_id):
    session_data = get_ai_search_session(search_id)
    if not session_data:
        return jsonify({'success': False, 'message': 'Phiên tìm kiếm không tồn tại hoặc đã hết hạn'}), 404

    return jsonify({
        'success': True,
        'data': session_data
    })


@ai_bp.route('/stats', methods=['GET'])
def ai_stats():
    """
    GET /api/ai/stats
    Thống kê AI search
    """
    try:
        today = datetime.now().date()
        total = LichSuTimKiemAnh.query.count()
        today_count = LichSuTimKiemAnh.query.filter(
            db.func.date(LichSuTimKiemAnh.ThoiGian) == today
        ).count()

        avg_time = db.session.query(
            db.func.avg(LichSuTimKiemAnh.ThoiGianTong)
        ).scalar() or 0

        success_count = LichSuTimKiemAnh.query.filter(
            LichSuTimKiemAnh.TrangThai == 'success',
            LichSuTimKiemAnh.SoKetQua > 0
        ).count()

        success_rate = round(success_count / total * 100, 1) if total > 0 else 0

        return jsonify({
            'success': True,
            'data': {
                'tongLuotTimKiem': total,
                'luotTimKiemHomNay': today_count,
                'trungBinhXuLy_ms': round(float(avg_time), 1),
                'tyLeCoKetQua': success_rate,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@ai_bp.route('/history', methods=['GET'])
@jwt_required(optional=True)
def search_history():
    """
    GET /api/ai/history
    Lịch sử tìm kiếm của user hiện tại
    """
    user_id = None
    try:
        user_id = get_jwt_identity()
    except Exception:
        pass

    if not user_id:
        return jsonify({'success': False, 'message': 'Vui lòng đăng nhập'}), 401

    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        limit = min(limit, 50)

        query = LichSuTimKiemAnh.query.filter(
            LichSuTimKiemAnh.MaND == user_id
        ).order_by(LichSuTimKiemAnh.ThoiGian.desc())

        pagination = query.paginate(page=page, per_page=limit, error_out=False)

        items = []
        for h in pagination.items:
            labels = []
            try:
                labels = json.loads(h.YOLOLabels) if h.YOLOLabels else []
            except Exception:
                pass

            results = []
            try:
                results = json.loads(h.KetQuaTimKiem) if h.KetQuaTimKiem else []
            except Exception:
                pass

            items.append({
                'id': h.MaTimKiem,
                'image': h.DuongDanAnh,
                'labels': labels,
                'soKetQua': h.SoKetQua or 0,
                'thoiGianXuLy': float(h.ThoiGianTong or 0),
                'thoiGian': h.ThoiGian.isoformat() if h.ThoiGian else None,
                'previewResults': results[:3],  # Chỉ gửi 3 kết quả đầu
            })

        return jsonify({
            'success': True,
            'data': {
                'items': items,
                'pagination': {
                    'page': pagination.page,
                    'totalPages': pagination.pages,
                    'totalItems': pagination.total,
                    'hasNext': pagination.has_next,
                }
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@ai_bp.route('/search-text', methods=['GET'])
def search_by_text():
    """
    GET /api/ai/search-text?q=keyword
    Tìm kiếm theo tên sản phẩm (fallback khi không dùng ảnh)
    """
    keyword = request.args.get('q', '').strip()
    if not keyword:
        return jsonify({'success': True, 'data': []})

    products = SanPham.query.filter(
        SanPham.TrangThai == 'active',
        SanPham.TenSP.ilike(f'%{keyword}%')
    ).limit(20).all()

    return jsonify({
        'success': True,
        'data': [format_sanpham(p, request=request) for p in products]
    })
