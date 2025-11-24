import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';
import { activityLogService } from '../services/activityLogService';

export class AdminCourseController {
    /**
     * Get all courses with comprehensive details and filtering
     */
    async getCourses(req: AuthenticatedRequest, res: Response) {
        try {
            const { status, category, instructor, search, page = 1, limit = 50 } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            let whereConditions = ['c.is_deleted = false'];
            const params: any[] = [];
            let paramIndex = 1;

            if (status) {
                whereConditions.push(`c.status = $${paramIndex}`);
                params.push(status);
                paramIndex++;
            }

            if (category) {
                whereConditions.push(`c.category_id = $${paramIndex}`);
                params.push(category);
                paramIndex++;
            }

            if (instructor) {
                whereConditions.push(`c.instructor_id = $${paramIndex}`);
                params.push(instructor);
                paramIndex++;
            }

            if (search) {
                whereConditions.push(`(c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`);
                params.push(`%${search}%`);
                paramIndex++;
            }

            const whereClause = whereConditions.join(' AND ');

            // Get total count
            const countResult = await query(
                `SELECT COUNT(*) FROM courses c WHERE ${whereClause}`,
                params
            );
            const totalCount = parseInt(countResult.rows[0].count);

            // Get courses with all details
            const result = await query(`
        SELECT 
          c.*,
          u.first_name || ' ' || u.last_name as instructor_name,
          u.email as instructor_email,
          cat.name as category_name,
          COUNT(DISTINCT cm.id) as module_count,
          COUNT(DISTINCT cl.id) as lesson_count
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN course_modules cm ON c.id = cm.course_id AND cm.is_deleted = false
        LEFT JOIN course_lessons cl ON cm.id = cl.module_id AND cl.is_deleted = false
        WHERE ${whereClause}
        GROUP BY c.id, u.first_name, u.last_name, u.email, cat.name
        ORDER BY c.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset]);

            await activityLogService.logActivity({
                userId: req.user!.userId,
                activityType: 'course_access',
                description: 'Admin viewed courses list',
                metadata: { filters: { status, category, instructor, search } }
            });

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
            console.error('Error fetching courses:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch courses' });
        }
    }

    /**
     * Get single course with complete details
     */
    async getCourseById(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;

            const courseResult = await query(`
        SELECT 
          c.*,
          u.first_name || ' ' || u.last_name as instructor_name,
          u.email as instructor_email,
          cat.name as category_name
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN categories cat ON c.category_id = cat.id
        WHERE c.id = $1 AND c.is_deleted = false
      `, [id]);

            if (courseResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }

            // Get modules and lessons
            const modulesResult = await query(`
        SELECT 
          cm.*,
          json_agg(
            json_build_object(
              'id', cl.id,
              'title', cl.title,
              'content', cl.content,
              'videoUrl', cl.video_url,
              'videoDuration', cl.video_duration,
              'sortOrder', cl.sort_order,
              'isFree', cl.is_free,
              'viewCount', cl.view_count
            ) ORDER BY cl.sort_order
          ) FILTER (WHERE cl.id IS NOT NULL) as lessons
        FROM course_modules cm
        LEFT JOIN course_lessons cl ON cm.id = cl.module_id AND cl.is_deleted = false
        WHERE cm.course_id = $1 AND cm.is_deleted = false
        GROUP BY cm.id
        ORDER BY cm.sort_order
      `, [id]);

            // Get enrollment statistics
            const enrollmentStats = await query(`
        SELECT 
          status,
          COUNT(*) as count,
          AVG(progress_percentage) as avg_progress
        FROM enrollments
        WHERE course_id = $1
        GROUP BY status
      `, [id]);

            // Get reviews
            const reviews = await query(`
        SELECT 
          cr.*,
          u.first_name || ' ' || u.last_name as student_name
        FROM course_reviews cr
        LEFT JOIN users u ON cr.student_id = u.id
        WHERE cr.course_id = $1 AND cr.is_deleted = false
        ORDER BY cr.created_at DESC
        LIMIT 10
      `, [id]);

            return res.json({
                success: true,
                data: {
                    ...courseResult.rows[0],
                    modules: modulesResult.rows,
                    enrollmentStats: enrollmentStats.rows,
                    reviews: reviews.rows
                }
            });
        } catch (error) {
            console.error('Error fetching course:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch course' });
        }
    }

    /**
     * Create a new course
     */
    async createCourse(req: AuthenticatedRequest, res: Response) {
        try {
            const courseData = req.body;

            const result = await query(`
        INSERT INTO courses (
          title, slug, description, short_description, instructor_id, category_id,
          thumbnail, cover_image, level, price, discount_price, duration_weeks,
          duration_hours, max_students, prerequisites, learning_outcomes, status, featured
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `, [
                courseData.title,
                courseData.slug,
                courseData.description,
                courseData.shortDescription,
                courseData.instructorId,
                courseData.categoryId,
                courseData.thumbnail,
                courseData.coverImage,
                courseData.level,
                courseData.price,
                courseData.discountPrice,
                courseData.durationWeeks,
                courseData.durationHours,
                courseData.maxStudents,
                JSON.stringify(courseData.prerequisites || []),
                JSON.stringify(courseData.learningOutcomes || []),
                courseData.status || 'draft',
                courseData.featured || false
            ]);

            await activityLogService.logActivity({
                userId: req.user!.userId,
                activityType: 'course_access',
                description: `Admin created course: ${courseData.title}`,
                metadata: { courseId: result.rows[0].id }
            });

            return res.status(201).json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error creating course:', error);
            return res.status(500).json({ success: false, message: 'Failed to create course' });
        }
    }

    /**
     * Update a course
     */
    async updateCourse(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const courseData = req.body;

            const result = await query(`
        UPDATE courses SET
          title = COALESCE($1, title),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          short_description = COALESCE($4, short_description),
          category_id = COALESCE($5, category_id),
          thumbnail = COALESCE($6, thumbnail),
          cover_image = COALESCE($7, cover_image),
          level = COALESCE($8, level),
          price = COALESCE($9, price),
          discount_price = COALESCE($10, discount_price),
          duration_weeks = COALESCE($11, duration_weeks),
          duration_hours = COALESCE($12, duration_hours),
          max_students = COALESCE($13, max_students),
          prerequisites = COALESCE($14, prerequisites),
          learning_outcomes = COALESCE($15, learning_outcomes),
          status = COALESCE($16, status),
          featured = COALESCE($17, featured),
          updated_at = NOW()
        WHERE id = $18 AND is_deleted = false
        RETURNING *
      `, [
                courseData.title,
                courseData.slug,
                courseData.description,
                courseData.shortDescription,
                courseData.categoryId,
                courseData.thumbnail,
                courseData.coverImage,
                courseData.level,
                courseData.price,
                courseData.discountPrice,
                courseData.durationWeeks,
                courseData.durationHours,
                courseData.maxStudents,
                courseData.prerequisites ? JSON.stringify(courseData.prerequisites) : null,
                courseData.learningOutcomes ? JSON.stringify(courseData.learningOutcomes) : null,
                courseData.status,
                courseData.featured,
                id
            ]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }

            await activityLogService.logActivity({
                userId: req.user!.userId,
                activityType: 'course_access',
                description: `Admin updated course: ${id}`,
                metadata: { courseId: id, changes: courseData }
            });

            return res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error updating course:', error);
            return res.status(500).json({ success: false, message: 'Failed to update course' });
        }
    }

    /**
     * Delete a course (soft delete)
     */
    async deleteCourse(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;

            await query(
                `UPDATE courses SET is_deleted = true, deleted_at = NOW() WHERE id = $1`,
                [id]
            );

            await activityLogService.logActivity({
                userId: req.user!.userId,
                activityType: 'course_access',
                description: `Admin deleted course: ${id}`,
                metadata: { courseId: id }
            });

            return res.json({ success: true, message: 'Course deleted successfully' });
        } catch (error) {
            console.error('Error deleting course:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete course' });
        }
    }

    /**
     * Bulk update course status
     */
    async bulkUpdateCourseStatus(req: AuthenticatedRequest, res: Response) {
        try {
            const { courseIds, status } = req.body;

            if (!Array.isArray(courseIds) || courseIds.length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid course IDs' });
            }

            const result = await query(
                `UPDATE courses SET status = $1, updated_at = NOW() 
         WHERE id = ANY($2::uuid[])
         RETURNING id`,
                [status, courseIds]
            );

            await activityLogService.logActivity({
                userId: req.user!.userId,
                activityType: 'course_access',
                description: `Admin bulk updated ${result.rows.length} courses to ${status}`,
                metadata: { courseIds, status }
            });

            return res.json({
                success: true,
                message: `${result.rows.length} courses updated`,
                updatedCount: result.rows.length
            });
        } catch (error) {
            console.error('Error bulk updating courses:', error);
            return res.status(500).json({ success: false, message: 'Failed to bulk update courses' });
        }
    }

    /**
     * Bulk delete courses
     */
    async bulkDeleteCourses(req: AuthenticatedRequest, res: Response) {
        try {
            const { courseIds } = req.body;

            if (!Array.isArray(courseIds) || courseIds.length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid course IDs' });
            }

            const result = await query(
                `UPDATE courses SET is_deleted = true, deleted_at = NOW() 
         WHERE id = ANY($1::uuid[])
         RETURNING id`,
                [courseIds]
            );

            await activityLogService.logActivity({
                userId: req.user!.userId,
                activityType: 'course_access',
                description: `Admin bulk deleted ${result.rows.length} courses`,
                metadata: { courseIds }
            });

            return res.json({
                success: true,
                message: `${result.rows.length} courses deleted`,
                deletedCount: result.rows.length
            });
        } catch (error) {
            console.error('Error bulk deleting courses:', error);
            return res.status(500).json({ success: false, message: 'Failed to bulk delete courses' });
        }
    }
}

export const adminCourseController = new AdminCourseController();
