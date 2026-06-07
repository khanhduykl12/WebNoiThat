import logging
import traceback
from flask import jsonify
from functools import wraps
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)

def global_error_handler(f):
    """Decorator to catch all exceptions in a route and return a standard JSON error response"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except SQLAlchemyError as e:
            logger.error(f"Database Error: {str(e)}")
            logger.debug(traceback.format_exc())
            return jsonify({
                'success': False,
                'message': 'Lỗi cơ sở dữ liệu. Vui lòng thử lại sau.'
            }), 500
        except Exception as e:
            logger.error(f"Unexpected Error: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({
                'success': False,
                'message': f'Lỗi hệ thống: {str(e)}'
            }), 500
    return decorated_function

def register_error_handlers(app):
    """Register global error handlers for standard HTTP errors"""
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'message': 'Endpoint không tồn tại'}), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({'success': False, 'message': 'Lỗi server hệ thống'}), 500
