import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  getDocumentPages,
  getDocumentChunks,
  extractDocument,
  chunkDocument,
  startDocumentEmbedding,
  processFullDocument,
  getEmbeddingStatus,
  getDocumentFile,
  replaceDocumentFile,
  reprocessDocument,
  deleteDocument
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Read routes accessible to all authenticated users (students & admins)
router.get('/', protect, getDocuments);
router.get('/:id/file', protect, getDocumentFile);
router.get('/:id/pages', protect, getDocumentPages);
router.get('/:id/chunks', protect, getDocumentChunks);
router.get('/:id', protect, getDocumentById);

// Admin-only document management routes
router.post('/upload', protect, admin, upload.single('file'), uploadDocument);
router.post('/:id/extract', protect, admin, extractDocument);
router.post('/:id/chunk', protect, admin, chunkDocument);
router.post('/:id/embed', protect, admin, startDocumentEmbedding);
router.post('/:id/process-all', protect, admin, processFullDocument);
router.get('/:id/embedding-status', protect, admin, getEmbeddingStatus);
router.post('/:id/reprocess', protect, admin, reprocessDocument);
router.put('/:id/file', protect, admin, upload.single('file'), replaceDocumentFile);
router.delete('/:id', protect, admin, deleteDocument);

export default router;
