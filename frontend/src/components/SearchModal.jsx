import { useState } from 'react';
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

  const {
    results: aiResults,
    loading: aiLoading,
    error: aiError,
    meta: aiMeta,
    searchByFile,
    searchByBase64,
    reset: resetAI,
  } = useAISearch();

  if (!isOpen) return null;

  // ── Tab 1 ────────────────────────────────────────────────────────
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

  // ── Tab 2 ────────────────────────────────────────────────────────
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

  // ── Tab 3 ────────────────────────────────────────────────────────
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

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    if (videoRef.current) videoRef.current.srcObject = null;
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

  const handleClose = () => {
    stopCamera();
    setSelectedFile(null);
    setPreviewUrl(null);
    setTextResults([]);
    setTextNote('Nhập tên sản phẩm và nhấn tìm kiếm.');
    resetAI();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-none shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        style={{ maxWidth: '800px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Tìm kiếm sản phẩm</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Chọn cách tìm kiếm: nhập tên, upload ảnh, hoặc mở camera.
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500" aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-search-tabs px-6 pt-4">
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

          {/* TAB 1: Text */}
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
                  />
                  <button
                    onClick={handleTextSearch}
                    disabled={textLoading || !textQuery.trim()}
                    className="btn btn-dark px-4"
                  >
                    {textLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    Tìm kiếm
                  </button>
                </div>
              </div>

              {textResults.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-3">{textNote}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {textResults.map((p, i) => (
                      <a
                        key={p.id || p.MaSP || i}
                        href={`../TrangChiTiet/TrangChiTiet.html?id=${p.id || p.MaSP}`}
                        className="border rounded overflow-hidden hover:shadow-lg transition-shadow block"
                      >
                        <img
                          src={p.HinhAnh || p.hinhAnh || 'http://localhost:5000/Pic/Pic_SanPham/default.svg'}
                          alt={p.TenSP || p.tenSP}
                          className="w-full h-32 object-cover"
                          onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_SanPham/default.svg'; }}
                        />
                        <div className="p-2">
                          <p className="text-xs font-semibold line-clamp-2">{p.TenSP || p.tenSP}</p>
                          <p className="text-sm font-bold text-[#1E4D36] mt-1">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(p.giaSauGiam || p.GiaBan || p.giaBan || 0)}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">{textNote}</div>
            </div>
          )}

          {/* TAB 2: Upload */}
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
                  <span className="text-gray-400 text-sm">Chưa có ảnh được chọn.</span>
                )}
              </div>

              {selectedFile && (
                <p className="text-xs text-gray-500">Đã chọn: {selectedFile.name}</p>
              )}

              <div className="d-flex gap-3">
                <button
                  onClick={handleImageSearch}
                  disabled={!selectedFile || aiLoading}
                  className="btn btn-dark px-5 flex-1 d-flex align-items-center justify-content-center gap-2"
                >
                  {aiLoading ? <Loader2 size={16} className="animate-spin" /> : null}
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

          {/* TAB 3: Camera */}
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
                      <button onClick={stopCamera} className="btn btn-danger d-flex align-items-center gap-2">
                        <CameraOff size={16} />
                        Tắt camera
                      </button>
                      <button onClick={capturePhoto} className="btn btn-dark flex-1 d-flex align-items-center justify-content-center gap-2">
                        <Camera size={16} />
                        Chụp ảnh & Tìm kiếm
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="camera-preview-wrapper">
                {cameraActive ? (
                  <video ref={videoRef} autoPlay muted playsInline className="w-100" />
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5 text-gray-400">
                    <Camera size={48} className="mb-3 opacity-30" />
                    <p className="text-sm">Nhấn "Bật camera" để mở camera.</p>
                    <p className="text-xs mt-1 opacity-60">Trình duyệt cần cho phép truy cập thiết bị.</p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="d-none" />

              {cameraError && (
                <div className="alert alert-danger py-2 text-sm">{cameraError}</div>
              )}

              <AIResultsGrid results={aiResults} meta={aiMeta} loading={aiLoading} error={aiError} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
