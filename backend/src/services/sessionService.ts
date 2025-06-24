import { query } from '../config/db';
import { CreateSessionData, SessionRecord } from '../types/session';

export class SessionService {
  async createSession(data: CreateSessionData): Promise<SessionRecord> {
    const {
      userId,
      sessionToken,
      refreshToken = null,
      expiresAt,
      ipAddress,
      userAgent,
      deviceType = 'desktop',
      isActive = true
    } = data;

    const insertQuery = `
      INSERT INTO user_sessions (
        user_id,
        session_token,
        refresh_token,
        expires_at,
        ip_address,
        user_agent,
        device_type,
        is_active
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, user_id AS "userId", session_token AS "sessionToken", refresh_token AS "refreshToken", expires_at AS "expiresAt", ip_address AS "ipAddress", user_agent AS "userAgent", device_type AS "deviceType", is_active AS "isActive", created_at AS "createdAt"
    `;

    const result = await query(insertQuery, [
      userId,
      sessionToken,
      refreshToken,
      expiresAt,
      ipAddress,
      userAgent,
      deviceType,
      isActive
    ]);

    return result.rows[0];
  }

  async getSessionByRefreshToken(refreshToken: string): Promise<SessionRecord | null> {
    const selectQuery = `
      SELECT id, user_id AS "userId", session_token AS "sessionToken", refresh_token AS "refreshToken", expires_at AS "expiresAt", ip_address AS "ipAddress", user_agent AS "userAgent", device_type AS "deviceType", is_active AS "isActive", created_at AS "createdAt"
      FROM user_sessions
      WHERE refresh_token = $1 AND is_active = true
    `;
    const result = await query(selectQuery, [refreshToken]);
    return result.rows[0] || null;
  }

  async getSessionByToken(sessionToken: string): Promise<SessionRecord | null> {
    const selectQuery = `
      SELECT id, user_id AS "userId", session_token AS "sessionToken", refresh_token AS "refreshToken", expires_at AS "expiresAt", ip_address AS "ipAddress", user_agent AS "userAgent", device_type AS "deviceType", is_active AS "isActive", created_at AS "createdAt"
      FROM user_sessions
      WHERE session_token = $1 AND is_active = true AND expires_at > NOW()
    `;
    const result = await query(selectQuery, [sessionToken]);
    return result.rows[0] || null;
  }

  async updateSession(
    sessionId: string,
    sessionToken: string,
    refreshToken: string | null,
    expiresAt: Date
  ): Promise<void> {
    const updateQuery = `
      UPDATE user_sessions
      SET session_token = $1,
          refresh_token = $2,
          expires_at = $3,
          is_active = true
      WHERE id = $4
    `;
    await query(updateQuery, [sessionToken, refreshToken, expiresAt, sessionId]);
  }

  async deleteSessionByToken(sessionToken: string): Promise<void> {
    const deleteQuery = `
      DELETE FROM user_sessions
      WHERE session_token = $1
    `;
    await query(deleteQuery, [sessionToken]);
  }
}

export const sessionService = new SessionService();
