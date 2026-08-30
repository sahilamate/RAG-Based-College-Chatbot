import express from 'express';
import { getDashboardStats, getAnalyticsData } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Protect all admin routes with authentication and admin role verification
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalyticsData);

export default router;
