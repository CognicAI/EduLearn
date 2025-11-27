import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';
import { activityLogService } from '../services/activityLogService';
import { courseAuthService } from '../services/courseAuthService';

export class CourseController {
    /**
     * Get courses for the current user (Teacher)
     */
    async getTeacherCourses(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user!.userId;
            const { status, search, page = 1, limit = 50 } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            // Build WHERE conditions for courses where teacher is owner OR assigned
            let whereConditions = ['c.is_deleted = false'];
            let havingConditions = ['(c.instructor_id = $1 OR COUNT(ct.id) > 0)'];
            const params: any[] = [userId];
            let paramIndex = 2;

            if (status) {
                whereConditions.push(`c.status = $${paramIndex}`);
                params.push(status);
                paramIndex++;
            }

            if (search) {
                whereConditions.push(`(c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`);
                params.push(`%${search}%`);
                paramIndex++;
            }

            const whereClause = whereConditions.join(' AND ');
            const havingClause = havingConditions.join(' AND ');

            // Get total count
            const countResult = await query(`
                SELECT COUNT(DISTINCT c.id) as count
                FROM courses c
                LEFT JOIN course_teachers ct ON c.id = ct.course_id AND ct.teacher_id = $1
                WHERE ${whereClause}
                GROUP BY c.id
                HAVING ${havingClause}
            `, params);
            const totalCount = countResult.rows.length;

            // Get courses (both owned and assigned)
            const result = await query(`
                SELECT 
                    c.*,
                    cat.name as category_name,
                    COUNT(DISTINCT cm.id) as module_count,
                    COUNT(DISTINCT cl.id) as lesson_count,
                    COUNT(DISTINCT e.id) as enrollment_count,
                    CASE WHEN c.instructor_id = $1 THEN true ELSE false END as is_owner,
                    COALESCE(ct.can_edit, false) as can_edit,
                    COALESCE(ct.can_delete, false) as can_delete
                FROM courses c
                LEFT JOIN categories cat ON c.category_id = cat.id
                LEFT JOIN course_modules cm ON c.id = cm.course_id AND cm.is_deleted = false
                LEFT JOIN course_lessons cl ON cm.id = cl.module_id AND cl.is_deleted = false
                LEFT JOIN enrollments e ON c.id = e.course_id
                LEFT JOIN course_teachers ct ON c.id = ct.course_id AND ct.teacher_id = $1
                WHERE ${whereClause}
                GROUP BY c.id, cat.name, ct.can_edit, ct.can_delete
                HAVING ${havingClause}
                ORDER BY c.created_at DESC
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
            console.error('Error fetching teacher courses:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch courses' });
        }
    }

    /**
     * Create a new course
     */
    async createCourse(req: AuthenticatedRequest, res: Response) {
        try {
            const { title, description, categoryId, level, price, durationWeeks, durationHours } = req.body;
            const instructorId = req.user!.userId; // The creator is the instructor

            // Generate slug from title
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

            const result = await query(
                `INSERT INTO courses (
          title, slug, description, instructor_id, category_id, 
          level, price, duration_weeks, duration_hours, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft') 
        RETURNING *`,
                [title, slug, description, instructorId, categoryId, level, price || 0, durationWeeks, durationHours]
            );

            await activityLogService.logActivity({
                userId: req.user!.userId,
                activityType: 'course_access', // Using existing type, maybe should add 'course_create'
                description: `Created course: ${title}`,
                metadata: { courseId: result.rows[0].id }
            });

            return res.status(201).json({
                success: true,
                message: 'Course created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating course:', error);
            return res.status(500).json({ success: false, message: 'Failed to create course' });
        }
    }

    /**
     * Get course details
     */
    async getCourseById(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            const result = await query(`
        SELECT 
          c.*,
          u.first_name || ' ' || u.last_name as instructor_name,
          cat.name as category_name
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN categories cat ON c.category_id = cat.id
        WHERE c.id = $1 AND c.is_deleted = false
      `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }

            const course = result.rows[0];

            // Check access using authorization service
            const hasAccess = await courseAuthService.canAccessCourse(userId, id, userRole);
            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            // Set permission flags
            course.is_owner = course.instructor_id === userId;
            course.can_edit = false;

            if (userRole === 'admin') {
                course.can_edit = true;
            } else if (userRole === 'teacher') {
                if (course.is_owner) {
                    course.can_edit = true;
                } else {
                    const permissions = await courseAuthService.getTeacherPermissions(userId, id);
                    course.permissions = permissions;
                    course.can_edit = permissions.canEdit;
                }
            }

            return res.json({
                success: true,
                data: course
            });
        } catch (error) {
            console.error('Error fetching course:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch course' });
        }
    }

    /**
     * Update course
     */
    async updateCourse(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;
            const updates = req.body;

            // Check if course exists
            const check = await query('SELECT id FROM courses WHERE id = $1 AND is_deleted = false', [id]);
            if (check.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }

            // Check edit permission using authorization service
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            // Build update query dynamically
            const allowedFields = ['title', 'description', 'short_description', 'category_id', 'level', 'price', 'duration_weeks', 'duration_hours', 'status', 'thumbnail', 'cover_image'];
            const updateParts: string[] = [];
            const params: any[] = [id];
            let paramIndex = 2;

            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    updateParts.push(`${field} = $${paramIndex}`);
                    params.push(updates[field]);
                    paramIndex++;
                }
            }

            if (updateParts.length === 0) {
                return res.json({ success: true, message: 'No changes made' });
            }

            updateParts.push(`updated_at = NOW()`);

            const result = await query(
                `UPDATE courses SET ${updateParts.join(', ')} WHERE id = $1 RETURNING *`,
                params
            );

            return res.json({
                success: true,
                message: 'Course updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating course:', error);
            return res.status(500).json({ success: false, message: 'Failed to update course' });
        }
    }

    /**
     * Delete course (soft delete)
     */
    async deleteCourse(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            // Check if course exists
            const check = await query('SELECT id FROM courses WHERE id = $1 AND is_deleted = false', [id]);
            if (check.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }

            // Check delete permission using authorization service
            const canDelete = await courseAuthService.canDeleteCourse(userId, id, userRole);
            if (!canDelete) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            await query('UPDATE courses SET is_deleted = true, deleted_at = NOW() WHERE id = $1', [id]);

            return res.json({ success: true, message: 'Course deleted successfully' });
        } catch (error) {
            console.error('Error deleting course:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete course' });
        }
    }

    /**
     * Get all categories (helper for course creation)
     */
    async getCategories(req: AuthenticatedRequest, res: Response) {
        try {
            const result = await query('SELECT * FROM categories WHERE is_deleted = false ORDER BY name');
            return res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error fetching categories:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
        }
    }
    /**
     * Get course modules
     */
    async getCourseModules(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            // Check access
            const hasAccess = await courseAuthService.canAccessCourse(userId, id, userRole);
            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            // Fetch modules with lessons
            // Fetch modules with lessons
            const modulesResult = await query(`
                SELECT 
                    cm.*,
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', cl.id,
                                'title', cl.title,
                                'duration_minutes', cl.video_duration,
                                'is_free', cl.is_free,
                                'type', COALESCE(cl.type, 'video'),
                                'completed', CASE WHEN lp.completed THEN true ELSE false END,
                                'content', cl.content,
                                'video_url', cl.video_url
                            ) ORDER BY cl.sort_order
                        )
                        FROM course_lessons cl
                        LEFT JOIN enrollments e ON e.course_id = cm.course_id AND e.student_id = $2
                        LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.enrollment_id = e.id
                        WHERE cl.module_id = cm.id AND cl.is_deleted = false
                    ) as lessons
                FROM course_modules cm
                WHERE cm.course_id = $1 AND cm.is_deleted = false
                ORDER BY cm.sort_order
            `, [id, userId]);

            // Process modules to create nested structure
            const modules = modulesResult.rows;
            const moduleMap = new Map();
            const rootModules: any[] = [];

            // First pass: map all modules
            modules.forEach(m => {
                m.subsections = [];
                moduleMap.set(m.id, m);
            });

            // Second pass: build hierarchy
            modules.forEach(m => {
                if (m.parent_id && moduleMap.has(m.parent_id)) {
                    moduleMap.get(m.parent_id).subsections.push(m);
                } else {
                    rootModules.push(m);
                }
            });

            return res.json({
                success: true,
                data: rootModules
            });
        } catch (error) {
            console.error('Error fetching course modules:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch modules' });
        }
    }

    /**
     * Get course assignments
     */
    async getCourseAssignments(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            // Check access
            const hasAccess = await courseAuthService.canAccessCourse(userId, id, userRole);
            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            // Fetch assignments with submission status
            const assignmentsResult = await query(`
                SELECT 
                    a.*,
                    s.status as submission_status,
                    s.submitted_at,
                    g.points_earned,
                    g.feedback
                FROM assignments a
                LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = $2
                LEFT JOIN grades g ON g.submission_id = s.id
                WHERE a.course_id = $1 AND a.is_deleted = false
                ORDER BY a.due_date ASC
            `, [id, userId]);

            return res.json({
                success: true,
                data: assignmentsResult.rows
            });
        } catch (error) {
            console.error('Error fetching course assignments:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
        }
    }

    /**
     * Get course files
     */
    async getCourseFiles(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            // Check access
            const hasAccess = await courseAuthService.canAccessCourse(userId, id, userRole);
            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }


            const filesResult = await query(`
                SELECT f.*
                FROM files f
                JOIN course_lessons cl ON substring(cl.video_url from '[^/]+$') = f.filename
                JOIN course_modules cm ON cl.module_id = cm.id
                WHERE cm.course_id = $1
                  AND cm.is_deleted = false
                  AND cl.is_deleted = false
                  AND cl.type = 'file'
                  AND f.is_deleted = false
                GROUP BY f.id
                ORDER BY f.created_at DESC
            `, [id]);


            return res.json({
                success: true,
                data: filesResult.rows
            });
        } catch (error) {
            console.error('Error fetching course files:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch files' });
        }
    }

    /**
     * Get course announcements
     */
    async getCourseAnnouncements(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            // Check access
            const hasAccess = await courseAuthService.canAccessCourse(userId, id, userRole);
            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            const announcementsResult = await query(`
                SELECT 
                    a.*,
                    u.first_name || ' ' || u.last_name as author_name,
                    u.profile_image as author_image
                FROM announcements a
                JOIN users u ON a.author_id = u.id
                WHERE a.course_id = $1 AND a.is_deleted = false
                ORDER BY a.created_at DESC
            `, [id]);

            return res.json({
                success: true,
                data: announcementsResult.rows
            });
        } catch (error) {
            console.error('Error fetching course announcements:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
        }
    }
    /**
     * Create a new module
     */
    async createModule(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;
            const { title, description, sort_order, parentId } = req.body;

            // Check edit permission
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            const result = await query(
                `INSERT INTO course_modules (course_id, title, description, sort_order, parent_id) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING *`,
                [id, title, description, sort_order || 0, parentId || null]
            );

            return res.status(201).json({
                success: true,
                message: 'Module created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating module:', error);
            return res.status(500).json({ success: false, message: 'Failed to create module' });
        }
    }

    /**
     * Create a new lesson
     */
    async createLesson(req: AuthenticatedRequest, res: Response) {
        try {
            const { id, moduleId } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;
            const { title, content, video_url, duration_minutes, is_free, type, sort_order } = req.body;

            // Check edit permission
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            const result = await query(
                `INSERT INTO course_lessons (module_id, title, content, video_url, video_duration, is_free, type, sort_order) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                 RETURNING *`,
                [moduleId, title, content, video_url, duration_minutes || 0, is_free || false, type || 'video', sort_order || 0]
            );

            return res.status(201).json({
                success: true,
                message: 'Lesson created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating lesson:', error);
            return res.status(500).json({ success: false, message: 'Failed to create lesson' });
        }
    }

    /**
     * Delete lesson
     */
    async deleteLesson(req: AuthenticatedRequest, res: Response) {
        try {
            const { id, lessonId } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            // Check edit permission
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            // Get lesson details before deleting
            const lessonResult = await query('SELECT * FROM course_lessons WHERE id = $1', [lessonId]);
            if (lessonResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Lesson not found' });
            }
            const lesson = lessonResult.rows[0];

            const result = await query(
                `UPDATE course_lessons SET is_deleted = true, deleted_at = NOW() 
                 WHERE id = $1 RETURNING id`,
                [lessonId]
            );

            // If it's a file lesson, try to delete the associated file
            if (lesson.type === 'file' && lesson.video_url) {
                // Extract filename from URL (assuming format .../uploads/filename)
                const filename = lesson.video_url.split('/').pop();

                if (filename) {
                    // Find file by path
                    const fileResult = await query(
                        `SELECT id FROM files WHERE file_path = $1 AND is_deleted = false`,
                        [`/uploads/${filename}`]
                    );

                    if (fileResult.rows.length > 0) {
                        const fileId = fileResult.rows[0].id;

                        // Remove association
                        await query(
                            `DELETE FROM file_associations WHERE file_id = $1 AND entity_id = $2 AND entity_type = 'course'`,
                            [fileId, id]
                        );

                        // Soft delete file
                        await query(
                            `UPDATE files SET is_deleted = true WHERE id = $1`,
                            [fileId]
                        );
                    }
                }
            }

            return res.json({ success: true, message: 'Lesson deleted successfully' });
        } catch (error) {
            console.error('Error deleting lesson:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete lesson' });
        }
    }

    /**
     * Create a new assignment
     */
    async createAssignment(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;
            const { title, description, due_date, max_points, assignment_type } = req.body;

            // Check edit permission
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            const result = await query(
                `INSERT INTO assignments (course_id, title, description, due_date, max_points, assignment_type, status) 
                 VALUES ($1, $2, $3, $4, $5, $6, 'published') 
                 RETURNING *`,
                [id, title, description, due_date, max_points || 100, assignment_type || 'essay']
            );

            return res.status(201).json({
                success: true,
                message: 'Assignment created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating assignment:', error);
            return res.status(500).json({ success: false, message: 'Failed to create assignment' });
        }
    }

    /**
     * Upload a file
     */
    async uploadFile(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            // Check edit permission
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                // Clean up uploaded file if permission denied
                // fs.unlinkSync(file.path); // Need fs import if we want to do this
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            // Create file record
            const fileResult = await query(
                `INSERT INTO files (uploader_id, filename, original_filename, file_path, file_size, mime_type, is_public) 
                 VALUES ($1, $2, $3, $4, $5, $6, true) 
                 RETURNING *`,
                [userId, file.filename, file.originalname, `/uploads/${file.filename}`, file.size, file.mimetype]
            );

            const fileId = fileResult.rows[0].id;

            // Associate with course
            await query(
                `INSERT INTO file_associations (file_id, entity_type, entity_id, association_type) 
                 VALUES ($1, 'course', $2, 'resource')`,
                [fileId, id]
            );

            return res.status(201).json({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    ...fileResult.rows[0],
                    url: `${process.env.API_URL || 'http://localhost:3001'}/uploads/${file.filename}`
                }
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            return res.status(500).json({ success: false, message: 'Failed to upload file' });
        }
    }

    /**
     * Create a new file (Metadata only - Legacy or specific use case)
     */
    async createFile(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;
            const { filename, file_size, mime_type, file_path } = req.body;

            // Check edit permission
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            // 1. Create file record
            const fileResult = await query(
                `INSERT INTO files (uploader_id, filename, original_filename, file_path, file_size, mime_type, is_public) 
                 VALUES ($1, $2, $2, $3, $4, $5, true) 
                 RETURNING *`,
                [userId, filename, file_path || '/tmp/placeholder', file_size || 0, mime_type || 'application/octet-stream']
            );

            const fileId = fileResult.rows[0].id;

            // 2. Associate with course
            await query(
                `INSERT INTO file_associations (file_id, entity_type, entity_id, association_type) 
                 VALUES ($1, 'course', $2, 'resource')`,
                [fileId, id]
            );

            return res.status(201).json({
                success: true,
                message: 'File added successfully',
                data: fileResult.rows[0]
            });
        } catch (error) {
            console.error('Error adding file:', error);
            return res.status(500).json({ success: false, message: 'Failed to add file' });
        }
    }

    /**
     * Create a new announcement
     */
    async createAnnouncement(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;
            const { title, content, priority } = req.body;

            // Check edit permission
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            const result = await query(
                `INSERT INTO announcements (course_id, author_id, title, content, priority, is_published) 
                 VALUES ($1, $2, $3, $4, $5, true) 
                 RETURNING *`,
                [id, userId, title, content, priority || 'medium']
            );

            return res.status(201).json({
                success: true,
                message: 'Announcement posted successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error posting announcement:', error);
            return res.status(500).json({ success: false, message: 'Failed to post announcement' });
        }
    }
    /**
     * Update module
     */
    async updateModule(req: AuthenticatedRequest, res: Response) {
        try {
            const { id, moduleId } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;
            const { title, description, sort_order } = req.body;

            // Check edit permission
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            const result = await query(
                `UPDATE course_modules 
                 SET title = COALESCE($1, title), 
                     description = COALESCE($2, description), 
                     sort_order = COALESCE($3, sort_order),
                     updated_at = NOW()
                 WHERE id = $4 AND course_id = $5
                 RETURNING *`,
                [title, description, sort_order, moduleId, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Module not found' });
            }

            return res.json({
                success: true,
                message: 'Module updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating module:', error);
            return res.status(500).json({ success: false, message: 'Failed to update module' });
        }
    }

    /**
     * Get course enrollments (Participants)
     */
    async getCourseEnrollments(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            console.log(`[getCourseEnrollments] Fetching for course ${id}, user ${userId}, role ${userRole}`);

            // Check access
            const hasAccess = await courseAuthService.canAccessCourse(userId, id, userRole);
            if (!hasAccess) {
                console.log(`[getCourseEnrollments] Access denied for user ${userId}`);
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            // Fetch enrolled students
            const result = await query(`
                SELECT 
                    e.id,
                    e.enrollment_date,
                    e.status,
                    e.progress_percentage,
                    u.id as student_id,
                    TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) as student_name,
                    u.email as student_email,
                    u.profile_image as student_image
                FROM enrollments e
                JOIN users u ON e.student_id = u.id
                WHERE e.course_id = $1
                ORDER BY u.first_name, u.last_name
            `, [id]);

            console.log(`[getCourseEnrollments] Found ${result.rows.length} enrollments`);

            return res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Error fetching course enrollments:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch enrollments' });
        }
    }



    /**
     * Delete module
     */
    async deleteModule(req: AuthenticatedRequest, res: Response) {
        try {
            const { id, moduleId } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            // Check edit permission
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            const result = await query(
                `UPDATE course_modules SET is_deleted = true, deleted_at = NOW() 
                 WHERE id = $1 AND course_id = $2 RETURNING id`,
                [moduleId, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Module not found' });
            }

            return res.json({ success: true, message: 'Module deleted successfully' });
        } catch (error) {
            console.error('Error deleting module:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete module' });
        }
    }

    /**
     * Update assignment
     */
    async updateAssignment(req: AuthenticatedRequest, res: Response) {
        try {
            const { id, assignmentId } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;
            const updates = req.body;

            // Check edit permission
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            // Build dynamic update query
            const allowedFields = ['title', 'description', 'due_date', 'max_points', 'assignment_type', 'status', 'sort_order'];
            const updateParts: string[] = [];
            const params: any[] = [assignmentId, id];
            let paramIndex = 3;

            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    updateParts.push(`${field} = $${paramIndex}`);
                    params.push(updates[field]);
                    paramIndex++;
                }
            }

            if (updateParts.length === 0) {
                return res.json({ success: true, message: 'No changes made' });
            }

            updateParts.push(`updated_at = NOW()`);

            const result = await query(
                `UPDATE assignments SET ${updateParts.join(', ')} 
                 WHERE id = $1 AND course_id = $2 
                 RETURNING *`,
                params
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Assignment not found' });
            }

            return res.json({
                success: true,
                message: 'Assignment updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating assignment:', error);
            return res.status(500).json({ success: false, message: 'Failed to update assignment' });
        }
    }

    /**
     * Delete assignment
     */
    async deleteAssignment(req: AuthenticatedRequest, res: Response) {
        try {
            const { id, assignmentId } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            // Check edit permission
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            const result = await query(
                `UPDATE assignments SET is_deleted = true, deleted_at = NOW() 
                 WHERE id = $1 AND course_id = $2 RETURNING id`,
                [assignmentId, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Assignment not found' });
            }

            return res.json({ success: true, message: 'Assignment deleted successfully' });
        } catch (error) {
            console.error('Error deleting assignment:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete assignment' });
        }
    }

    /**
     * Delete file
     */
    async deleteFile(req: AuthenticatedRequest, res: Response) {
        try {
            const { id, fileId } = req.params;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            // Check edit permission
            const canEdit = await courseAuthService.canEditCourse(userId, id, userRole);
            if (!canEdit) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            // Soft delete file and remove association
            // First remove association
            await query(
                `DELETE FROM file_associations WHERE file_id = $1 AND entity_id = $2 AND entity_type = 'course'`,
                [fileId, id]
            );

            // Then soft delete file (optional, or keep it if used elsewhere? For now soft delete)
            await query(
                `UPDATE files SET is_deleted = true WHERE id = $1`,
                [fileId]
            );

            return res.json({ success: true, message: 'File deleted successfully' });
        } catch (error) {
            console.error('Error deleting file:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete file' });
        }
    }
}

export const courseController = new CourseController();
