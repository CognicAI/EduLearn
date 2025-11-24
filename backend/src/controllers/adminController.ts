import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';
import bcrypt from 'bcrypt';
import { activityLogService } from '../services/activityLogService';

export class AdminController {
  /** Get all users with filtering */
  async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { role, status, search, page = 1, limit = 50 } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      let whereConditions = ['u.is_deleted = false'];
      const params: any[] = [];
      let paramIndex = 1;

      if (role) {
        whereConditions.push(`u.role = $${paramIndex}`);
        params.push(role);
        paramIndex++;
      }
      if (status) {
        whereConditions.push(`u.is_active = $${paramIndex}`);
        params.push(status === 'active');
        paramIndex++;
      }
      if (search) {
        whereConditions.push(`(u.email ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.join(' AND ');

      const countResult = await query(`SELECT COUNT(*) FROM users u WHERE ${whereClause}`, params);
      const totalCount = parseInt(countResult.rows[0].count);

      const result = await query(
        `SELECT u.id as user_id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.email_verified, u.created_at as user_created_at, u.updated_at as user_updated_at, u.last_login, u.login_count,
        u.phone, u.date_of_birth, u.address, u.timezone, u.language, u.profile_image, up.bio, up.website, up.linkedin, up.github, up.skills, up.interests, up.academic_background, up.experience_level,
        COUNT(DISTINCT e.id) FILTER (WHERE e.student_id = u.id) as courses_enrolled,
        COUNT(DISTINCT e.id) FILTER (WHERE e.student_id = u.id AND e.status = 'completed') as courses_completed,
        COUNT(DISTINCT c.id) FILTER (WHERE c.instructor_id = u.id) as courses_created,
        COUNT(DISTINCT e2.student_id) FILTER (WHERE c.instructor_id = u.id) as students_total
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN courses c ON u.id = c.instructor_id AND c.is_deleted = false
      LEFT JOIN enrollments e2 ON c.id = e2.course_id
      WHERE ${whereClause}
      GROUP BY u.id, up.id
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limitNum, offset]
      );

      const users = result.rows.map((u: any) => ({
        id: u.user_id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
        phone: u.phone,
        dateOfBirth: u.date_of_birth,
        address: u.address,
        timezone: u.timezone,
        language: u.language,
        status: u.is_active ? 'active' : 'inactive',
        emailVerified: u.email_verified,
        avatar: u.profile_image,
        createdAt: u.user_created_at,
        updatedAt: u.user_updated_at,
        lastLogin: u.last_login,
        loginCount: u.login_count,
        bio: u.bio,
        website: u.website,
        linkedin: u.linkedin,
        github: u.github,
        skills: u.skills,
        interests: u.interests,
        academicBackground: u.academic_background,
        experienceLevel: u.experience_level,
        coursesEnrolled: parseInt(u.courses_enrolled || 0),
        coursesCompleted: parseInt(u.courses_completed || 0),
        coursesCreated: parseInt(u.courses_created || 0),
        studentsTotal: parseInt(u.students_total || 0)
      }));

      await activityLogService.logActivity({
        userId: req.user!.userId,
        activityType: 'profile_update',
        description: 'Admin viewed users list',
        metadata: { filters: { role, status, search }, pagination: { page: pageNum, limit: limitNum } }
      });

