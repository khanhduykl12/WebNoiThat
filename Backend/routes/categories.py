from flask import Blueprint, request, jsonify
from models import DanhMuc, LoaiSanPham, Phong
from extensions import db

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/', methods=['GET'])
def get_categories():
    categories = DanhMuc.query.filter_by(TrangThai='active').order_by(DanhMuc.ThuTu).all()
    return jsonify({'success': True, 'data': [c.to_dict() for c in categories]})


@categories_bp.route('/rooms', methods=['GET'])
def get_rooms():
    rooms = Phong.query.order_by(Phong.ThuTu).all()
    return jsonify({'success': True, 'data': [r.to_dict() for r in rooms]})


@categories_bp.route('/types', methods=['GET'])
def get_types():
    ma_danh_muc = request.args.get('ma_danh_muc', type=int)
    if not ma_danh_muc:
        return jsonify({'success': False, 'message': 'ma_danh_muc is required'}), 400

    types = LoaiSanPham.query.filter_by(MaDanhMuc=ma_danh_muc).order_by(LoaiSanPham.ThuTu).all()
    return jsonify({'success': True, 'data': [t.to_dict() for t in types]})


# Add to_dict for Phong, DanhMuc, LoaiSanPham
def phong_to_dict(self):
    return {
        'MaPhong': self.MaPhong,
        'TenPhong': self.TenPhong,
        'BiDanh': self.BiDanh,
        'MoTa': self.MoTa,
        'HinhAnh': self.HinhAnh,
        'ThuTu': self.ThuTu,
    }

def danhmuc_to_dict(self):
    return {
        'MaDanhMuc': self.MaDanhMuc,
        'TenDanhMuc': self.TenDanhMuc,
        'MoTa': self.MoTa,
        'HinhAnh': self.HinhAnh,
        'BiDanh': self.BiDanh,
        'MaPhong': self.MaPhong,
        'ThuTu': self.ThuTu,
        'TrangThai': self.TrangThai,
    }

def loaisanpham_to_dict(self):
    return {
        'MaLoai': self.MaLoai,
        'MaDanhMuc': self.MaDanhMuc,
        'TenLoai': self.TenLoai,
        'MoTa': self.MoTa,
        'BiDanh': self.BiDanh,
        'ThuTu': self.ThuTu,
    }

Phong.to_dict = phong_to_dict
DanhMuc.to_dict = danhmuc_to_dict
LoaiSanPham.to_dict = loaisanpham_to_dict
