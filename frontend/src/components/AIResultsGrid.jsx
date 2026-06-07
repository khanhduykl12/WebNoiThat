import { useState } from 'react';
import { X, Star, Zap } from 'lucide-react';
import ProductCard from './ProductCard';

export default function AIResultsGrid({ results, meta, loading, error }) {
  const hasResults = results && results.length > 0;
  const hasDetections = meta?.detections && meta.detections.length > 0;
  const pt = meta?.processingTime;

  if (!loading && !error && !hasResults) return null;

  return (
    <div className="mt-6 border-t pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="ai-badge flex items-center gap-1">
            <Zap size={12} />
            AI
          </span>
          {hasResults && (
            <span className="text-sm text-gray-600">
              Tìm thấy <strong>{results.length}</strong> sản phẩm tương tự
            </span>
          )}
        </div>
        {pt && (
          <span className="text-xs text-gray-400">
            YOLO {pt.yolo_ms || 0}ms | ViT {pt.vit_ms || 0}ms | Tổng {pt.total_ms || 0}ms
          </span>
        )}
      </div>

      {/* Detections */}
      {hasDetections && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs font-semibold text-primary mb-2">Phát hiện đồ nội thất:</p>
          <div className="flex flex-wrap gap-2">
            {meta.detections.map((d, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-primary text-white text-xs px-3 py-1 rounded-full"
              >
                {d.label}
                <span className="opacity-75">({(d.confidence * 100).toFixed(0)}%)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">
            <svg width="48" height="48" fill="none" stroke="#dc3545" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
          </div>
          <p className="text-red-500 font-semibold">{error}</p>
          <p className="text-gray-400 text-sm mt-1">Vui lòng kiểm tra server đang chạy và thử lại.</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-3"></div>
          <p className="text-primary font-semibold">Đang xử lý AI...</p>
          <p className="text-gray-400 text-sm mt-1">YOLO đang phát hiện đồ nội thất và ViT đang trích xuất đặc trưng.</p>
        </div>
      )}

      {/* Results grid */}
      {hasResults && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((product, idx) => (
            <ProductCard key={product.id || product.MaSP || idx} product={product} />
          ))}
        </div>
      )}

      {/* Empty results */}
      {!hasResults && !loading && !error && (
        <div className="text-center py-8 text-gray-400">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z"/>
          </svg>
          <p>Không tìm thấy sản phẩm tương tự.</p>
        </div>
      )}
    </div>
  );
}
