from flask import Blueprint, jsonify, request
from models import SanPham
from models.user import NguoiDung, DonHang, ChiTietDonHang
from extensions import db
from sqlalchemy import func
from datetime import datetime, date, timedelta

admin_dashboard_bp = Blueprint('admin_dashboard', __name__)

@admin_dashboard_bp.route('/stats', methods=['GET'])
def get_stats():
    today = date.today()
    current_year = datetime.now().year

    tong_sp = SanPham.query.filter_by(TrangThai='active').count()
    tong_kh = NguoiDung.query.filter_by(VaiTro='customer', TrangThai='active').count()
    tong_dh = DonHang.query.count()
    don_cho_xac_nhan = DonHang.query.filter_by(TrangThaiDonHang='cho_xac_nhan').count()

    sp_sap_het = SanPham.query.filter(SanPham.SoLuongTon <= 5, SanPham.SoLuongTon > 0).count()
    sp_het_hang = SanPham.query.filter_by(SoLuongTon=0).count()

    # Doanh thu năm
    doanh_thu_nam = db.session.query(func.sum(DonHang.TongTienSauGiam)).filter(
        DonHang.TrangThaiThanhToan == 'da_thanh_toan',
        func.year(DonHang.NgayDat) == current_year
    ).scalar() or 0

    # Doanh thu hôm nay
    doanh_thu_hom_nay = db.session.query(func.sum(DonHang.TongTienSauGiam)).filter(
        DonHang.TrangThaiThanhToan == 'da_thanh_toan',
        func.cast(DonHang.NgayDat, db.Date) == today
    ).scalar() or 0

    # Đơn hàng hôm nay
    don_hang_hom_nay = DonHang.query.filter(
        func.cast(DonHang.NgayDat, db.Date) == today
    ).count()

    # Khách hàng mới hôm nay
    khach_hang_moi = NguoiDung.query.filter(
        NguoiDung.VaiTro == 'customer',
        NguoiDung.TrangThai == 'active',
        func.cast(NguoiDung.NgayTao, db.Date) == today
    ).count()

    return jsonify({
        'success': True,
        'data': {
            'tong_san_pham': tong_sp,
            'tong_khach_hang': tong_kh,
            'tong_don_hang': tong_dh,
            'don_cho_xac_nhan': don_cho_xac_nhan,
            'sp_sap_het_hang': sp_sap_het,
            'sp_het_hang': sp_het_hang,
            'doanh_thu_nam': float(doanh_thu_nam),
            'doanh_thu_hom_nay': float(doanh_thu_hom_nay),
            'don_hang_hom_nay': don_hang_hom_nay,
            'khach_hang_moi': khach_hang_moi,
        }
    })


@admin_dashboard_bp.route('/revenue', methods=['GET'])
def get_revenue():
    days = request.args.get('days', 7, type=int)
    start_date = date.today() - timedelta(days=days - 1)

    rows = db.session.query(
        func.cast(DonHang.NgayDat, db.Date).label('ngay'),
        func.sum(DonHang.TongTienSauGiam).label('doanh_thu'),
        func.count(DonHang.MaDonHang).label('so_don')
    ).filter(
        DonHang.TrangThaiThanhToan == 'da_thanh_toan',
        func.cast(DonHang.NgayDat, db.Date) >= start_date
    ).group_by('ngay').order_by('ngay asc').all()

    return jsonify({
        'success': True,
        'data': [{'ngay': str(r.ngay), 'doanh_thu': float(r.doanh_thu), 'so_don': r.so_don} for r in rows]
    })


@admin_dashboard_bp.route('/top-products', methods=['GET'])
def get_top_products():
    rows = db.session.query(
        SanPham.MaSP,
        SanPham.TenSP,
        SanPham.HinhAnh,
        func.sum(ChiTietDonHang.SoLuong).label('tong_ban')
    ).join(ChiTietDonHang, SanPham.MaSP == ChiTietDonHang.MaSP) \
     .group_by(SanPham.MaSP, SanPham.TenSP, SanPham.HinhAnh) \
     .order_by(func.sum(ChiTietDonHang.SoLuong).desc()).limit(10).all()

    return jsonify({
        'success': True,
        'data': [{'MaSP': r.MaSP, 'TenSP': r.TenSP, 'HinhAnh': r.HinhAnh, 'tong_ban': r.tong_ban} for r in rows]
    })
