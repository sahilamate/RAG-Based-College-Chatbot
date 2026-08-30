import express from 'express';
import {
  sendMessage,
  getChatHistory,
  getConversationDetails,
  deleteConversation,
  submitFeedback
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protect middleware to all chat routes
router.use(protect);

router.post('/', sendMessage);
router.get('/history', getChatHistory);
router.get('/:conversationId', getConversationDetails);
router.delete('/:conversationId', deleteConversation);
router.post('/:conversationId/feedback', submitFeedback);

export default router;
