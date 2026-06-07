"""
Auto-Label Script — Dùng YOLOv8 custom model để gắn nhãn YOLO
cho toàn bộ sản phẩm trong DB mà chưa có YOLOLabel.

Chạy độc lập (không cần FAISS index):
    python auto_label_products.py

Hoặc dùng chung với generate_embeddings.py (đã tích hợp sẵn):
    python generate_embeddings.py --label-only
"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models import SanPham
from ai_service import get_ai_service


BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def resolve_image_path(relative_path: str) -> str:
    if not relative_path:
        return None
    path = relative_path if os.path.isabs(relative_path) else os.path.join(BASE_PATH, relative_path)
    candidates = [
        path,
        path.replace('\\', '/'),
        os.path.join(BASE_PATH, relative_path.replace('\\', '/')),
    ]
    for cand in candidates:
        if os.path.exists(cand):
            return cand
    return None


def load_image_bytes(image_path: str) -> bytes:
    full = resolve_image_path(image_path)
    if not full:
        return None
    try:
        with open(full, 'rb') as f:
            return f.read()
    except Exception:
        return None


def main():
    app = create_app()

    with app.app_context():
        print("=" * 60)
        print("  AUTO-LABEL SẢN PHẨM VỚI YOLOv8 CUSTOM")
        print("=" * 60)

        ai = get_ai_service()
        print(f"  Model: {ai.yolo}")
        print(f"  Classes: {len(ai.class_names)}")
        for i, name in enumerate(ai.class_names):
            print(f"    [{i:2d}] {name}")

        # Lấy sản phẩm chưa có YOLO label
        products = SanPham.query.filter(
            SanPham.TrangThai == 'active',
            db.or_(
                SanPham.YOLOLabel.is_(None),
                SanPham.YOLOLabel == ''
            )
        ).all()

        total = len(products)
        print(f"\n  Sản phẩm cần label: {total}")
        print("=" * 60)

        if total == 0:
            print("  Tất cả sản phẩm đã có nhãn YOLO!")
            return

        success = 0
        skipped = 0
        errors = 0

        for i, sp in enumerate(products, 1):
            # Tìm ảnh
            img_path = sp.HinhAnh
            if not img_path:
                for field in [sp.HinhAnhPhu1, sp.HinhAnhPhu2,
                               sp.HinhAnhPhu3, sp.HinhAnhPhu4]:
                    if field:
                        img_path = field
                        break

            if not img_path:
                print(f"  [{i}/{total}] SKIP MaSP={sp.MaSP} — không có ảnh")
                skipped += 1
                continue

            img_bytes = load_image_bytes(img_path)
            if not img_bytes:
                print(f"  [{i}/{total}] ERROR MaSP={sp.MaSP} — đọc ảnh thất bại: {img_path}")
                errors += 1
                continue

            detections = ai.detect_furniture(img_bytes, conf_threshold=0.25)

            if detections:
                best = max(detections, key=lambda x: x['confidence'])
                sp.YOLOLabel = best['label']
                sp.YOLOConfidence = best['confidence']
                label_str = f"{best['label']} ({best['confidence']:.2f})"
            else:
                sp.YOLOLabel = None
                sp.YOLOConfidence = 0.0
                label_str = "No detection"

            try:
                db.session.commit()
                success += 1
                print(f"  [{i}/{total}] OK    MaSP={sp.MaSP:3d} | {sp.TenSP[:35]:<35} | {label_str}")
            except Exception as e:
                db.session.rollback()
                print(f"  [{i}/{total}] ERROR MaSP={sp.MaSP} — {e}")
                errors += 1

        print("\n" + "=" * 60)
        print(f"  KẾT QUẢ:")
        print(f"    Thành công: {success}")
        print(f"    Lỗi:       {errors}")
        print(f"    Bỏ qua:    {skipped}")
        print(f"  Tổng:       {total}")
        print("=" * 60)
        print(f"\n  Xong! Tiếp theo chạy: python generate_embeddings.py")


if __name__ == '__main__':
    main()
