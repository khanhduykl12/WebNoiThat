from flask import Blueprint, request, jsonify
from models.user import NguoiDung
from extensions import db

admin_customers_bp = Blueprint('admin_customers', __name__)

@admin_customers_bp.route('/', methods=['GET'])
def get_customers():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    trang_thai = request.args.get('trang_thai', '')

    query = NguoiDung.query.filter_by(VaiTro='customer')

    if search:
        query = query.filter(
            (NguoiDung.HoTen.ilike(f'%{search}%')) |
            (NguoiDung.Email.ilike(f'%{search}%')) |
            (NguoiDung.SoDienThoai.ilike(f'%{search}%'))
        )
    if trang_thai:
        query = query.filter_by(TrangThai=trang_thai)

    pagination = query.order_by(NguoiDung.NgayTao.desc()) \
        .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'success': True,
        'data': [u.to_dict() for u in pagination.items],
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages
    })


@admin_customers_bp.route('/<int:ma_nd>', methods=['PUT'])
def update_customer(ma_nd):
    user = NguoiDung.query.get(ma_nd)
    if not user:
        return jsonify({'success': False, 'message': 'Not found'}), 404

    data = request.get_json()
    user.TrangThai = data.get('TrangThai', user.TrangThai)
    user.VaiTro = data.get('VaiTro', user.VaiTro)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Customer updated'})
