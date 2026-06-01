from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import SanPham
from models.user import YeuThich
from extensions import db

wishlist_bp = Blueprint('wishlist', __name__)

@wishlist_bp.route('/', methods=['GET'])
@jwt_required()
def get_wishlist():
    user_id = int(get_jwt_identity())
    items = YeuThich.query.filter_by(MaND=user_id).all()
    result = []
    for item in items:
        sp = SanPham.query.get(item.MaSP)
        if sp:
            result.append(sp.to_dict())
    return jsonify({'success': True, 'data': result})

@wishlist_bp.route('/', methods=['POST'])
@jwt_required()
def add_wishlist():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    ma_sp = data.get('MaSP')

    existing = YeuThich.query.filter_by(MaND=user_id, MaSP=ma_sp).first()
    if existing:
        return jsonify({'success': False, 'message': 'Already in wishlist'}), 409

    item = YeuThich(MaND=user_id, MaSP=ma_sp)
    db.session.add(item)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Added to wishlist'})

@wishlist_bp.route('/<int:ma_sp>', methods=['DELETE'])
@jwt_required()
def remove_wishlist(ma_sp):
    user_id = int(get_jwt_identity())
    item = YeuThich.query.filter_by(MaND=user_id, MaSP=ma_sp).first()
    if not item:
        return jsonify({'success': False, 'message': 'Not found'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Removed from wishlist'})
