"""
Script reset password admin: chạy python reset_admin_password.py
Mặc định username: admin, password: 123456
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models.user import NguoiDung
from extensions import db

def reset_admin_password():
    app = create_app()
    with app.app_context():
        user = NguoiDung.query.filter_by(TenDangNhap='admin').first()
        if not user:
            print("Khong tim thay tai khoan admin!")
            return

        print(f"Tai khoan hien tai: {user.TenDangNhap}")
        print(f"MatKhau hien tai (raw): {user.MatKhau[:20]}...")
        print(f"Do dai MatKhau: {len(user.MatKhau)}")

        new_password = "admin123"
        user.set_password(new_password)
        db.session.commit()

        print(f"\nDa cap nhat mat khau admin thanh: {new_password}")
        print(f"MatKhau moi (hash): {user.MatKhau}")

        user_check = NguoiDung.query.filter_by(TenDangNhap='admin').first()
        if user_check.check_password(new_password):
            print("Xac minh: OK - mat khau dung!")
        else:
            print("Xac minh: LOI - mat khau khong khop!")

if __name__ == '__main__':
    reset_admin_password()
