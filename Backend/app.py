from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from extensions import db
from config import Config

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

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
