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

    # URL: /Pic/Pic_SanPham/Sofa/Sofa01.jpg -> filesystem: <project>/Pic/Pic_SanPham/Sofa/Sofa01.jpg
    @app.route('/Pic/<path:filename>')
    def serve_pic(filename):
        return send_from_directory(PIC_FOLDER, filename)

    @app.route('/CSS/<path:filename>')
    def serve_css(filename):
        return send_from_directory(CSS_FOLDER, filename)

    @app.route('/JS/<path:filename>')
    def serve_js(filename):
        return send_from_directory(JS_FOLDER, filename)

    @app.route('/TrangChu/<path:filename>')
    def serve_trang_chu(filename):
        return send_from_directory(TRANG_CHU_FOLDER, filename)

    @app.route('/TrangDanhMucSanPham/<path:filename>')
    def serve_trang_danh_muc(filename):
        return send_from_directory(TRANG_DANH_MUC_FOLDER, filename)

    @app.route('/TrangChiTiet/<path:filename>')
    def serve_trang_chi_tiet(filename):
        return send_from_directory(TRANG_CHI_TIET_FOLDER, filename)

    @app.route('/TrangThanhToan/<path:filename>')
    def serve_trang_thanh_toan(filename):
        return send_from_directory(TRANG_THANH_TOAN_FOLDER, filename)

    @app.route('/Login/<path:filename>')
    def serve_login(filename):
        return send_from_directory(LOGIN_FOLDER, filename)

    @app.route('/TrangGioiThieu/<path:filename>')
    def serve_trang_gioi_thieu(filename):
        return send_from_directory(TRANG_GIOI_THIEU_FOLDER, filename)

    @app.route('/TrangLienHe/<path:filename>')
    def serve_trang_lien_he(filename):
        return send_from_directory(TRANG_LIEN_HE_FOLDER, filename)

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
        return {'status': 'ok', 'message': 'NoiThatXin API is running'}

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
