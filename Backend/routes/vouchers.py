from flask import Blueprint, request, jsonify
from models import SanPham, Voucher
from extensions import db
from datetime import datetime

vouchers_bp = Blueprint('vouchers', __name__)

@vouchers_bp.route('/apply', methods=['POST'])
def apply_voucher():
    data = request.get_json()
    code = data.get('MaCode', '').strip().upper()

    voucher = Voucher.query.filter_by(MaCode=code, TrangThai='active').first()

    if not voucher:
        return jsonify({'success': False, 'message': 'Invalid voucher code'}), 404

    now = datetime.now()
    if voucher.NgayBatDau and voucher.NgayBatDau > now:
        return jsonify({'success': False, 'message': 'Voucher not yet active'}), 400
    if voucher.NgayKetThuc and voucher.NgayKetThuc < now:
        return jsonify({'success': False, 'message': 'Voucher expired'}), 400
    if voucher.SoLuong <= voucher.DaSuDung:
        return jsonify({'success': False, 'message': 'Voucher exhausted'}), 400

    return jsonify({
        'success': True,
        'data': {
            'MaVoucher': voucher.MaVoucher,
            'TenVoucher': voucher.TenVoucher,
            'MaCode': voucher.MaCode,
            'LoaiGiam': voucher.LoaiGiam,
            'GiaTriGiam': float(voucher.GiaTriGiam) if voucher.GiaTriGiam else 0,
            'GiaTriToiDa': float(voucher.GiaTriToiDa) if voucher.GiaTriToiDa else None,
            'DonHangToiThieu': float(voucher.DonHangToiThieu) if voucher.DonHangToiThieu else 0,
        }
    })


@vouchers_bp.route('/available', methods=['GET'])
def get_available():
    now = datetime.now()
    vouchers = Voucher.query.filter(
        Voucher.TrangThai == 'active',
        Voucher.SoLuong > Voucher.DaSuDung,
        (Voucher.NgayBatDau == None) | (Voucher.NgayBatDau <= now),
        (Voucher.NgayKetThuc == None) | (Voucher.NgayKetThuc >= now)
    ).all()

    return jsonify({
        'success': True,
        'data': [{
            'MaVoucher': v.MaVoucher,
            'TenVoucher': v.TenVoucher,
            'MaCode': v.MaCode,
            'LoaiGiam': v.LoaiGiam,
            'GiaTriGiam': float(v.GiaTriGiam) if v.GiaTriGiam else 0,
            'NgayKetThuc': v.NgayKetThuc.isoformat() if v.NgayKetThuc else None,
        } for v in vouchers]
    })
