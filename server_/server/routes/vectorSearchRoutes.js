import express from 'express';
import {
  testQuerySearch,
  testRawVector,
  getVectorSearchHealth
} from '../controllers/vectorSearchController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Enforce authentication & admin role authorization on all vector search endpoints
router.use(protect, admin);

router.post('/test-query', testQuerySearch);
router.post('/test', testRawVector);
router.get('/health', getVectorSearchHealth);

export default router;
