import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Loader2, Camera, CameraOff } from 'lucide-react';
import { useAISearch } from '../hooks/useAISearch';
import AIResultsGrid from './AIResultsGrid';
import { productAPI } from '../services/api';

export default function SearchModal({ isOpen, onClose, initialTab = 'text' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Tab 1: Text
  const [textQuery, setTextQuery] = useState('');
  const [textResults, setTextResults] = useState([]);
  const [textLoading, setTextLoading] = useState(false);
  const [textNote, setTextNote] = useState('Nhập tên sản phẩm và nhấn tìm kiếm.');

  // Tab 2: Upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Tab 3: Camera
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const stopCameraRef = useRef(null);

  const {
    results: aiResults,
    loading: aiLoading,
    error: aiError,
    meta: aiMeta,
    searchByFile,
    searchByBase64,
    reset: resetAI,
  } = useAISearch();

  // Keyboard: Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Stop camera when tab switches away
  useEffect(() => {
    if (activeTab !== 'camera') {
      stopCameraRef.current?.();
    }
  }, [activeTab]);

  // ── Tab 1: Text search ──────────────────────────────────────────
  const handleTextSearch = async () => {
    if (!textQuery.trim()) return;
    setTextLoading(true);
    setTextNote('Đang tìm kiếm...');
    try {
      const data = await productAPI.search(textQuery.trim());
      if (data.success && data.data?.length) {
        setTextResults(data.data);
        setTextNote(`Tìm thấy ${data.data.length} kết quả cho "${textQuery}"`);
      } else {
        setTextResults([]);
        setTextNote('Không tìm thấy sản phẩm nào phù hợp.');
      }
    } catch {
      setTextNote('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setTextLoading(false);
    }
  };

  // ── Tab 2: File upload ─────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    resetAI();
  };

  const handleImageSearch = async () => {
    if (!selectedFile) return;
    await searchByFile(selectedFile);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    resetAI();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Tab 3: Camera ───────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // expose stopCamera to the ref for cleanup
  useEffect(() => { stopCameraRef.current = stopCamera; }, [stopCamera]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setCameraError('Không thể mở camera. Kiểm tra quyền truy cập thiết bị.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    searchByBase64(dataUrl);
  };

  // ── Close & reset ──────────────────────────────────────────────
  const handleClose = () => {
    stopCamera();
    setSelectedFile(null);
    setPreviewUrl(null);
    setTextResults([]);
    setTextNote('Nhập tên sản phẩm và nhấn tìm kiếm.');
    resetAI();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div className="bg-white w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-bottom border-gray-200 bg-white flex-shrink-0">
          <div>
            <h3 id="search-modal-title" className="fw-bold fs-5 mb-0 text-dark">Tìm kiếm sản phẩm</h3>
            <p className="text-secondary small mb-0 mt-1">
              Chọn cách tìm kiếm: nhập tên, upload ảnh, hoặc mở camera.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="btn btn-close"
            aria-label="Đóng"
          />
        </div>

        {/* Tabs */}
        <div className="modal-search-tabs px-6 pt-4 flex-shrink-0">
          {[
            { id: 'text', label: 'Nhập từ khóa' },
            { id: 'upload', label: 'Upload ảnh' },
            { id: 'camera', label: 'Mở camera' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">

          {/* ── TAB: Text ── */}
          {activeTab === 'text' && (
            <div className="search-panel-row">
              <div>
                <label className="form-label fw-semibold mb-2 d-block">Tìm sản phẩm theo tên</label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
                    placeholder="Nhập tên sản phẩm..."
                    className="form-control"
                    aria-label="Tìm kiếm sản phẩm"
                  />
                  <button
                    onClick={handleTextSearch}
                    disabled={textLoading || !textQuery.trim()}
                    className="btn btn-dark px-4 d-flex align-items-center gap-2"
                  >
                    {textLoading && <Loader2 size={16} className="spinner-border spinner-border-sm" />}
                    Tìm kiếm
                  </button>
                </div>
              </div>

              {textResults.length > 0 && (
                <div>
                  <p className="small text-secondary mb-3">{textNote}</p>
                  <div className="row g-2">
                    {textResults.map((p, i) => (
                      <div key={p.id || p.MaSP || i} className="col-6 col-sm-4 col-md-3">
                        <a
                          href={`../TrangChiTiet/TrangChiTiet.html?id=${p.id || p.MaSP}`}
                          className="d-block border rounded overflow-hidden text-decoration-none hover-shadow transition-shadow"
                        >
                          <img
                            src={p.HinhAnh || p.hinhAnh || 'http://localhost:5000/Pic/Pic_SanPham/default.svg'}
                            alt={p.TenSP || p.tenSP}
                            className="w-100"
                            style={{ height: '120px', objectFit: 'contain', background: '#f8f9fa' }}
                            onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_SanPham/default.svg'; }}
                          />
                          <div className="p-2">
                            <p className="small mb-1 text-dark line-clamp-2" style={{ minHeight: '2.5rem' }}>
                              {p.TenSP || p.tenSP}
                            </p>
                            <p className="fw-bold text-success mb-0 small">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
                                p.giaSauGiam || p.GiaBan || p.giaBan || 0
                              )}
                            </p>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="small text-secondary">{textNote}</div>
            </div>
          )}

          {/* ── TAB: Upload ── */}
          {activeTab === 'upload' && (
            <div className="search-panel-row">
              <div>
                <label className="form-label fw-semibold mb-2 d-block">Upload ảnh sản phẩm</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-control"
                />
              </div>

              <div className="image-preview-wrapper">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="image-preview" />
                ) : (
                  <span className="text-secondary small">Chưa có ảnh được chọn.</span>
                )}
              </div>

              {selectedFile && (
                <p className="small text-secondary mb-0">Đã chọn: {selectedFile.name}</p>
              )}

              <div className="d-flex gap-3">
                <button
                  onClick={handleImageSearch}
                  disabled={!selectedFile || aiLoading}
                  className="btn btn-dark px-5 flex-fill d-flex align-items-center justify-content-center gap-2"
                >
                  {aiLoading && <Loader2 size={16} className="spinner-border spinner-border-sm" />}
                  {aiLoading ? 'Đang xử lý AI...' : 'Tìm sản phẩm bằng ảnh'}
                </button>
                {selectedFile && (
                  <button onClick={handleClearImage} className="btn btn-outline-secondary px-4">
                    Xóa
                  </button>
                )}
              </div>

              <AIResultsGrid results={aiResults} meta={aiMeta} loading={aiLoading} error={aiError} />
            </div>
          )}

          {/* ── TAB: Camera ── */}
          {activeTab === 'camera' && (
            <div className="search-panel-row">
              <div>
                <label className="form-label fw-semibold mb-2 d-block">Mở camera để nhận diện ảnh</label>
                <div className="d-flex gap-3 mb-3">
                  {!cameraActive ? (
                    <button onClick={startCamera} className="btn btn-secondary d-flex align-items-center gap-2">
                      <Camera size={16} />
                      Bật camera
                    </button>
                  ) : (
                    <>
                      <button onClick={stopCamera} className="btn btn-outline-secondary d-flex align-items-center gap-2">
                        <CameraOff size={16} />
                        Tắt camera
                      </button>
                      <button onClick={capturePhoto} className="btn btn-dark flex-fill d-flex align-items-center justify-content-center gap-2">
                        <Camera size={16} />
                        Chụp ảnh &amp; Tìm kiếm
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="camera-preview-wrapper">
                {cameraActive ? (
                  <video ref={videoRef} autoPlay muted playsInline className="w-100" />
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary">
                    <Camera size={48} className="mb-3 opacity-25" />
                    <p className="small mb-1">Nhấn "Bật camera" để mở camera.</p>
                    <p className="small opacity-50 mb-0">Trình duyệt cần cho phép truy cập thiết bị.</p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="d-none" />

              {cameraError && (
                <div className="alert alert-danger py-2 small mb-0">{cameraError}</div>
              )}

              <AIResultsGrid results={aiResults} meta={aiMeta} loading={aiLoading} error={aiError} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
