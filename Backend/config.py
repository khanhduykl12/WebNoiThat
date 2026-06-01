import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')

    DB_SERVER = os.getenv('DB_SERVER', 'localhost')
    DB_NAME = os.getenv('DB_NAME', 'noithatxin_db')
    DB_USER = os.getenv('DB_USER', '')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_DRIVER = os.getenv('DB_DRIVER', 'ODBC Driver 17 for SQL Server')
    DB_TRUSTED = os.getenv('DB_TRUSTED_CONNECTION', 'true').lower() == 'true'

    if DB_TRUSTED:
        SQLALCHEMY_DATABASE_URI = (
            f"mssql+pyodbc://{DB_SERVER}/{DB_NAME}"
            f"?driver={DB_DRIVER.replace(' ', '+')}&TrustServerCertificate=yes&Trusted_Connection=yes"
        )
    else:
        SQLALCHEMY_DATABASE_URI = (
            f"mssql+pyodbc://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}"
            f"?driver={DB_DRIVER.replace(' ', '+')}&TrustServerCertificate=yes"
        )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-dev-secret')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 1440))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 43200))

    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16777216))
    ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,webp').split(','))

    YOLO_MODEL_PATH = os.getenv('YOLO_MODEL_PATH', 'models/yolov12n.pt')
    VIT_MODEL = os.getenv('VIT_MODEL', 'vit_small_patch16_224')
    YOLO_CONFIDENCE = float(os.getenv('YOLO_CONFIDENCE', 0.25))
    AI_TOP_K = int(os.getenv('AI_TOP_K', 10))
    EMBEDDING_DIM = int(os.getenv('EMBEDDING_DIM', 384))
    YOLO_CLASS_NAMES = os.getenv('YOLO_CLASS_NAMES', '[]')
