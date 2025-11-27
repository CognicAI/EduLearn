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

    /**
     * Delete enrollments (single or bulk)
     */
    async deleteEnrollments(req: AuthenticatedRequest, res: Response) {
        try {
            const { enrollmentIds } = req.body;

            if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
                return res.status(400).json({ success: false, message: 'No enrollment IDs provided' });
            }

            // Get enrollment details before deletion for logging
            const placeholders = enrollmentIds.map((_, idx) => `$${idx + 1}`).join(',');
            const enrollmentsToDelete = await query(`
                SELECT e.id, e.course_id, c.title as course_title, 
                       u.email as student_email, u.first_name || ' ' || u.last_name as student_name
                FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                JOIN users u ON e.student_id = u.id
                WHERE e.id IN (${placeholders})
            `, enrollmentIds);

            if (enrollmentsToDelete.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'No enrollments found' });
            }

            // Delete lesson progress associated with these enrollments
            await query(`
                DELETE FROM lesson_progress 
                WHERE enrollment_id IN (${placeholders})
            `, enrollmentIds);

            // Delete the enrollments
            const result = await query(`
                DELETE FROM enrollments 
                WHERE id IN (${placeholders})
                RETURNING id
            `, enrollmentIds);

            const deletedCount = result.rows.length;

            // Log the activity
            await activityLogService.logActivity({
                userId: req.user!.userId,
                activityType: 'course_access',
                description: `Admin deleted ${deletedCount} enrollment(s)`,
                metadata: {
                    enrollmentIds,
                    deletedEnrollments: enrollmentsToDelete.rows
                }
            });

            return res.json({
                success: true,
                message: `Successfully deleted ${deletedCount} enrollment(s)`,
                data: { deletedCount }
            });

        } catch (error) {
            console.error('Error deleting enrollments:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete enrollments' });
        }
    }
    /**
     * Enroll students (bulk or single)
     */
    async enrollStudents(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params; // Course ID
            const { emails } = req.body; // Array of emails

            if (!emails || !Array.isArray(emails) || emails.length === 0) {
                return res.status(400).json({ success: false, message: 'No emails provided' });
            }

            // Check if course exists
            const courseCheck = await query('SELECT id, title FROM courses WHERE id = $1 AND is_deleted = false', [id]);
            if (courseCheck.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }
            const courseTitle = courseCheck.rows[0].title;

            const results: any[] = [];
            let successCount = 0;

            for (const email of emails) {
                try {
                    // 1. Check if user exists
                    const userResult = await query('SELECT id, role, first_name, last_name FROM users WHERE email = $1', [email]);

                    if (userResult.rows.length === 0) {
                        results.push({ email, status: 'failed', reason: 'User not found' });
                        continue;
                    }

                    const user = userResult.rows[0];

                    // 2. Check role
                    if (user.role !== 'student') {
                        results.push({ email, status: 'failed', reason: 'User is not a student' });
                        continue;
                    }

                    // 3. Check if already enrolled
                    const enrollmentCheck = await query(
                        'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
                        [id, user.id]
                    );

                    if (enrollmentCheck.rows.length > 0) {
                        results.push({ email, status: 'skipped', reason: 'Already enrolled' });
                        continue;
                    }

                    // 4. Enroll
                    await query(
                        `INSERT INTO enrollments (course_id, student_id, enrollment_date, status, payment_status, progress_percentage)
                         VALUES ($1, $2, NOW(), 'active', 'free', 0)`,
                        [id, user.id]
                    );

                    results.push({
                        email,
                        status: 'success',
                        studentName: `${user.first_name} ${user.last_name}`
                    });
                    successCount++;

                } catch (err: any) {
                    console.error(`Error enrolling ${email}:`, err);
                    results.push({ email, status: 'error', reason: err.message });
                }
            }

            if (successCount > 0) {
                await activityLogService.logActivity({
                    userId: req.user!.userId,
                    activityType: 'course_access',
                    description: `Admin enrolled ${successCount} students to course ${courseTitle}`,
                    metadata: { courseId: id, count: successCount }
                });
            }

            return res.json({
                success: true,
                message: `Processed ${emails.length} emails`,
                data: {
                    results,
                    summary: {
                        total: emails.length,
                        success: successCount,
                        failed: results.filter(r => r.status === 'failed' || r.status === 'error').length,
                        skipped: results.filter(r => r.status === 'skipped').length
                    }
                }
            });

        } catch (error) {
            console.error('Error enrolling students:', error);
            return res.status(500).json({ success: false, message: 'Failed to enroll students' });
        }
    }
}

export const adminEnrollmentController = new AdminEnrollmentController();
