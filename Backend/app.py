from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from extensions import db
from config import Config

jwt = JWTManager()

# Resolve project root (Backend/ → parent)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PIC_FOLDER = os.path.join(PROJECT_ROOT, 'Pic')
CSS_FOLDER = os.path.join(PROJECT_ROOT, 'CSS')
JS_FOLDER = os.path.join(PROJECT_ROOT, 'JS')
TRANG_CHU_FOLDER = os.path.join(PROJECT_ROOT, 'TrangChu')
TRANG_DANH_MUC_FOLDER = os.path.join(PROJECT_ROOT, 'TrangDanhMucSanPham')
TRANG_CHI_TIET_FOLDER = os.path.join(PROJECT_ROOT, 'TrangChiTiet')
TRANG_THANH_TOAN_FOLDER = os.path.join(PROJECT_ROOT, 'TrangThanhToan')
LOGIN_FOLDER = os.path.join(PROJECT_ROOT, 'Login')
TRANG_GIOI_THIEU_FOLDER = os.path.join(PROJECT_ROOT, 'TrangGioiThieu')
TRANG_LIEN_HE_FOLDER = os.path.join(PROJECT_ROOT, 'TrangLienHe')


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    Config.init_logging()

    from utils.error_handlers import register_error_handlers
    register_error_handlers(app)

    # ── Static File Routes ──
    FOLDERS = {
        'Pic': PIC_FOLDER, 'CSS': CSS_FOLDER, 'JS': JS_FOLDER,
        'TrangChu': TRANG_CHU_FOLDER, 'TrangDanhMucSanPham': TRANG_DANH_MUC_FOLDER,
        'TrangChiTiet': TRANG_CHI_TIET_FOLDER, 'TrangThanhToan': TRANG_THANH_TOAN_FOLDER,
        'Login': LOGIN_FOLDER, 'TrangGioiThieu': TRANG_GIOI_THIEU_FOLDER,
        'TrangLienHe': TRANG_LIEN_HE_FOLDER
    }

    @app.route('/<folder>/<path:filename>')
    def serve_static(folder, filename):
        if folder in FOLDERS:
            return send_from_directory(FOLDERS[folder], filename)
        return {"error": "Not Found"}, 404

    # ── Root-level page routes (serve the main HTML files directly) ──
    @app.route('/TrangChu.html')
    def serve_trangchu_root():
        return send_from_directory(TRANG_CHU_FOLDER, 'TrangChu.html')

    @app.route('/TrangDanhMucSanPham/TrangSanPham.html')
    def serve_trangsanpham():
        return send_from_directory(TRANG_DANH_MUC_FOLDER, 'TrangSanPham.html')

    @app.route('/TrangChiTiet/TrangChiTiet.html')
    def serve_trangchitiet():
        return send_from_directory(TRANG_CHI_TIET_FOLDER, 'TrangChiTiet.html')

    @app.route('/TrangThanhToan/GioHang.html')
    def serve_giohang():
        return send_from_directory(TRANG_THANH_TOAN_FOLDER, 'GioHang.html')

    @app.route('/Login/DangNhap.html')
    def serve_dangnhap():
        return send_from_directory(LOGIN_FOLDER, 'DangNhap.html')

    @app.route('/TrangGioiThieu/TrangGioiThieu.html')
    def serve_gioithieu():
        return send_from_directory(TRANG_GIOI_THIEU_FOLDER, 'TrangGioiThieu.html')

    @app.route('/TrangLienHe/TrangLienHe.html')
    def serve_lienhe():
        return send_from_directory(TRANG_LIEN_HE_FOLDER, 'TrangLienHe.html')

    @app.route('/ai-results')
    def serve_ai_results_page():
        return send_from_directory(TRANG_DANH_MUC_FOLDER, 'TrangKetQuaAI.html')

    CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}}, supports_credentials=True)

    db.init_app(app)
    jwt.init_app(app)

    from routes.auth import auth_bp
    from routes.products import products_bp
    from routes.categories import categories_bp
    from routes.cart import cart_bp
    from routes.orders import orders_bp
    from routes.reviews import reviews_bp
    from routes.wishlist import wishlist_bp
    from routes.vouchers import vouchers_bp
    from routes.users import users_bp
    from routes.banners import banners_bp
    from routes.ai import ai_bp
    from routes.admin.dashboard import admin_dashboard_bp
    from routes.admin.products import admin_products_bp
    from routes.admin.orders import admin_orders_bp
    from routes.admin.customers import admin_customers_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(wishlist_bp, url_prefix='/api/wishlist')
    app.register_blueprint(vouchers_bp, url_prefix='/api/vouchers')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(banners_bp, url_prefix='/api/banners')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(admin_dashboard_bp, url_prefix='/api/admin/dashboard')
    app.register_blueprint(admin_products_bp, url_prefix='/api/admin/products')
    app.register_blueprint(admin_orders_bp, url_prefix='/api/admin/orders')
    app.register_blueprint(admin_customers_bp, url_prefix='/api/admin/customers')

    @app.route('/api/health')
    def health():
        from services.vector_service import rebuild_index_if_needed
        rebuild_index_if_needed(app)
        return {'status': 'ok', 'message': 'NoiThatXin API is running', 'db': 'SQL Server'}

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
