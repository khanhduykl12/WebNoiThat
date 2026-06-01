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
from datetime import datetime

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename

from models import SanPham
from models.user import NguoiDung, LichSuTimKiemAnh
from extensions import db
from ai_service import get_ai_service
from config import Config

ai_bp = Blueprint('ai', __name__)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}


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


def format_sanpham(sp, similarity=None, yolo_label=None):
    """Format SanPham model → dict cho response"""
    gia_ban = float(sp.GiaBan or 0)
    khuyen_mai = sp.KhuyenMai or 0
    gia_sau_giam = round(gia_ban * (100 - khuyen_mai) / 100, -3)

    data = {
        'id': sp.MaSP,
        'MaSP': sp.MaSP,
        'tenSP': sp.TenSP,
        'moTa': sp.MoTa,
        'giaGoc': float(sp.GiaGoc or 0),
        'giaBan': gia_ban,
        'giaSauGiam': gia_sau_giam,
        'khuyenMai': khuyen_mai,
        'hinhAnh': sp.HinhAnh,
        'hinhAnhPhu': [sp.HinhAnhPhu1, sp.HinhAnhPhu2, sp.HinhAnhPhu3, sp.HinhAnhPhu4],
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

    return _do_ai_search(image_bytes, image_path)


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

    return _do_ai_search(image_bytes, image_path)


def _do_ai_search(image_bytes, image_path=None):
    """
    Logic xử lý AI search chung cho cả upload file và base64.
    Tách riêng để tái sử dụng.
    """
    try:
        ai = get_ai_service()
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khởi tạo AI: {e}',
        }), 500

    try:
        result = ai.search_by_image(image_bytes)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi xử lý AI: {e}',
        }), 500

    detections = result.get('detections', [])
    similar = result.get('similar_products', [])
    proc_time = result.get('processing_time', {})

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
                    yolo_label=s.get('yolo_label')
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

    return jsonify({
        'success': True,
        'data': {
            'queryImage': image_path,
            'detections': detections,
            'topLabel': result.get('top_label'),
            'results': formatted_results,
            'totalResults': len(formatted_results),
            'processingTime': proc_time,
        }
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
        'data': [format_sanpham(p) for p in products]
    })
