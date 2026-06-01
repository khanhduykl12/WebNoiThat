from flask import Blueprint, request, jsonify
from models import SanPham, BienTheSanPham, HinhAnhSanPham
from extensions import db

admin_products_bp = Blueprint('admin_products', __name__)

@admin_products_bp.route('/', methods=['GET'])
def get_all_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    ma_loai = request.args.get('maLoai', '')
    status = request.args.get('status', '')

    query = SanPham.query

    if search:
        query = query.filter(SanPham.TenSP.ilike(f'%{search}%'))
    if ma_loai:
        query = query.filter(SanPham.MaLoai == int(ma_loai))
    if status:
        query = query.filter(SanPham.TrangThai == status)

    pagination = query.order_by(SanPham.MaSP.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'success': True,
        'data': [p.to_dict() for p in pagination.items],
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages
    })


@admin_products_bp.route('/<int:ma_sp>', methods=['GET'])
def get_product(ma_sp):
    sp = SanPham.query.get(ma_sp)
    if not sp:
        return jsonify({'success': False, 'message': 'Not found'}), 404
    return jsonify({'success': True, 'data': sp.to_dict()})


@admin_products_bp.route('/', methods=['POST'])
def create_product():
    data = request.get_json()
    sp = SanPham(
        TenSP=data.get('TenSP'),
        MoTa=data.get('MoTa'),
        MoTaChiTiet=data.get('MoTaChiTiet'),
        GiaGoc=data.get('GiaGoc', 0),
        GiaBan=data.get('GiaBan', 0),
        SoLuongTon=data.get('SoLuongTon', 0),
        HinhAnh=data.get('HinhAnh'),
        HinhAnhPhu1=data.get('HinhAnhPhu1'),
        HinhAnhPhu2=data.get('HinhAnhPhu2'),
        HinhAnhPhu3=data.get('HinhAnhPhu3'),
        HinhAnhPhu4=data.get('HinhAnhPhu4'),
        MaLoai=data.get('MaLoai'),
        MaDanhMuc=data.get('MaDanhMuc'),
        MaPhong=data.get('MaPhong'),
        ThuongHieu=data.get('ThuongHieu'),
        XuatXu=data.get('XuatXu'),
        ChatLieu=data.get('ChatLieu'),
        MauSac=data.get('MauSac'),
        KichThuoc=data.get('KichThuoc'),
        TrongLuong=data.get('TrongLuong'),
        BaoHanh=data.get('BaoHanh'),
        KhuyenMai=data.get('KhuyenMai', 0),
        NoiBat=data.get('NoiBat', False),
        BanChay=data.get('BanChay', False),
        TrangThai=data.get('TrangThai', 'active'),
    )
    db.session.add(sp)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Product created', 'MaSP': sp.MaSP}), 201


@admin_products_bp.route('/<int:ma_sp>', methods=['PUT'])
def update_product(ma_sp):
    sp = SanPham.query.get(ma_sp)
    if not sp:
        return jsonify({'success': False, 'message': 'Not found'}), 404

    data = request.get_json()
    for field in ['TenSP', 'MoTa', 'MoTaChiTiet', 'GiaGoc', 'GiaBan', 'SoLuongTon',
                  'HinhAnh', 'HinhAnhPhu1', 'HinhAnhPhu2', 'HinhAnhPhu3', 'HinhAnhPhu4',
                  'MaLoai', 'MaDanhMuc', 'MaPhong', 'ThuongHieu', 'XuatXu', 'ChatLieu',
                  'MauSac', 'KichThuoc', 'TrongLuong', 'BaoHanh', 'KhuyenMai',
                  'NoiBat', 'BanChay', 'TrangThai']:
        if field in data:
            setattr(sp, field, data[field])

    db.session.commit()
    return jsonify({'success': True, 'message': 'Product updated'})


@admin_products_bp.route('/<int:ma_sp>', methods=['DELETE'])
def delete_product(ma_sp):
    sp = SanPham.query.get(ma_sp)
    if not sp:
        return jsonify({'success': False, 'message': 'Not found'}), 404
    sp.TrangThai = 'inactive'
    db.session.commit()
    return jsonify({'success': True, 'message': 'Product deactivated'})
