import { query } from '../config/db';

/**
 * Course Authorization Service
 * Handles authorization logic for course access, editing, and deletion
 */
export class CourseAuthService {
    /**
     * Check if a user can access (view) a course
     * @param userId - User ID
     * @param courseId - Course ID
     * @param userRole - User role (admin, teacher, student)
     * @returns Promise<boolean>
     */
    async canAccessCourse(
        userId: string,
        courseId: string,
        userRole: string
    ): Promise<boolean> {
        try {
            // Admins can access all courses
            if (userRole === 'admin') {
                return true;
            }

            // Check if user is the course instructor
            const courseResult = await query(
                'SELECT instructor_id, status FROM courses WHERE id = $1 AND is_deleted = false',
                [courseId]
            );

            if (courseResult.rows.length === 0) {
                return false;
            }

            const course = courseResult.rows[0];

            // Teachers can access if they are the instructor or assigned to the course
            if (userRole === 'teacher') {
                if (course.instructor_id === userId) {
                    return true;
                }

                const assignmentResult = await query(
                    'SELECT id FROM course_teachers WHERE course_id = $1 AND teacher_id = $2',
                    [courseId, userId]
                );

                return assignmentResult.rows.length > 0;
            }

            // Students can access published courses or courses they're enrolled in
            if (userRole === 'student') {
                if (course.status === 'published') {
                    return true;
                }

                const enrollmentResult = await query(
                    'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
                    [courseId, userId]
                );

                return enrollmentResult.rows.length > 0;
            }

            return false;
        } catch (error) {
            console.error('Error checking course access:', error);
            return false;
        }
    }

    /**
     * Check if a user can edit a course
     * @param userId - User ID
     * @param courseId - Course ID
     * @param userRole - User role (admin, teacher, student)
     * @returns Promise<boolean>
     */
    async canEditCourse(
        userId: string,
        courseId: string,
        userRole: string
    ): Promise<boolean> {
        try {
            // Admins can edit all courses
            if (userRole === 'admin') {
                return true;
            }

            // Students cannot edit courses
            if (userRole === 'student') {
                return false;
            }

            // Check if teacher is the course instructor
            const courseResult = await query(
                'SELECT instructor_id FROM courses WHERE id = $1 AND is_deleted = false',
                [courseId]
            );

            if (courseResult.rows.length === 0) {
                return false;
            }

            if (courseResult.rows[0].instructor_id === userId) {
                return true;
            }

            // Check if teacher is assigned with edit permissions
            const assignmentResult = await query(
                'SELECT can_edit FROM course_teachers WHERE course_id = $1 AND teacher_id = $2',
                [courseId, userId]
            );

            if (assignmentResult.rows.length > 0 && assignmentResult.rows[0].can_edit) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error checking course edit permission:', error);
            return false;
        }
    }

    /**
     * Check if a user can delete a course
     * @param userId - User ID
     * @param courseId - Course ID
     * @param userRole - User role (admin, teacher, student)
     * @returns Promise<boolean>
     */
    async canDeleteCourse(
        userId: string,
        courseId: string,
        userRole: string
    ): Promise<boolean> {
        try {
            // Admins can delete all courses
            if (userRole === 'admin') {
                return true;
            }

            // Students cannot delete courses
            if (userRole === 'student') {
                return false;
            }

            // Check if teacher is the course instructor
            const courseResult = await query(
                'SELECT instructor_id FROM courses WHERE id = $1 AND is_deleted = false',
                [courseId]
            );

            if (courseResult.rows.length === 0) {
                return false;
            }

            if (courseResult.rows[0].instructor_id === userId) {
                return true;
            }

            // Check if teacher is assigned with delete permissions
            const assignmentResult = await query(
                'SELECT can_delete FROM course_teachers WHERE course_id = $1 AND teacher_id = $2',
                [courseId, userId]
            );

            if (assignmentResult.rows.length > 0 && assignmentResult.rows[0].can_delete) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error checking course delete permission:', error);
            return false;
        }
    }

    /**
     * Check if a teacher is assigned to a course
     * @param teacherId - Teacher user ID
     * @param courseId - Course ID
     * @returns Promise<boolean>
     */
    async isTeacherAssignedToCourse(
        teacherId: string,
        courseId: string
    ): Promise<boolean> {
        try {
            const result = await query(
                'SELECT id FROM course_teachers WHERE course_id = $1 AND teacher_id = $2',
                [courseId, teacherId]
            );

            return result.rows.length > 0;
        } catch (error) {
            console.error('Error checking teacher assignment:', error);
            return false;
        }
    }

    /**
     * Get teacher's permissions for a course
     * @param teacherId - Teacher user ID
     * @param courseId - Course ID
     * @returns Promise<{canEdit: boolean, canDelete: boolean, isOwner: boolean}>
     */
    async getTeacherPermissions(
        teacherId: string,
        courseId: string
    ): Promise<{ canEdit: boolean; canDelete: boolean; isOwner: boolean }> {
        try {
            // Check if teacher is the owner
            const courseResult = await query(
                'SELECT instructor_id FROM courses WHERE id = $1 AND is_deleted = false',
                [courseId]
            );

            if (courseResult.rows.length === 0) {
                return { canEdit: false, canDelete: false, isOwner: false };
            }

            const isOwner = courseResult.rows[0].instructor_id === teacherId;

            if (isOwner) {
                return { canEdit: true, canDelete: true, isOwner: true };
            }

            // Check assignment permissions
            const assignmentResult = await query(
                'SELECT can_edit, can_delete FROM course_teachers WHERE course_id = $1 AND teacher_id = $2',
                [courseId, teacherId]
            );

            if (assignmentResult.rows.length > 0) {
                return {
                    canEdit: assignmentResult.rows[0].can_edit,
                    canDelete: assignmentResult.rows[0].can_delete,
                    isOwner: false
                };
            }

            return { canEdit: false, canDelete: false, isOwner: false };
        } catch (error) {
            console.error('Error getting teacher permissions:', error);
            return { canEdit: false, canDelete: false, isOwner: false };
        }
    }
}

export const courseAuthService = new CourseAuthService();
