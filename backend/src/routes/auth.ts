import { Router } from 'express';
import { authController } from '@/controllers/authController';
import { validateRequest, loginSchema, registerSchema } from '@/middleware/validation';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;