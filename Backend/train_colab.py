# ═══════════════════════════════════════════════════════════════════════════════
# TRAIN YOLOv8 cho NỘI THẤT — Google Colab (FREE GPU)
# ═══════════════════════════════════════════════════════════════════════════════
# Cách dùng:
#   1. Mở https://colab.research.google.com
#   2. Tạo notebook mới → paste từng cell
#   3. Upload dataset (zip) lên Colab hoặc dùng Roboflow API
#   4. Chạy lần lượt từ trên xuống
#   5. Sau khi train xong → Download best.pt về máy
# ═══════════════════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────────────────
# CELL 1: CÀI ĐẶT THƯ VIỆN
# ─────────────────────────────────────────────────────────────────────────────
!pip install ultralytics roboflow --quiet

# ─────────────────────────────────────────────────────────────────────────────
# CELL 2: IMPORT + KIỂM TRA GPU
# ─────────────────────────────────────────────────────────────────────────────
import torch
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")


# ─────────────────────────────────────────────────────────────────────────────
# CELL 3: KẾT NỐI ROBOFLOW (Lấy dataset đã labeled)
# ─────────────────────────────────────────────────────────────────────────────
# Thay API_KEY bằng key của bạn (lấy từ Roboflow → Settings → API Key)
from roboflow import Roboflow

rf = Roboflow(api_key="YOUR_ROBOFLOW_API_KEY_HERE")
project = rf.workspace("YOUR_WORKSPACE").project("YOUR_PROJECT_SLUG")
version = project.version(YOUR_VERSION_NUMBER)

# Tải dataset dạng YOLOv8
dataset = version.download("yolov8", location="./furniture_dataset")

# Sau cell này folder furniture_dataset/ sẽ có:
#   train/images, train/labels
#   valid/images, valid/labels
#   data.yaml

print(f"Dataset downloaded: {dataset.location}")


# ─────────────────────────────────────────────────────────────────────────────
# CELL 4: XEM data.yaml (để biết classes)
# ─────────────────────────────────────────────────────────────────────────────
import yaml

with open("./furniture_dataset/data.yaml") as f:
    data = yaml.safe_load(f)

print(f"Classes ({len(data['names'])}):")
for k, v in data['names'].items():
    print(f"  {k}: {v}")

print(f"\nTrain images: {len([f for f in os.listdir('./furniture_dataset/train/images') if f.endswith('.jpg')])}")
print(f"Valid images: {len([f for f in os.listdir('./furniture_dataset/valid/images') if f.endswith('.jpg')])}")


# ─────────────────────────────────────────────────────────────────────────────
# CELL 5: TRAIN YOLOv8
# ─────────────────────────────────────────────────────────────────────────────
from ultralytics import YOLO

# YOLOv8 nano — nhẹ, nhanh, phù hợp cho demo
# Muốn chính xác hơn thì dùng: yolov8s.pt, yolov8m.pt, yolov8l.pt
model = YOLO("yolov8n.pt")

# Train
results = model.train(
    data="./furniture_dataset/data.yaml",
    epochs=50,              # Số epochs — tăng nếu dataset lớn
    imgsz=640,             # Kích thước ảnh
    batch=16,              # Batch size — giảm nếu GPU RAM thấp
    name="furniture_yolov8",
    project="./runs",
    exist_ok=True,
    patience=10,           # Early stopping sau 10 epoch không cải thiện
    optimizer='AdamW',
    lr0=0.001,
    weight_decay=0.0005,
    augment=True,          # Data augmentation
    val=True,              # Validate mỗi epoch
    device=0,              # Dùng GPU
    verbose=True,
)

print("\n✅ TRAIN HOÀN TẤT!")
print(f"Best model: ./runs/furniture_yolov8/weights/best.pt")
print(f"Last model: ./runs/furniture_yolov8/weights/last.pt")


# ─────────────────────────────────────────────────────────────────────────────
# CELL 6: ĐÁNH GIÁ KẾT QUẢ
# ─────────────────────────────────────────────────────────────────────────────
# Load best model
best_model = YOLO("./runs/furniture_yolov8/weights/best.pt")

# In metrics
print("📊 KẾT QUẢ TRAIN:")
print(f"  mAP50:  {results.results_dict.get('metrics/mAP50(B)', 'N/A'):.4f}")
print(f"  mAP50-95: {results.results_dict.get('metrics/mAP50-95(B)', 'N/A'):.4f}")
print(f"  Precision: {results.results_dict.get('metrics/precision(B)', 'N/A'):.4f}")
print(f"  Recall:   {results.results_dict.get('metrics/recall(B)', 'N/A'):.4f}")


# ─────────────────────────────────────────────────────────────────────────────
# CELL 7: TEST THỬ TRÊN ẢNH
# ─────────────────────────────────────────────────────────────────────────────
# Upload ảnh test
from google.colab import files
import matplotlib.pyplot as plt
from PIL import Image

# Upload ảnh
uploaded = files.upload()

for filename in uploaded.keys():
    # Predict
    results = best_model.predict(
        source=filename,
        conf=0.25,
        save=True,
        show=False,
    )

    # Hiển thị kết quả
    result_img = Image.open(f"runs/detect/predict/{filename}")
    plt.figure(figsize=(10, 10))
    plt.imshow(result_img)
    plt.axis('off')
    plt.title(f"Kết quả: {filename}")
    plt.show()

    # In bounding boxes
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0].item())
            cls_name = best_model.names[cls_id]
            conf = float(box.conf[0].item())
            print(f"  - {cls_name}: {conf:.2f}")


# ─────────────────────────────────────────────────────────────────────────────
# CELL 8: DOWNLOAD best.pt VỀ MÁY
# ─────────────────────────────────────────────────────────────────────────────
# Tải file best.pt
files.download("./runs/furniture_yolov8/weights/best.pt")

# Sau khi tải về:
#   1. Copy best.pt vào Backend/models/
#   2. Sửa .env: YOLO_MODEL_PATH=models/best.pt
#   3. Cập nhật FURNITURE_CLASSES trong ai_service.py khớp với Roboflow classes


# ─────────────────────────────────────────────────────────────────────────────
# CELL 9: EXPORT SANG DẠNG KHÁC (nếu cần)
# ─────────────────────────────────────────────────────────────────────────────
# Export sang TensorFlow Lite (cho mobile/edge)
best_model.export(format='tflite')

# Export sang ONNX (cross-platform)
best_model.export(format='onnx')

print("✅ Export hoàn tất! Kiểm tra folder runs/")
