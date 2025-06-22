import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { settingsController } from '@/controllers/settingsController';

const router = Router();

// User profile
router.get('/profile', authenticateToken, settingsController.getProfile);
router.put('/profile', authenticateToken, settingsController.updateProfile);

// User settings
router.get('/settings', authenticateToken, settingsController.getSettings);
router.put('/settings', authenticateToken, settingsController.updateSettings);

// User sessions and activity logs
router.get('/sessions', authenticateToken, settingsController.getSessions);
router.get('/activity', authenticateToken, settingsController.getActivity);
// Update user password
router.put('/password', authenticateToken, settingsController.updatePassword);

export default router;
