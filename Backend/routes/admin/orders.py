from flask import Blueprint, request, jsonify
from models import SanPham
from models.user import DonHang, ChiTietDonHang, NguoiDung
from extensions import db

admin_orders_bp = Blueprint('admin_orders', __name__)

@admin_orders_bp.route('/', methods=['GET'])
def get_orders():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    trang_thai = request.args.get('trang_thai')

    query = DonHang.query
    if trang_thai:
        query = query.filter_by(TrangThaiDonHang=trang_thai)

    pagination = query.order_by(DonHang.NgayDat.desc()).paginate(page=page, per_page=per_page, error_out=False)

    result = []
    for dh in pagination.items:
        items = ChiTietDonHang.query.filter_by(MaDonHang=dh.MaDonHang).all()
        result.append({
            'MaDonHang': dh.MaDonHang,
            'MaDonHangHienThi': dh.MaDonHangHienThi,
            'MaND': dh.MaND,
            'HoTenNguoiNhan': dh.HoTenNguoiNhan,
            'SoDienThoaiNguoiNhan': dh.SoDienThoaiNguoiNhan,
            'DiaChiGiaoHang': dh.DiaChiGiaoHang,
            'TongTienSauGiam': float(dh.TongTienSauGiam) if dh.TongTienSauGiam else 0,
            'TrangThaiDonHang': dh.TrangThaiDonHang,
            'TrangThaiThanhToan': dh.TrangThaiThanhToan,
            'PhuongThucThanhToan': dh.PhuongThucThanhToan,
            'NgayDat': dh.NgayDat.isoformat() if dh.NgayDat else None,
            'so_san_pham': len(items)
        })

    return jsonify({
        'success': True,
        'data': result,
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages
    })


@admin_orders_bp.route('/<int:ma_dh>', methods=['GET'])
def get_order_detail(ma_dh):
    dh = DonHang.query.get(ma_dh)
    if not dh:
        return jsonify({'success': False, 'message': 'Not found'}), 404

    chi_tiet = ChiTietDonHang.query.filter_by(MaDonHang=ma_dh).all()
    items = []
    for ct in chi_tiet:
        sp = SanPham.query.get(ct.MaSP)
        items.append({
            'MaSP': ct.MaSP,
            'TenSP': sp.TenSP if sp else '',
            'HinhAnh': sp.HinhAnh if sp else '',
            'SoLuong': ct.SoLuong,
            'DonGia': float(ct.DonGia) if ct.DonGia else 0,
            'ThanhTien': float(ct.ThanhTien) if ct.ThanhTien else 0,
        })

    return jsonify({
        'success': True,
        'data': {
            'MaDonHang': dh.MaDonHang,
            'MaDonHangHienThi': dh.MaDonHangHienThi,
            'HoTenNguoiNhan': dh.HoTenNguoiNhan,
            'SoDienThoaiNguoiNhan': dh.SoDienThoaiNguoiNhan,
            'EmailNguoiNhan': dh.EmailNguoiNhan,
            'DiaChiGiaoHang': dh.DiaChiGiaoHang,
            'TongTienTruocGiam': float(dh.TongTienTruocGiam) if dh.TongTienTruocGiam else 0,
            'GiamGia': float(dh.GiamGia) if dh.GiamGia else 0,
            'PhiVanChuyen': float(dh.PhiVanChuyen) if dh.PhiVanChuyen else 0,
            'TongTienSauGiam': float(dh.TongTienSauGiam) if dh.TongTienSauGiam else 0,
            'TrangThaiDonHang': dh.TrangThaiDonHang,
            'TrangThaiThanhToan': dh.TrangThaiThanhToan,
            'PhuongThucThanhToan': dh.PhuongThucThanhToan,
            'LyDoHuy': dh.LyDoHuy,
            'NgayDat': dh.NgayDat.isoformat() if dh.NgayDat else None,
            'NgayXacNhan': dh.NgayXacNhan.isoformat() if dh.NgayXacNhan else None,
            'NgayGiaoHang': dh.NgayGiaoHang.isoformat() if dh.NgayGiaoHang else None,
            'NgayHuy': dh.NgayHuy.isoformat() if dh.NgayHuy else None,
            'chi_tiet': items
        }
    })


@admin_orders_bp.route('/<int:ma_dh>/status', methods=['PUT'])
def update_status(ma_dh):
    dh = DonHang.query.get(ma_dh)
    if not dh:
        return jsonify({'success': False, 'message': 'Not found'}), 404

    data = request.get_json()
    new_status = data.get('TrangThaiDonHang')

    valid_statuses = ['cho_xac_nhan', 'da_xac_nhan', 'dang_xu_ly', 'dang_giao_hang', 'da_giao_hang', 'da_huy', 'tra_hang']
    if new_status not in valid_statuses:
        return jsonify({'success': False, 'message': 'Invalid status'}), 400

    dh.TrangThaiDonHang = new_status

    from datetime import datetime
    if new_status == 'da_xac_nhan':
        dh.NgayXacNhan = datetime.now()
    elif new_status == 'da_giao_hang':
        dh.NgayGiaoHang = datetime.now()
    elif new_status == 'da_huy':
        dh.NgayHuy = datetime.now()

    db.session.commit()
    return jsonify({'success': True, 'message': 'Status updated'})
