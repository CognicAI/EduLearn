import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

// API routes
router.use('/auth', authRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EduLearn API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;