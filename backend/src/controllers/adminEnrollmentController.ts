import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';
import { activityLogService } from '../services/activityLogService';

export class AdminEnrollmentController {
    /**
     * Get all enrollments with filtering
     */
    async getEnrollments(req: AuthenticatedRequest, res: Response) {
        try {
            const { course, student, status, page = 1, limit = 50 } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            let whereConditions = ['1=1'];
            const params: any[] = [];
            let paramIndex = 1;

            if (course) {
                whereConditions.push(`e.course_id = $${paramIndex}`);
                params.push(course);
                paramIndex++;
            }

            if (student) {
                whereConditions.push(`e.student_id = $${paramIndex}`);
                params.push(student);
                paramIndex++;
            }

            if (status) {
                whereConditions.push(`e.status = $${paramIndex}`);
                params.push(status);
                paramIndex++;
            }

            const whereClause = whereConditions.join(' AND ');

            // Get total count
            const countResult = await query(
                `SELECT COUNT(*) FROM enrollments e WHERE ${whereClause}`,
                params
            );
            const totalCount = parseInt(countResult.rows[0].count);

            // Get enrollments with details
            const result = await query(`
        SELECT 
          e.*,
          c.title as course_title,
          c.thumbnail as course_thumbnail,
          u.first_name || ' ' || u.last_name as student_name,
          u.email as student_email
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON e.student_id = u.id
        WHERE ${whereClause}
        ORDER BY e.enrollment_date DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset]);

            return res.json({
                success: true,
                data: result.rows,
                pagination: {
                    total: totalCount,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(totalCount / Number(limit))
                }
            });
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch enrollments' });
        }
    }

    /**
     * Get single enrollment details
     */
    async getEnrollmentById(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;

            const enrollmentResult = await query(`
        SELECT 
          e.*,
          c.id as course_id, c.title as course_title, c.description as course_description,
          u.id as student_id, u.first_name || ' ' || u.last_name as student_name, u.email as student_email
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON e.student_id = u.id
        WHERE e.id = $1
      `, [id]);

            if (enrollmentResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Enrollment not found' });
            }

            // Get lesson progress
            const progressResult = await query(`
        SELECT 
          lp.*,
          cl.title as lesson_title,
          cm.title as module_title
        FROM lesson_progress lp
        JOIN course_lessons cl ON lp.lesson_id = cl.id
        JOIN course_modules cm ON cl.module_id = cm.id
        WHERE lp.enrollment_id = $1
        ORDER BY cm.sort_order, cl.sort_order
      `, [id]);

            return res.json({
                success: true,
                data: {
                    ...enrollmentResult.rows[0],
                    progress: progressResult.rows
                }
            });
        } catch (error) {
            console.error('Error fetching enrollment:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch enrollment' });
        }
    }

    /**
     * Update enrollment status and details
     */
    async updateEnrollment(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { status, progressPercentage, paymentStatus, certificateIssued } = req.body;

            const result = await query(`
        UPDATE enrollments SET
          status = COALESCE($1, status),
          progress_percentage = COALESCE($2, progress_percentage),
          payment_status = COALESCE($3, payment_status),
          certificate_issued = COALESCE($4, certificate_issued),
          updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `, [status, progressPercentage, paymentStatus, certificateIssued, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Enrollment not found' });
            }

            await activityLogService.logActivity({
                userId: req.user!.userId,
                activityType: 'profile_update',
                description: `Admin updated enrollment ${id}`,
                metadata: { enrollmentId: id, changes: req.body }
            });

            return res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error updating enrollment:', error);
            return res.status(500).json({ success: false, message: 'Failed to update enrollment' });
        }
    }

    /**
     * Issue certificate for enrollment
     */
    async issueCertificate(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;

            const result = await query(`
        UPDATE enrollments SET
          certificate_issued = true,
          completion_date = COALESCE(completion_date, NOW()),
          status = 'completed',
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Enrollment not found' });
            }

            await activityLogService.logActivity({
                userId: req.user!.userId,
                activityType: 'profile_update',
                description: `Admin issued certificate for enrollment ${id}`,
                metadata: { enrollmentId: id }
            });

            return res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error issuing certificate:', error);
            return res.status(500).json({ success: false, message: 'Failed to issue certificate' });
        }
    }

    /**
     * Export enrollments
     */
    async exportEnrollments(req: AuthenticatedRequest, res: Response) {
        try {
            const { course, status } = req.query;

            let whereConditions = ['1=1'];
            const params: any[] = [];
            let paramIndex = 1;

            if (course) {
                whereConditions.push(`e.course_id = $${paramIndex}`);
                params.push(course);
                paramIndex++;
            }

            if (status) {
                whereConditions.push(`e.status = $${paramIndex}`);
                params.push(status);
                paramIndex++;
            }

            const whereClause = whereConditions.join(' AND ');

            const result = await query(`
        SELECT 
          e.id, e.enrollment_date, e.completion_date, e.progress_percentage,
          e.status, e.payment_status, e.certificate_issued,
          c.title as course_title,
          u.email as student_email, u.first_name as student_first_name, u.last_name as student_last_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON e.student_id = u.id
        WHERE ${whereClause}
        ORDER BY e.enrollment_date DESC
      `, params);

            await activityLogService.logActivity({
                userId: req.user!.userId,
                activityType: 'profile_update',
                description: `Admin exported ${result.rows.length} enrollments`,
                metadata: { filters: { course, status } }
            });

            return res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error exporting enrollments:', error);
            return res.status(500).json({ success: false, message: 'Failed to export enrollments' });
        }
    }
}

export const adminEnrollmentController = new AdminEnrollmentController();