      return res.json({
        success: true,
        data: users,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /** Get single user details */
  async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await query(`
        SELECT u.*, up.*, us.*
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN user_settings us ON u.id = us.user_id
        WHERE u.id = $1 AND u.is_deleted = false
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const user = result.rows[0];

      const activityLogs = await query(`SELECT * FROM user_activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [id]);
      const enrollments = await query(`
        SELECT e.*, c.title as course_title, c.thumbnail as course_thumbnail
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = $1
        ORDER BY e.enrollment_date DESC
      `, [id]);

      await activityLogService.logActivity({
        userId: req.user!.userId,
        activityType: 'profile_update',
        description: `Admin viewed user details for ${user.email}`,
        metadata: { viewedUserId: id }
      });

      return res.json({
        success: true,
        data: { ...user, activityLogs: activityLogs.rows, enrollments: enrollments.rows }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
  }

  /** Create a new user */
  async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, firstName, lastName, role, status } = req.body;
      const isActive = status === 'active';
      const defaultPassword = 'Password@123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      const insert = await query(
        `INSERT INTO users (email, first_name, last_name, role, is_active, password_hash)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id, email, first_name AS "firstName", last_name AS "lastName", role, is_active AS status, profile_image AS avatar, created_at, last_login`,
        [email, firstName, lastName, role, isActive, passwordHash]
      );
      const user = insert.rows[0];
      await activityLogService.logActivity({
        userId: req.user!.userId,
        activityType: 'profile_update',
        description: `Admin created user ${user.email}`,
        metadata: { createdUserId: user.id }
      });
      return res.status(201).json({ success: true, data: user });
    } catch (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ success: false, message: 'Failed to create user' });
    }
  }

  /** Provide metadata for new user form */
  async getNewUserForm(req: AuthenticatedRequest, res: Response) {
    try {
      return res.json({
        success: true,
        data: {
          fields: [
            { name: 'email', type: 'string', required: true },
            { name: 'firstName', type: 'string', required: true },
            { name: 'lastName', type: 'string', required: true },
            { name: 'role', type: 'string', required: true },
            { name: 'status', type: 'string', required: true }
          ]
        }
      });
    } catch (err) {
      console.error('Error fetching new user form data:', err);
      return res.status(500).json({ success: false, message: 'Failed to get new user form data' });
    }
  }

  /** Update an existing user */
  async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.params.id;
      const { email, firstName, lastName, role, status } = req.body;
      const isActive = status === 'active';
      await query(
        `UPDATE users SET email=$2, first_name=$3, last_name=$4, role=$5, is_active=$6, updated_at=NOW() WHERE id=$1`,
        [userId, email, firstName, lastName, role, isActive]
      );
      return res.json({ success: true, message: 'User updated' });
    } catch (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  }

  /** Soft delete a user */
  async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.params.id;
      await query(`UPDATE users SET is_deleted = true, deleted_at = NOW() WHERE id = $1`, [userId]);
      await activityLogService.logActivity({
        userId: req.user!.userId,
        activityType: 'profile_update',
        description: `Admin deleted user ${userId}`,
        metadata: { deletedUserId: userId }
      });
      return res.json({ success: true, message: 'User deleted' });
    } catch (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  }

  /** Bulk delete users */
  async bulkDeleteUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { userIds } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid user IDs' });
      }
      const result = await query(
        `UPDATE users SET is_deleted = true, deleted_at = NOW() WHERE id = ANY($1::uuid[]) RETURNING id`,
        [userIds]
      );
      await activityLogService.logActivity({
        userId: req.user!.userId,
        activityType: 'profile_update',
        description: `Admin bulk deleted ${result.rows.length} users`,
        metadata: { deletedUserIds: userIds }
      });
      return res.json({ success: true, message: `${result.rows.length} users deleted`, deletedCount: result.rows.length });
    } catch (err) {
      console.error('Error bulk deleting users:', err);
      return res.status(500).json({ success: false, message: 'Failed to bulk delete users' });
    }
  }

  /** Bulk update user status */
  async bulkUpdateUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { userIds, isActive } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid user IDs' });
      }
      const result = await query(
        `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = ANY($2::uuid[]) RETURNING id`,
        [isActive, userIds]
      );
      await activityLogService.logActivity({
        userId: req.user!.userId,
        activityType: 'profile_update',
        description: `Admin bulk updated status for ${result.rows.length} users to ${isActive ? 'active' : 'inactive'}`,
        metadata: { updatedUserIds: userIds, isActive }
      });
      return res.json({ success: true, message: `${result.rows.length} users updated`, updatedCount: result.rows.length });
    } catch (err) {
      console.error('Error bulk updating users:', err);
      return res.status(500).json({ success: false, message: 'Failed to bulk update users' });
    }
  }

  /** Export users to CSV */
  async exportUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { role, status, search } = req.query;
      let whereConditions = ['is_deleted = false'];
      const params: any[] = [];
      let paramIndex = 1;
      if (role) {
        whereConditions.push(`role = $${paramIndex}`);
        params.push(role);
        paramIndex++;
      }
      if (status) {
        whereConditions.push(`is_active = $${paramIndex}`);
        params.push(status === 'active');
        paramIndex++;
      }
      if (search) {
        whereConditions.push(`(email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }
      const whereClause = whereConditions.join(' AND ');
      const result = await query(
        `SELECT id, email, first_name, last_name, role, phone, is_active, email_verified, created_at, last_login, login_count FROM users WHERE ${whereClause} ORDER BY created_at DESC`,
        params
      );
      await activityLogService.logActivity({
        userId: req.user!.userId,
        activityType: 'profile_update',
        description: `Admin exported ${result.rows.length} users`,
        metadata: { filters: { role, status, search } }
      });
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error('Error exporting users:', err);
      return res.status(500).json({ success: false, message: 'Failed to export users' });
    }
  }
  /** Bulk import users */
  async bulkImportUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { users } = req.body;
      if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid users data' });
      }

      const defaultPassword = 'Password@123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      let imported = 0;
      let failed = 0;
      const errors: any[] = [];

      for (const user of users) {
        try {
          const { email, firstName, lastName, role } = user;
          if (!email || !firstName || !lastName || !role) {
            failed++;
            errors.push({ email, error: 'Missing required fields' });
            continue;
          }

          // Check if user exists
          const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
          if (existing.rows.length > 0) {
            failed++;
            errors.push({ email, error: 'User already exists' });
            continue;
          }

          await query(
            `INSERT INTO users (email, first_name, last_name, role, is_active, password_hash, email_verified)
             VALUES ($1, $2, $3, $4, true, $5, true)`,
            [email, firstName, lastName, role, passwordHash]
          );
          imported++;
        } catch (err: any) {
          failed++;
          errors.push({ email: user.email, error: err.message });
        }
      }

      await activityLogService.logActivity({
        userId: req.user!.userId,
        activityType: 'profile_update',
        description: `Admin bulk imported ${imported} users`,
        metadata: { imported, failed, errors }
      });

      return res.json({
        success: true,
        data: { imported, failed, errors },
        message: `Imported ${imported} users, ${failed} failed`
      });
    } catch (err) {
      console.error('Error bulk importing users:', err);
      return res.status(500).json({ success: false, message: 'Failed to bulk import users' });
    }
  }
}

export const adminController = new AdminController();
