import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';

export class DashboardController {
    /**
     * Get student dashboard data
     */
    async getStudentDashboard(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user!.userId;

            // 1. Stats
            const statsResult = await query(`
                SELECT 
                    COUNT(*) as total_courses,
                    COUNT(*) FILTER (WHERE status = 'completed') as completed_courses,
                    AVG(progress_percentage) as avg_progress
                FROM enrollments
                WHERE student_id = $1
            `, [userId]);

            const stats = statsResult.rows[0];

            // 2. Upcoming Deadlines
            const deadlinesResult = await query(`
                SELECT 
                    a.id,
                    a.title,
                    c.title as course_title,
                    a.due_date,
                    a.assignment_type as type
                FROM assignments a
                JOIN enrollments e ON a.course_id = e.course_id
                JOIN courses c ON a.course_id = c.id
                LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $1
                WHERE e.student_id = $1 
                AND a.due_date > NOW()
                AND s.id IS NULL -- Only show unsubmitted assignments
                ORDER BY a.due_date ASC
                LIMIT 5
            `, [userId]);

            // 3. Recent Activity (This is a simplified view, ideally we'd have a unified activity stream)
            // For now, let's fetch recent grades and course enrollments
            const activityResult = await query(`
                (
                    SELECT 
                        'grade' as type,
                        'Received grade for ' || a.title as title,
                        c.title as course,
                        g.created_at as time
                    FROM grades g
                    JOIN submissions s ON g.submission_id = s.id
                    JOIN assignments a ON s.assignment_id = a.id
                    JOIN courses c ON a.course_id = c.id
                    WHERE s.student_id = $1
                )
                UNION ALL
                (
                    SELECT 
                        'course' as type,
                        'Enrolled in ' || c.title as title,
                        c.title as course,
                        e.enrollment_date as time
                    FROM enrollments e
                    JOIN courses c ON e.course_id = c.id
                    WHERE e.student_id = $1
                )
                ORDER BY time DESC
                LIMIT 5
            `, [userId]);

            return res.json({
                success: true,
                data: {
                    stats: {
                        totalCourses: parseInt(stats.total_courses),
                        completionRate: parseFloat(stats.avg_progress || 0),
                        upcomingDeadlines: deadlinesResult.rows.length,
                        achievements: 0 // Placeholder
                    },
                    upcomingDeadlines: deadlinesResult.rows.map(d => ({
                        id: d.id,
                        title: d.title,
                        course: d.course_title,
                        date: d.due_date,
                        type: d.type
                    })),
                    recentActivity: activityResult.rows.map((a, index) => ({
                        id: `act-${index}`,
                        type: a.type,
                        title: a.title,
                        course: a.course,
                        time: a.time
                    }))
                }
            });
        } catch (error) {
            console.error('Error fetching student dashboard:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
        }
    }

    /**
     * Get teacher dashboard data
     */
    async getTeacherDashboard(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user!.userId;

            // 1. Stats
            const statsResult = await query(`
                SELECT 
                    COUNT(DISTINCT c.id) as total_courses,
                    COUNT(DISTINCT e.id) as total_students
                FROM courses c
                LEFT JOIN enrollments e ON c.id = e.course_id
                WHERE c.instructor_id = $1 AND c.is_deleted = false
            `, [userId]);

            const pendingGradesResult = await query(`
                SELECT COUNT(*) as count
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                JOIN courses c ON a.course_id = c.id
                LEFT JOIN grades g ON s.id = g.submission_id
                WHERE c.instructor_id = $1 AND g.id IS NULL
            `, [userId]);

            const stats = statsResult.rows[0];
            const pendingGrades = parseInt(pendingGradesResult.rows[0].count);

            // 2. Recent Activity (Submissions, New Enrollments)
            const activityResult = await query(`
                (
                    SELECT 
                        'submission' as type,
                        'New submission for ' || a.title as title,
                        c.title as course,
                        s.submitted_at as time,
                        u.first_name || ' ' || u.last_name as user_name
                    FROM submissions s
                    JOIN assignments a ON s.assignment_id = a.id
                    JOIN courses c ON a.course_id = c.id
                    JOIN users u ON s.student_id = u.id
                    WHERE c.instructor_id = $1
                )
                UNION ALL
                (
                    SELECT 
                        'enrollment' as type,
                        'New student enrolled' as title,
                        c.title as course,
                        e.enrollment_date as time,
                        u.first_name || ' ' || u.last_name as user_name
                    FROM enrollments e
                    JOIN courses c ON e.course_id = c.id
                    JOIN users u ON e.student_id = u.id
                    WHERE c.instructor_id = $1
                )
                ORDER BY time DESC
                LIMIT 5
            `, [userId]);

            // 3. Course Overview
            const coursesResult = await query(`
                SELECT 
                    c.id,
                    c.title,
                    COUNT(DISTINCT e.id) as students,
                    COUNT(DISTINCT a.id) as assignments,
                    (
                        SELECT COUNT(*) 
                        FROM submissions s2 
                        JOIN assignments a2 ON s2.assignment_id = a2.id 
                        LEFT JOIN grades g2 ON s2.id = g2.submission_id
                        WHERE a2.course_id = c.id AND g2.id IS NULL
                    ) as pending_grades,
                    c.status
                FROM courses c
                LEFT JOIN enrollments e ON c.id = e.course_id
                LEFT JOIN assignments a ON c.id = a.course_id AND a.is_deleted = false
                WHERE c.instructor_id = $1 AND c.is_deleted = false
                GROUP BY c.id
                ORDER BY c.created_at DESC
                LIMIT 5
            `, [userId]);

            return res.json({
                success: true,
                data: {
                    stats: {
                        totalCourses: parseInt(stats.total_courses),
                        totalStudents: parseInt(stats.total_students),
                        pendingGrades: pendingGrades,
                        completionRate: 0 // To be implemented
                    },
                    recentActivity: activityResult.rows.map((a, index) => ({
                        id: `act-${index}`,
                        type: a.type,
                        title: a.title,
                        course: a.course,
                        user: a.user_name,
                        time: a.time
                    })),
                    courses: coursesResult.rows.map(c => ({
                        id: c.id,
                        title: c.title,
                        students: parseInt(c.students),
                        assignments: parseInt(c.assignments),
                        pendingGrades: parseInt(c.pending_grades),
                        status: c.status
                    }))
                }
            });
        } catch (error) {
            console.error('Error fetching teacher dashboard:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
        }
    }
}

export const dashboardController = new DashboardController();
