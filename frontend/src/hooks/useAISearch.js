import { useState, useCallback } from 'react';
import { aiSearchAPI } from '../services/api';

export function useAISearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const searchByBase64 = useCallback(async (base64Image) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setMeta(null);

    try {
      const data = await aiSearchAPI.byBase64(base64Image);
      if (data.success && data.data) {
        setResults(data.data.results || []);
        setMeta({
          detections: data.data.detections || [],
          topLabel: data.data.topLabel || '',
          processingTime: data.data.processingTime || null,
          queryImage: data.data.queryImage || '',
          searchId: data.data.searchId || '',
          visualFeatures: data.data.visualFeatures || null,
        });
      } else {
        setResults([]);
        setError('Không tìm thấy sản phẩm tương tự.');
      }
    } catch (err) {
      console.error('[AI Search] Error:', err);
      setError('Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByFile = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setMeta(null);

    try {
      const data = await aiSearchAPI.byFile(file);
      if (data.success && data.data) {
        setResults(data.data.results || []);
        setMeta({
          detections: data.data.detections || [],
          topLabel: data.data.topLabel || '',
          processingTime: data.data.processingTime || null,
          queryImage: data.data.queryImage || '',
          searchId: data.data.searchId || '',
          visualFeatures: data.data.visualFeatures || null,
        });
      } else {
        setResults([]);
        setError('Không tìm thấy sản phẩm tương tự.');
      }
    } catch (err) {
      console.error('[AI Search] Error:', err);
      setError('Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setLoading(false);
    setError(null);
    setMeta(null);
  }, []);

  return {
    results,
    loading,
    error,
    meta,
    searchByBase64,
    searchByFile,
    reset,
  };
}
