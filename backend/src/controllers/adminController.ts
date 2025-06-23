import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';

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
}

export const adminController = new AdminController();
