import { Router } from 'express';
import { chatbotController } from '../controllers/chatbotController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Chatbot query endpoint - requires authentication
router.post('/query', authenticateToken, chatbotController.handleQuery.bind(chatbotController));

// Health check for chatbot service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EduLearn Chatbot API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
