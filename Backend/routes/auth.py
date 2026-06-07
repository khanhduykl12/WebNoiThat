from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models.user import NguoiDung
from extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400

    if NguoiDung.query.filter_by(Email=data.get('Email')).first():
        return jsonify({'success': False, 'message': 'Email already exists'}), 409
    if NguoiDung.query.filter_by(TenDangNhap=data.get('TenDangNhap')).first():
        return jsonify({'success': False, 'message': 'Username already exists'}), 409

    user = NguoiDung(
        HoTen=data.get('HoTen'),
        Email=data.get('Email'),
        SoDienThoai=data.get('SoDienThoai'),
        TenDangNhap=data.get('TenDangNhap'),
        GioiTinh=data.get('GioiTinh'),
        DiaChi=data.get('DiaChi'),
        VaiTro='customer',
        TrangThai='active'
    )
    user.set_password(data.get('MatKhau', '123456'))

    db.session.add(user)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Register successful', 'user': user.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400

    user = NguoiDung.query.filter_by(TenDangNhap=data.get('TenDangNhap')).first()

    if not user or not user.check_password(data.get('MatKhau', '')):
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

    if user.TrangThai != 'active':
        return jsonify({'success': False, 'message': 'Account is inactive or banned'}), 403

    access_token = create_access_token(identity=str(user.MaND))
    refresh_token = create_refresh_token(identity=str(user.MaND))

    return jsonify({
        'success': True,
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    })


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({'success': True, 'access_token': access_token})


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = NguoiDung.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    return jsonify({'success': True, 'user': user.to_dict()})


@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': 'Logout successful'})


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = NguoiDung.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    data = request.get_json()
    if not user.check_password(data.get('MatKhauCu', '')):
        return jsonify({'success': False, 'message': 'Current password is incorrect'}), 400

    user.set_password(data.get('MatKhauMoi'))
    db.session.commit()
    return jsonify({'success': True, 'message': 'Password changed successfully'})
