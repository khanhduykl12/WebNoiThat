from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import SanPham, DanhGia
from extensions import db

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/product/<int:ma_sp>', methods=['GET'])
def get_reviews(ma_sp):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    pagination = DanhGia.query.filter_by(MaSP=ma_sp, TrangThai='approved') \
        .order_by(DanhGia.NgayDanhGia.desc()) \
        .paginate(page=page, per_page=per_page, error_out=False)

    result = []
    for r in pagination.items:
        result.append({
            'MaDanhGia': r.MaDanhGia,
            'HoTen': r.NguoiDung.HoTen if r.NguoiDung else 'Khách hàng',
            'SoSao': r.SoSao,
            'TieuDe': r.TieuDe,
            'NoiDung': r.NoiDung,
            'TrangThai': r.TrangThai,
            'HelpfulCount': r.HelpfulCount,
            'NgayDanhGia': r.NgayDanhGia.isoformat() if r.NgayDanhGia else None,
        })

    avg_rating = db.session.query(db.func.avg(DanhGia.SoSao)).filter_by(MaSP=ma_sp, TrangThai='approved').scalar() or 0
    count = DanhGia.query.filter_by(MaSP=ma_sp, TrangThai='approved').count()

    return jsonify({
        'success': True,
        'data': result,
        'avg_rating': round(float(avg_rating), 1),
        'total': count,
        'page': page,
        'pages': pagination.pages
    })


@reviews_bp.route('/', methods=['POST'])
@jwt_required()
def create_review():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    ma_sp = data.get('MaSP')
    so_sao = data.get('SoSao')

    if not ma_sp or not so_sao:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400

    if so_sao < 1 or so_sao > 5:
        return jsonify({'success': False, 'message': 'Rating must be 1-5'}), 400

    existing = DanhGia.query.filter_by(MaSP=ma_sp, MaND=user_id).first()
    if existing:
        return jsonify({'success': False, 'message': 'You already reviewed this product'}), 409

    review = DanhGia(
        MaSP=ma_sp,
        MaND=user_id,
        SoSao=so_sao,
        TieuDe=data.get('TieuDe'),
        NoiDung=data.get('NoiDung'),
        TrangThai='approved'
    )
    db.session.add(review)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Review submitted'}), 201
