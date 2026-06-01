from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import NguoiDung
from extensions import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = NguoiDung.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    return jsonify({'success': True, 'data': user.to_dict()})


@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = NguoiDung.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    data = request.get_json()
    user.HoTen = data.get('HoTen', user.HoTen)
    user.SoDienThoai = data.get('SoDienThoai', user.SoDienThoai)
    user.GioiTinh = data.get('GioiTinh', user.GioiTinh)
    user.NgaySinh = data.get('NgaySinh', user.NgaySinh)
    user.DiaChi = data.get('DiaChi', user.DiaChi)
    user.MaTinhThanh = data.get('MaTinhThanh', user.MaTinhThanh)
    user.MaQuanHuyen = data.get('MaQuanHuyen', user.MaQuanHuyen)
    user.MaPhuongXa = data.get('MaPhuongXa', user.MaPhuongXa)

    db.session.commit()
    return jsonify({'success': True, 'message': 'Profile updated', 'data': user.to_dict()})
