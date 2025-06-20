import { Router } from 'express';
import { adminController } from '@/controllers/adminController';
import { authenticateToken, requireRole } from '@/middleware/auth';

const router = Router();

// Admin-protected route to get all users
router.get(
  '/users',
  authenticateToken,
  requireRole(['admin']),
  adminController.getUsers
);

export default router;
