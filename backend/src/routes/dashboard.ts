import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { dashboardController } from '../controllers/dashboardController';
import { adminAnalyticsController } from '../controllers/adminAnalyticsController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Student Dashboard
router.get('/student', requireRole(['student']), dashboardController.getStudentDashboard);

// Teacher Dashboard
router.get('/teacher', requireRole(['teacher', 'admin']), dashboardController.getTeacherDashboard);

// Admin Dashboard (using existing analytics controller)
router.get('/admin', requireRole(['admin']), adminAnalyticsController.getPlatformStats);

export default router;
