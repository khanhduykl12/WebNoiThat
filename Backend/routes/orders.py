from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import SanPham, DonHang, ChiTietDonHang, GioHang, Voucher, NguoiDung
from extensions import db
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    pagination = DonHang.query.filter_by(MaND=user_id) \
        .order_by(DonHang.NgayDat.desc()) \
        .paginate(page=page, per_page=per_page, error_out=False)

    result = []
    for dh in pagination.items:
        chi_tiet = ChiTietDonHang.query.filter_by(MaDonHang=dh.MaDonHang).all()
        items = []
        for ct in chi_tiet:
            sp = SanPham.query.get(ct.MaSP)
            items.append({
                'MaSP': ct.MaSP,
                'TenSP': sp.TenSP if sp else '',
                'SoLuong': ct.SoLuong,
                'DonGia': float(ct.DonGia) if ct.DonGia else 0,
                'ThanhTien': float(ct.ThanhTien) if ct.ThanhTien else 0,
            })

        result.append({
            'MaDonHang': dh.MaDonHang,
            'MaDonHangHienThi': dh.MaDonHangHienThi,
            'NgayDat': dh.NgayDat.isoformat() if dh.NgayDat else None,
            'TongTienSauGiam': float(dh.TongTienSauGiam) if dh.TongTienSauGiam else 0,
            'TrangThaiDonHang': dh.TrangThaiDonHang,
            'TrangThaiThanhToan': dh.TrangThaiThanhToan,
            'PhuongThucThanhToan': dh.PhuongThucThanhToan,
            'chi_tiet': items
        })

    return jsonify({
        'success': True,
        'data': result,
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages
    })


@orders_bp.route('/<int:ma_dh>', methods=['GET'])
@jwt_required()
def get_order_detail(ma_dh):
    user_id = int(get_jwt_identity())
    dh = DonHang.query.filter_by(MaDonHang=ma_dh, MaND=user_id).first()
    if not dh:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

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
            'DiaChiGiaoHang': dh.DiaChiGiaoHang,
            'TongTienTruocGiam': float(dh.TongTienTruocGiam) if dh.TongTienTruocGiam else 0,
            'GiamGia': float(dh.GiamGia) if dh.GiamGia else 0,
            'PhiVanChuyen': float(dh.PhiVanChuyen) if dh.PhiVanChuyen else 0,
            'TongTienSauGiam': float(dh.TongTienSauGiam) if dh.TongTienSauGiam else 0,
            'TrangThaiDonHang': dh.TrangThaiDonHang,
            'TrangThaiThanhToan': dh.TrangThaiThanhToan,
            'PhuongThucThanhToan': dh.PhuongThucThanhToan,
            'NgayDat': dh.NgayDat.isoformat() if dh.NgayDat else None,
            'NgayXacNhan': dh.NgayXacNhan.isoformat() if dh.NgayXacNhan else None,
            'NgayGiaoHang': dh.NgayGiaoHang.isoformat() if dh.NgayGiaoHang else None,
            'NgayHuy': dh.NgayHuy.isoformat() if dh.NgayHuy else None,
            'LyDoHuy': dh.LyDoHuy,
            'chi_tiet': items
        }
    })


@orders_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    cart_items = GioHang.query.filter_by(MaND=user_id).all()
    if not cart_items:
        return jsonify({'success': False, 'message': 'Cart is empty'}), 400

    tong_tien = 0
    chi_tiet_list = []
    for item in cart_items:
        sp = SanPham.query.get(item.MaSP)
        if sp:
            gia = float(item.GiaTaiThoiDiemMua) if item.GiaTaiThoiDiemMua else float(sp.GiaBan)
            thanh_tien = gia * item.SoLuong
            tong_tien += thanh_tien
            chi_tiet_list.append({
                'MaSP': item.MaSP,
                'SoLuong': item.SoLuong,
                'DonGia': gia,
                'ThanhTien': thanh_tien,
                'MaBienThe': item.MaBienThe
            })

    voucher_code = data.get('MaVoucher')
    giam_gia = 0
    if voucher_code:
        voucher = Voucher.query.filter_by(MaCode=voucher_code, TrangThai='active').first()
        if voucher and voucher.SoLuong > voucher.DaSuDung:
            if voucher.LoaiGiam == 'phan_tram':
                giam_gia = tong_tien * float(voucher.GiaTriGiam) / 100
                if voucher.GiaTriToiDa and giam_gia > float(voucher.GiaTriToiDa):
                    giam_gia = float(voucher.GiaTriToiDa)
            else:
                giam_gia = float(voucher.GiaTriGiam)
            voucher.DaSuDung += 1

    phi_van_chuyen = float(data.get('PhiVanChuyen', 0))
    tong_sau_giam = tong_tien - giam_gia + phi_van_chuyen

    dh = DonHang(
        MaND=user_id,
        HoTenNguoiNhan=data.get('HoTenNguoiNhan'),
        SoDienThoaiNguoiNhan=data.get('SoDienThoaiNguoiNhan'),
        EmailNguoiNhan=data.get('EmailNguoiNhan'),
        DiaChiGiaoHang=data.get('DiaChiGiaoHang'),
        MaTinhThanhGiao=data.get('MaTinhThanhGiao'),
        MaQuanHuyenGiao=data.get('MaQuanHuyenGiao'),
        MaPhuongXaGiao=data.get('MaPhuongXaGiao'),
        GhiChu=data.get('GhiChu'),
        TongTienTruocGiam=tong_tien,
        GiamGia=giam_gia,
        PhiVanChuyen=phi_van_chuyen,
        TongTienSauGiam=tong_sau_giam,
        PhuongThucThanhToan=data.get('PhuongThucThanhToan', 'cod'),
        TrangThaiDonHang='cho_xac_nhan',
        TrangThaiThanhToan='chua_thanh_toan'
    )
    db.session.add(dh)
    db.session.flush()

    for ct_data in chi_tiet_list:
        ct = ChiTietDonHang(MaDonHang=dh.MaDonHang, **ct_data)
        db.session.add(ct)

    GioHang.query.filter_by(MaND=user_id).delete()

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Order created',
        'ma_don_hang': dh.MaDonHang,
        'ma_don_hang_hien_thi': dh.MaDonHangHienThi
    }), 201
