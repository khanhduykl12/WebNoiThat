from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import SanPham, BienTheSanPham
from models.user import NguoiDung
from models.cart import GioHang
from extensions import db
from sqlalchemy import or_

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = int(get_jwt_identity())
    items = GioHang.query.filter_by(MaND=user_id).all()
    result = []
    total = 0
    for item in items:
        sp = SanPham.query.get(item.MaSP)
        if sp:
            gia = float(item.GiaTaiThoiDiemMua) if item.GiaTaiThoiDiemMua else float(sp.GiaBan)
            result.append({
                'MaGioHang': item.MaGioHang,
                'MaSP': item.MaSP,
                'TenSP': sp.TenSP,
                'HinhAnh': sp.HinhAnh,
                'SoLuong': item.SoLuong,
                'Gia': gia,
                'ThanhTien': gia * item.SoLuong,
                'MaBienThe': item.MaBienThe,
            })
            total += gia * item.SoLuong

    return jsonify({'success': True, 'data': result, 'tong_tien': total})


@cart_bp.route('/', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    ma_sp = data.get('MaSP')
    so_luong = data.get('SoLuong', 1)
    ma_bien_the = data.get('MaBienThe')

    sp = SanPham.query.get(ma_sp)
    if not sp:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    existing = GioHang.query.filter_by(MaND=user_id, MaSP=ma_sp, MaBienThe=ma_bien_the).first()

    if existing:
        existing.SoLuong += so_luong
        existing.GiaTaiThoiDiemMua = sp.GiaBan
    else:
        item = GioHang(
            MaND=user_id,
            MaSP=ma_sp,
            MaBienThe=ma_bien_the,
            SoLuong=so_luong,
            GiaTaiThoiDiemMua=sp.GiaBan
        )
        db.session.add(item)

    db.session.commit()
    return jsonify({'success': True, 'message': 'Added to cart'})


@cart_bp.route('/<int:ma_gio_hang>', methods=['PUT'])
@jwt_required()
def update_cart(ma_gio_hang):
    user_id = int(get_jwt_identity())
    data = request.get_json()

    item = GioHang.query.filter_by(MaGioHang=ma_gio_hang, MaND=user_id).first()
    if not item:
        return jsonify({'success': False, 'message': 'Item not found'}), 404

    if 'SoLuong' in data:
        if data['SoLuong'] <= 0:
            db.session.delete(item)
        else:
            item.SoLuong = data['SoLuong']

    db.session.commit()
    return jsonify({'success': True, 'message': 'Cart updated'})


@cart_bp.route('/<int:ma_gio_hang>', methods=['DELETE'])
@jwt_required()
def delete_cart_item(ma_gio_hang):
    user_id = int(get_jwt_identity())
    item = GioHang.query.filter_by(MaGioHang=ma_gio_hang, MaND=user_id).first()
    if not item:
        return jsonify({'success': False, 'message': 'Item not found'}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Item removed'})


@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    user_id = int(get_jwt_identity())
    GioHang.query.filter_by(MaND=user_id).delete()
    db.session.commit()
    return jsonify({'success': True, 'message': 'Cart cleared'})
