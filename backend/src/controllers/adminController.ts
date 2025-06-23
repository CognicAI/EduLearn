import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';
import bcrypt from 'bcrypt';
import { activityLogService } from '../services/activityLogService';

export class AdminController {
  async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await query(`
        SELECT id, email, first_name, last_name, role, profile_image, last_login, is_active, created_at
        FROM users
        ORDER BY created_at DESC
      `);

      const users = result.rows.map((u: any) => ({
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
        status: u.is_active ? 'active' : 'inactive',
        avatar: u.profile_image,
        createdAt: u.created_at?.toISOString?.(),
        lastLogin: u.last_login?.toISOString?.(),
        coursesEnrolled: 0,
        coursesCompleted: 0,
        coursesCreated: 0,
        studentsTotal: 0,
        systemAccess: 'Full'
      }));

      return res.json({ success: true, data: users });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, firstName, lastName, role, status } = req.body;
      const isActive = status === 'active';
      // Default password for new users (should prompt reset)
      const defaultPassword = 'Password@123'; // Use a secure default password
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      const insert = await query(
        `INSERT INTO users (email, first_name, last_name, role, is_active, password_hash)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id, email, first_name AS "firstName", last_name AS "lastName", role, is_active AS status, profile_image AS avatar, created_at, last_login`,
        [email, firstName, lastName, role, isActive, passwordHash]
      );
      const user = insert.rows[0];
      // Log user creation activity
      await activityLogService.logActivity({
        userId: req.user!.userId,
        activityType: 'profile_update',
        description: `Admin created user ${user.email}`,
        metadata: { createdUserId: user.id }
      });
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ success: false, message: 'Failed to create user' });
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.params.id;
      const { email, firstName, lastName, role, status } = req.body;
      const isActive = status === 'active';
      await query(
        `UPDATE users SET email=$2, first_name=$3, last_name=$4, role=$5, is_active=$6, updated_at=NOW() WHERE id=$1`,
        [userId, email, firstName, lastName, role, isActive]
      );
      res.json({ success: true, message: 'User updated' });
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.params.id;
      await query(`DELETE FROM users WHERE id=$1`, [userId]);
      res.json({ success: true, message: 'User deleted' });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  }
}

export const adminController = new AdminController();
