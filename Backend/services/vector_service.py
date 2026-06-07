"""
Vector Index Service — manages FAISS index lifecycle.
Handles auto-rebuilding and ensures index consistency.
"""
import os
import threading
import logging
from ai_service import get_ai_service
from extensions import db

logger = logging.getLogger(__name__)

_rebuild_lock = threading.Lock()
_rebuild_pending = False

def mark_index_dirty():
    """Call this after any product image change (add/update/delete)"""
    global _rebuild_pending
    _rebuild_pending = True
    logger.info("FAISS Index marked as DIRTY. Rebuild pending.")

def rebuild_index_if_needed(app):
    """Call periodically or on-demand to rebuild FAISS if it's dirty"""
    global _rebuild_pending
    if not _rebuild_pending:
        return
        
    with _rebuild_lock:
        if not _rebuild_pending:
            return
            
        logger.info("Starting FAISS Index rebuild...")
        try:
            with app.app_context():
                from generate_embeddings import build_faiss_index
                ai = get_ai_service()
                build_faiss_index(ai)
            _rebuild_pending = False
            logger.info("FAISS Index rebuild COMPLETED.")
        except Exception as e:
            logger.error(f"FAISS Index rebuild FAILED: {e}")

def rebuild_single_product(app, ma_sp: int):
    """Generate embedding for one product and rebuild FAISS index"""
    logger.info(f"Rebuilding embedding for MaSP={ma_sp}")
    try:
        with app.app_context():
            from generate_embeddings import generate_single_embedding, build_faiss_index
            ai = get_ai_service()
            generate_single_embedding(ma_sp, ai)
            build_faiss_index(ai)
        logger.info(f"Rebuild for MaSP={ma_sp} COMPLETED.")
    except Exception as e:
        logger.error(f"Rebuild for MaSP={ma_sp} FAILED: {e}")
