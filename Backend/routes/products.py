from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import SanPham, DanhMuc, LoaiSanPham, Phong, BienTheSanPham, HinhAnhSanPham
from models.user import NguoiDung
from extensions import db
from sqlalchemy import func, or_

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    ma_phong = request.args.get('ma_phong', type=int)
    ma_danh_muc = request.args.get('ma_danh_muc', type=int)
    ma_loai = request.args.get('ma_loai', type=int)
    keyword = request.args.get('keyword', '')
    noi_bat = request.args.get('noi_bat', type=int)
    ban_chay = request.args.get('ban_chay', type=int)
    khuyen_mai = request.args.get('khuyen_mai', type=int)
    gia_min = request.args.get('gia_min', type=float)
    gia_max = request.args.get('gia_max', type=float)
    sort_by = request.args.get('sort_by', 'NgayTao')
    sort_order = request.args.get('sort_order', 'desc')

    query = SanPham.query.filter_by(TrangThai='active')

    if ma_phong:
        query = query.filter_by(MaPhong=ma_phong)
    if ma_danh_muc:
        query = query.filter_by(MaDanhMuc=ma_danh_muc)
    if ma_loai:
        query = query.filter_by(MaLoai=ma_loai)
    if keyword:
        query = query.filter(or_(
            SanPham.TenSP.ilike(f'%{keyword}%'),
            SanPham.MoTa.ilike(f'%{keyword}%')
        ))
    if noi_bat == 1:
        query = query.filter(SanPham.NoiBat == True)
    if ban_chay == 1:
        query = query.filter(SanPham.BanChay == True)
    if khuyen_mai == 1:
        query = query.filter(SanPham.KhuyenMai > 0)
    if gia_min is not None:
        query = query.filter(SanPham.GiaBan >= gia_min)
    if gia_max is not None:
        query = query.filter(SanPham.GiaBan <= gia_max)

    sort_column = getattr(SanPham, sort_by, SanPham.NgayTao)
    if sort_order == 'asc':
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    products = [p.to_dict() for p in pagination.items]

    return jsonify({
        'success': True,
        'data': products,
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    })


@products_bp.route('/<int:ma_sp>', methods=['GET'])
def get_product(ma_sp):
    sp = SanPham.query.get(ma_sp)
    if not sp:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    sp.SoLuotXem = (sp.SoLuotXem or 0) + 1
    db.session.commit()

    result = sp.to_dict()
    result['bien_the'] = [bt.to_dict() for bt in BienTheSanPham.query.filter_by(MaSP=ma_sp).all()]
    result['hinh_anh'] = [ha.to_dict() for ha in HinhAnhSanPham.query.filter_by(MaSP=ma_sp).all()]

    return jsonify({'success': True, 'data': result})


@products_bp.route('/featured', methods=['GET'])
def get_featured():
    products = SanPham.query.filter(SanPham.TrangThai == 'active', SanPham.NoiBat == True).limit(12).all()
    return jsonify({'success': True, 'data': [p.to_dict() for p in products]})


@products_bp.route('/bestseller', methods=['GET'])
def get_bestseller():
    products = SanPham.query.filter(SanPham.TrangThai == 'active', SanPham.BanChay == True).limit(12).all()
    return jsonify({'success': True, 'data': [p.to_dict() for p in products]})


@products_bp.route('/related/<int:ma_sp>', methods=['GET'])
def get_related(ma_sp):
    sp = SanPham.query.get(ma_sp)
    if not sp:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    related = SanPham.query.filter(
        SanPham.MaSP != ma_sp,
        SanPham.TrangThai == 'active',
        or_(
            SanPham.MaDanhMuc == sp.MaDanhMuc,
            SanPham.MaLoai == sp.MaLoai,
            SanPham.MaPhong == sp.MaPhong
        )
    ).limit(8).all()

    return jsonify({'success': True, 'data': [p.to_dict() for p in related]})


@products_bp.route('/search', methods=['GET'])
def search_products():
    keyword = request.args.get('q', '')
    if not keyword:
        return jsonify({'success': True, 'data': []})

    products = SanPham.query.filter(
        SanPham.TrangThai == 'active',
        or_(
            SanPham.TenSP.ilike(f'%{keyword}%'),
            SanPham.MoTa.ilike(f'%{keyword}%'),
            SanPham.ThuongHieu.ilike(f'%{keyword}%')
        )
    ).limit(20).all()

    return jsonify({'success': True, 'data': [p.to_dict() for p in products]})


# ----- Bien The -----
@products_bp.route('/<int:ma_sp>/variants', methods=['GET'])
def get_variants(ma_sp):
    variants = BienTheSanPham.query.filter_by(MaSP=ma_sp, TrangThai='active').all()
    return jsonify({'success': True, 'data': [v.to_dict() for v in variants]})
