import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';
import { activityLogService } from '../services/activityLogService';

export class AdminAnalyticsController {
    /**
     * Get platform-wide overview statistics
     */
    async getPlatformStats(req: AuthenticatedRequest, res: Response) {
        try {
            const stats = await query(`
        WITH user_stats AS (
          SELECT 
            COUNT(*) as total_users,
            COUNT(*) FILTER (WHERE is_active = true) as active_users,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
            COUNT(*) FILTER (WHERE role = 'student') as total_students,
            COUNT(*) FILTER (WHERE role = 'teacher') as total_teachers,
            COUNT(*) FILTER (WHERE role = 'admin') as total_admins
          FROM users
          WHERE is_deleted = false
        ),
        course_stats AS (
          SELECT 
            COUNT(*) as total_courses,
            COUNT(*) FILTER (WHERE status = 'published') as active_courses,
            COUNT(*) FILTER (WHERE status = 'draft') as draft_courses,
            COUNT(*) FILTER (WHERE status = 'archived') as archived_courses,
            AVG(rating_average) as avg_course_rating
          FROM courses
          WHERE is_deleted = false
        ),
        enrollment_stats AS (
          SELECT 
            COUNT(*) as total_enrollments,
            COUNT(*) FILTER (WHERE status = 'active') as active_enrollments,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_enrollments,
            AVG(progress_percentage) as avg_progress
          FROM enrollments
        ),
        financial_stats AS (
          SELECT 
            COUNT(*) as total_transactions,
            SUM(amount) FILTER (WHERE status = 'completed') as total_revenue,
            SUM(amount) FILTER (WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days') as revenue_30d
          FROM transactions
        ),
        assignment_stats AS (
          SELECT 
            COUNT(*) as total_assignments,
            COUNT(*) FILTER (WHERE status = 'published') as active_assignments
          FROM assignments
          WHERE is_deleted = false
        )
        SELECT 
          u.*,
          c.*,
          e.*,
          f.*,
          a.*
        FROM user_stats u, course_stats c, enrollment_stats e, financial_stats f, assignment_stats a
      `);

            const platformData = stats.rows[0];

            // Get recent activity
            const recentActivity = await query(`
        SELECT 
          ual.id,
          ual.user_id,
          ual.activity_type,
          ual.description,
          ual.created_at,
          u.first_name,
          u.last_name
        FROM user_activity_logs ual
        LEFT JOIN users u ON ual.user_id = u.id
        ORDER BY ual.created_at DESC
        LIMIT 50
      `);

            // Log admin access
            await activityLogService.logActivity({
                userId: req.user!.userId,
                activityType: 'profile_update',
                description: 'Admin accessed platform statistics',
                metadata: { action: 'view_platform_stats' }
            });

            res.json({
                success: true,
                data: {
                    stats: {
                        totalUsers: parseInt(platformData.total_users),
                        activeUsers: parseInt(platformData.active_users),
                        newUsers30d: parseInt(platformData.new_users_30d),
                        totalStudents: parseInt(platformData.total_students),
                        totalTeachers: parseInt(platformData.total_teachers),
                        totalAdmins: parseInt(platformData.total_admins),
                        totalCourses: parseInt(platformData.total_courses),
                        activeCourses: parseInt(platformData.active_courses),
                        draftCourses: parseInt(platformData.draft_courses),
                        archivedCourses: parseInt(platformData.archived_courses),
                        avgCourseRating: parseFloat(platformData.avg_course_rating || 0).toFixed(2),
                        totalEnrollments: parseInt(platformData.total_enrollments),
                        activeEnrollments: parseInt(platformData.active_enrollments),
                        completedEnrollments: parseInt(platformData.completed_enrollments),
                        avgProgress: parseFloat(platformData.avg_progress || 0).toFixed(2),
                        totalRevenue: parseFloat(platformData.total_revenue || 0),
                        revenue30d: parseFloat(platformData.revenue_30d || 0),
                        totalTransactions: parseInt(platformData.total_transactions),
                        totalAssignments: parseInt(platformData.total_assignments),
                        activeAssignments: parseInt(platformData.active_assignments)
                    },
                    recentActivity: recentActivity.rows.map(activity => ({
                        id: activity.id,
                        user: activity.first_name ? `${activity.first_name} ${activity.last_name}` : 'Unknown User',
                        title: activity.description || formatActivityType(activity.activity_type),
                        time: new Date(activity.created_at).toLocaleString(),
                        type: mapActivityTypeToColorType(activity.activity_type)
                    }))
                }
            });
        } catch (error) {
            console.error('Error fetching platform stats:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch platform statistics' });
        }
    }

    /**
     * Get user analytics with growth trends
     */
    async getUserAnalytics(req: AuthenticatedRequest, res: Response) {
        try {
            const { startDate, endDate } = req.query;

            // User growth over time
            const userGrowth = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_users,
          role
        FROM users
        WHERE is_deleted = false
          AND created_at >= COALESCE($1::timestamp, NOW() - INTERVAL '30 days')
          AND created_at <= COALESCE($2::timestamp, NOW())
        GROUP BY DATE(created_at), role
        ORDER BY date DESC
      `, [startDate, endDate]);

            // User distribution by role
            const roleDistribution = await query(`
        SELECT 
          role,
          COUNT(*) as count,
          COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE is_deleted = false) as percentage
        FROM users
        WHERE is_deleted = false
        GROUP BY role
      `);

            // Active users trends
            const activeUsersTrend = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(DISTINCT user_id) as active_users
        FROM user_activity_logs
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

            res.json({
                success: true,
                data: {
                    userGrowth: userGrowth.rows,
                    roleDistribution: roleDistribution.rows.map(r => ({
                        role: r.role,
                        count: parseInt(r.count),
                        percentage: parseFloat(r.percentage).toFixed(2)
                    })),
                    activeUsersTrend: activeUsersTrend.rows
                }
            });
        } catch (error) {
            console.error('Error fetching user analytics:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch user analytics' });
        }
    }

    /**
     * Get course analytics and performance metrics
     */
    async getCourseAnalytics(req: AuthenticatedRequest, res: Response) {
        try {
            // Top performing courses
            const topCourses = await query(`
        SELECT 
          c.id,
          c.title,
          c.enrollment_count,
          c.completion_count,
          c.rating_average,
          c.rating_count,
          COALESCE(c.completion_count * 100.0 / NULLIF(c.enrollment_count, 0), 0) as completion_rate,
          u.first_name || ' ' || u.last_name as instructor_name
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE c.is_deleted = false
        ORDER BY c.enrollment_count DESC
        LIMIT 10
      `);

            // Course enrollment trends
            const enrollmentTrends = await query(`
        SELECT 
          DATE(enrollment_date) as date,
          COUNT(*) as enrollments
        FROM enrollments
        WHERE enrollment_date >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(enrollment_date)
        ORDER BY date DESC
      `);

            // Category distribution
            const categoryStats = await query(`
        SELECT 
          cat.name as category,
          COUNT(c.id) as course_count,
          SUM(c.enrollment_count) as total_enrollments
        FROM categories cat
        LEFT JOIN courses c ON cat.id = c.category_id AND c.is_deleted = false
        WHERE cat.is_deleted = false
        GROUP BY cat.id, cat.name
        ORDER BY course_count DESC
      `);

            res.json({
                success: true,
                data: {
                    topCourses: topCourses.rows.map(c => ({
                        id: c.id,
                        title: c.title,
                        enrollmentCount: parseInt(c.enrollment_count || 0),
                        completionCount: parseInt(c.completion_count || 0),
                        completionRate: parseFloat(c.completion_rate || 0).toFixed(2),
                        rating: parseFloat(c.rating_average || 0).toFixed(2),
                        ratingCount: parseInt(c.rating_count || 0),
                        instructor: c.instructor_name
                    })),
                    enrollmentTrends: enrollmentTrends.rows,
                    categoryStats: categoryStats.rows.map(cat => ({
                        category: cat.category,
                        courseCount: parseInt(cat.course_count || 0),
                        totalEnrollments: parseInt(cat.total_enrollments || 0)
                    }))
                }
            });
        } catch (error) {
            console.error('Error fetching course analytics:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch course analytics' });
        }
    }

    /**
     * Get financial analytics and revenue metrics
     */
    async getFinancialAnalytics(req: AuthenticatedRequest, res: Response) {
        try {
            // Revenue over time
            const revenueOverTime = await query(`
        SELECT 
          DATE(created_at) as date,
          SUM(amount) FILTER (WHERE status = 'completed') as revenue,
          COUNT(*) FILTER (WHERE status = 'completed') as transaction_count,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_count
        FROM transactions
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

            // Revenue by course
            const revenueByCourse = await query(`
        SELECT 
          c.id,
          c.title,
          SUM(t.amount) FILTER (WHERE t.status = 'completed') as revenue,
          COUNT(t.id) FILTER (WHERE t.status = 'completed') as transaction_count
        FROM courses c
        LEFT JOIN transactions t ON c.id = t.course_id
        WHERE c.is_deleted = false
        GROUP BY c.id, c.title
        HAVING SUM(t.amount) FILTER (WHERE t.status = 'completed') > 0
        ORDER BY revenue DESC
        LIMIT 10
      `);

            // Coupon usage
            const couponStats = await query(`
        SELECT 
          code,
          current_uses,
          max_uses,
          discount_type,
          discount_value,
          is_active
        FROM coupons
        ORDER BY current_uses DESC
        LIMIT 10
      `);

            res.json({
                success: true,
                data: {
                    revenueOverTime: revenueOverTime.rows.map(r => ({
                        date: r.date,
                        revenue: parseFloat(r.revenue || 0),
                        transactionCount: parseInt(r.transaction_count || 0),
                        failedCount: parseInt(r.failed_count || 0)
                    })),
                    revenueByCourse: revenueByCourse.rows.map(c => ({
                        id: c.id,
                        title: c.title,
                        revenue: parseFloat(c.revenue || 0),
                        transactionCount: parseInt(c.transaction_count || 0)
                    })),
                    couponStats: couponStats.rows
                }
            });
        } catch (error) {
            console.error('Error fetching financial analytics:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch financial analytics' });
        }
    }

    /**
     * Get system health metrics
     */
    async getSystemHealth(req: AuthenticatedRequest, res: Response) {
        try {
            // Database stats
            const dbStats = await query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
          pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
      `);

            // System logs summary
            const logsSummary = await query(`
        SELECT 
          level,
          COUNT(*) as count
        FROM system_logs
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY level
      `);

            // Error rate analysis
            const errorAnalysis = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) FILTER (WHERE level IN ('error', 'critical')) as error_count,
          COUNT(*) as total_logs
        FROM system_logs
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

            res.json({
                success: true,
                data: {
                    database: {
                        tables: dbStats.rows.map(t => ({
                            schema: t.schemaname,
                            table: t.tablename,
                            size: t.size,
                            sizeBytes: parseInt(t.size_bytes)
                        }))
                    },
                    logs: {
                        summary: logsSummary.rows.map(l => ({
                            level: l.level,
                            count: parseInt(l.count)
                        })),
                        errorAnalysis: errorAnalysis.rows.map(e => ({
                            date: e.date,
                            errorCount: parseInt(e.error_count || 0),
                            totalLogs: parseInt(e.total_logs || 0),
                            errorRate: parseFloat(((e.error_count || 0) * 100.0 / (e.total_logs || 1)).toFixed(2))
                        }))
                    },
                    uptime: '99.9%' // This would typically come from a monitoring service
                }
            });
        } catch (error) {
            console.error('Error fetching system health:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch system health metrics' });
        }
    }
}

function formatActivityType(type: string): string {
    if (!type) return 'Unknown Activity';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function mapActivityTypeToColorType(type: string): string {
    switch (type) {
        case 'login':
        case 'logout':
            return 'system';
        case 'assignment_submit':
        case 'discussion_post':
            return 'success';
        case 'profile_update':
            return 'system';
        default:
            return 'success';
    }
}

export const adminAnalyticsController = new AdminAnalyticsController();
