import { Router } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';
import settingsRoutes from './settings';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user', settingsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EduLearn API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;