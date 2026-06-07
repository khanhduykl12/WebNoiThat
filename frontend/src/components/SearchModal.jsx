import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Loader2, Camera, CameraOff } from 'lucide-react';
import { useAISearch } from '../hooks/useAISearch';
import AIResultsGrid from './AIResultsGrid';
import { productAPI } from '../services/api';

export default function SearchModal({ isOpen, onClose, initialTab = 'text' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Tab 1: Text search
  const [textQuery, setTextQuery] = useState('');
  const [textResults, setTextResults] = useState([]);
  const [textLoading, setTextLoading] = useState(false);

  // Tab 2: Upload image
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Tab 3: Camera
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const { results: aiResults, loading: aiLoading, error: aiError, meta: aiMeta, searchByFile, searchByBase64, reset: resetAI } = useAISearch();

  if (!isOpen) return null;

  // ── Tab 1: Text search ────────────────────────────────────────────────
  const handleTextSearch = async () => {
    if (!textQuery.trim()) return;
    setTextLoading(true);
    setTextResults([]);
    try {
      const data = await productAPI.search(textQuery.trim());
      if (data.success && data.data) {
        setTextResults(data.data);
      }
    } catch (err) {
      console.error('[Text Search] Error:', err);
    } finally {
      setTextLoading(false);
    }
  };

  // ── Tab 2: File upload ────────────────────────────────────────────────
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

  // ── Tab 3: Camera ────────────────────────────────────────────────────
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setCapturedImage(null);
      resetAI();
    } catch (err) {
      console.error('[Camera] Error:', err);
      setCameraError('Không thể mở camera. Vui lòng kiểm tra quyền truy cập thiết bị.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
    setCapturedImage(dataUrl);
    stopCamera();
    // Gửi lên AI ngay sau khi chụp
    searchByBase64(dataUrl);
  };

  // ── Cleanup on close ─────────────────────────────────────────────────
  const handleClose = () => {
    stopCamera();
    setSelectedFile(null);
    setPreviewUrl(null);
    setCapturedImage(null);
    setTextResults([]);
    resetAI();
    onClose();
  };

  const TABS = [
    { id: 'text', label: 'Nhập từ khóa', icon: null },
    { id: 'upload', label: 'Upload ảnh', icon: null },
    { id: 'camera', label: 'Mở camera', icon: null },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-light text-white rounded-t-2xl">
          <div>
            <h3 className="font-bold text-lg">Tìm kiếm sản phẩm</h3>
            <p className="text-xs text-green-100 opacity-80 mt-0.5">
              Chọn cách tìm kiếm: nhập tên, upload ảnh, hoặc mở camera.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-search-tabs px-6 pt-4">
          {TABS.map((tab) => (
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
          {/* TAB 1: Text search */}
          {activeTab === 'text' && (
            <div className="search-panel-row">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tìm sản phẩm theo tên
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
                    placeholder="Nhập tên sản phẩm..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    onClick={handleTextSearch}
                    disabled={textLoading}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {textLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    Tìm kiếm
                  </button>
                </div>
              </div>

              {/* Text search results */}
              {textResults.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-3">
                    Tìm thấy <strong>{textResults.length}</strong> kết quả cho "<em>{textQuery}</em>"
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {textResults.map((p, i) => {
                      const price = p.giaSauGiam || p.giaBan || p.GiaBan || 0;
                      const oldPrice = p.giaGoc || p.giaBan || p.GiaBan || 0;
                      const disc = p.khuyenMai || p.KhuyenMai || 0;
                      return (
                        <a
                          key={p.id || p.MaSP || i}
                          href={`../TrangChiTiet/TrangChiTiet.html?id=${p.id || p.MaSP}`}
                          className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow block"
                        >
                          <img
                            src={p.hinhAnh || p.HinhAnh || 'http://localhost:5000/Pic/Pic_SanPham/default.svg'}
                            alt={p.tenSP || p.TenSP}
                            className="w-full h-32 object-cover"
                            onError={(e) => { e.target.src = 'http://localhost:5000/Pic/Pic_SanPham/default.svg'; }}
                          />
                          <div className="p-2">
                            <p className="text-xs font-semibold line-clamp-2">{p.tenSP || p.TenSP}</p>
                            <p className="text-sm font-bold text-primary mt-1">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price)}
                            </p>
                            {oldPrice > price && (
                              <p className="text-xs text-gray-400 line-through">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(oldPrice)}</p>
                            )}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {textQuery && !textLoading && textResults.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">Nhấn Enter hoặc bấm "Tìm kiếm" để xem kết quả.</p>
              )}
            </div>
          )}

          {/* TAB 2: Upload image */}
          {activeTab === 'upload' && (
            <div className="search-panel-row">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Upload ảnh sản phẩm
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                />
              </div>

              {/* Preview */}
              <div className="image-preview-wrapper">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="image-preview" />
                ) : (
                  <div className="text-gray-400 text-sm">Chưa có ảnh được chọn.</div>
                )}
              </div>

              {selectedFile && (
                <p className="text-xs text-gray-500">Đã chọn: {selectedFile.name}</p>
              )}

              {/* Search button */}
              <div className="flex gap-3">
                <button
                  onClick={handleImageSearch}
                  disabled={!selectedFile || aiLoading}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang xử lý AI...
                    </>
                  ) : (
                    <>
                      <ImageIcon size={16} />
                      Tìm sản phẩm bằng ảnh
                    </>
                  )}
                </button>
                {selectedFile && (
                  <button
                    onClick={handleClearImage}
                    className="px-4 py-3 border border-gray-300 rounded-xl text-gray-500 hover:bg-gray-50 text-sm transition-colors"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {/* AI Results */}
              <AIResultsGrid
                results={aiResults}
                meta={aiMeta}
                loading={aiLoading}
                error={aiError}
              />
            </div>
          )}

          {/* TAB 3: Camera */}
          {activeTab === 'camera' && (
            <div className="search-panel-row">
              <div className="flex gap-3">
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <Camera size={16} />
                    Bật camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <CameraOff size={16} />
                    Tắt camera
                  </button>
                )}
                {cameraActive && (
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera size={16} />
                    Chụp ảnh & Tìm kiếm
                  </button>
                )}
              </div>

              {/* Camera preview */}
              <div className="camera-preview-wrapper">
                {capturedImage ? (
                  <img src={capturedImage} alt="Captured" className="w-full max-h-[300px] object-contain" />
                ) : cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full max-h-[300px] object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Camera size={48} className="mb-3 opacity-30" />
                    <p className="text-sm">Nhấn "Bật camera" để mở camera.</p>
                    <p className="text-xs mt-1 opacity-60">Trình duyệt cần cho phép truy cập thiết bị.</p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {cameraError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{cameraError}</p>
                </div>
              )}

              {!cameraActive && !capturedImage && (
                <p className="text-xs text-gray-400">
                  Bật camera, cân chỉnh sản phẩm vào giữa khung hình và nhấn "Chụp ảnh & Tìm kiếm".
                </p>
              )}

              {/* AI Results */}
              <AIResultsGrid
                results={aiResults}
                meta={aiMeta}
                loading={aiLoading}
                error={aiError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
