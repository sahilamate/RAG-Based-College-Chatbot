import express from 'express';
import { retrieveContextHandler } from '../controllers/ragController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce JWT authentication on RAG retrieval endpoints (accessible to Students & Admins)
router.use(protect);

router.post('/retrieve', retrieveContextHandler);

export default router;
