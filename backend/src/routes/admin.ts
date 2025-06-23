import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Admin-protected route to get all users
router.get(
  '/users',
  authenticateToken,
  requireRole(['admin']),
  adminController.getUsers
);

// Admin-protected route to create a new user
router.post(
  '/users',
  authenticateToken,
  requireRole(['admin']),
  adminController.createUser
);

// Admin-protected route to update an existing user
router.put(
  '/users/:id',
  authenticateToken,
  requireRole(['admin']),
  adminController.updateUser
);

// Admin-protected route to delete a user
router.delete(
  '/users/:id',
  authenticateToken,
  requireRole(['admin']),
  adminController.deleteUser
);

export default router;
