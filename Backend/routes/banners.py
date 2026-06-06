from flask import Blueprint, request, jsonify
from models.user import Banner
from models import make_absolute_image_url
from datetime import datetime

banners_bp = Blueprint('banners', __name__)

@banners_bp.route('/', methods=['GET'])
def get_banners():
    now = datetime.now()
    loai = request.args.get('type', '')

    query = Banner.query.filter(
        Banner.TrangThai == 'active',
        (Banner.NgayBatDau == None) | (Banner.NgayBatDau <= now),
        (Banner.NgayKetThuc == None) | (Banner.NgayKetThuc >= now)
    )
    if loai:
        query = query.filter(Banner.Loai == loai)

    banners = query.order_by(Banner.ThuTu).all()

    return jsonify({
        'success': True,
        'data': [{
            'MaBanner': b.MaBanner,
            'TenBanner': b.TenBanner,
            'Loai': b.Loai,
            'DuongDanAnh': make_absolute_image_url(b.DuongDanAnh),
            'LinkDen': b.LinkDen,
            'TieuDe': b.TieuDe,
            'MoTa': b.MoTa,
            'ChuThich': b.ChuThich,
            'MauNen': b.MauNen,
            'ViTriHienThi': b.ViTriHienThi,
        } for b in banners]
    })
