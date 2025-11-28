import { Router } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';
import courseRoutes from './courses';
import settingsRoutes from './settings';
import chatbotRoutes from './chatbot';
import dashboardRoutes from './dashboard';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/courses', courseRoutes);
router.use('/user', settingsRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EduLearn API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
