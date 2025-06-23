import { query } from '../config/db';

export interface LogActivityParams {
  userId: string;
  activityType: 'login' | 'logout' | 'course_access' | 'assignment_submit' | 'discussion_post' | 'profile_update';
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export class ActivityLogService {
  async logActivity(params: LogActivityParams): Promise<void> {
    const { userId, activityType, description, ipAddress, userAgent, metadata } = params;
    const insertQuery = `
      INSERT INTO user_activity_logs (user_id, activity_type, description, ip_address, user_agent, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at
    `;
    const values = [
      userId,
      activityType,
      description || null,
      ipAddress || null,
      userAgent || null,
      metadata && Object.keys(metadata).length ? JSON.stringify(metadata) : null
    ];
    console.log('Executing activity log insert with values:', values);
    const result = await query(insertQuery, values);
    console.log('Activity logged successfully:', result.rows[0]);
  }
}

export const activityLogService = new ActivityLogService();
