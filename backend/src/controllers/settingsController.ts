import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
import { query } from '@/config/db';

export class SettingsController {
  // GET /api/user/profile
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const userRes = await query(
        `SELECT id, email, first_name, last_name, profile_image, timezone, language, last_login, login_count
         FROM users WHERE id = $1`,
        [userId]
      );
      const profileRes = await query(
        `SELECT bio, website, linkedin, github, skills, interests, academic_background, experience_level
         FROM user_profiles WHERE user_id = $1`,
        [userId]
      );
      const user = userRes.rows[0];
      const profile = profileRes.rows[0] || {};
      return res.json({ success: true, data: { ...user, ...profile } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Failed to load profile' });
    }
  }

  // PUT /api/user/profile
  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { email, firstName, lastName, profileImage, timezone, language, bio, website, linkedin, github, skills, interests, academicBackground, experienceLevel } = req.body;
      await query(
        `UPDATE users SET email=$1, first_name=$2, last_name=$3, profile_image=$4, timezone=$5, language=$6, updated_at=NOW() WHERE id=$7`,
        [email, firstName, lastName, profileImage, timezone, language, userId]
      );
      await query(
        `INSERT INTO user_profiles(user_id, bio, website, linkedin, github, skills, interests, academic_background, experience_level, created_at, updated_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
         ON CONFLICT (user_id) DO UPDATE SET bio=EXCLUDED.bio, website=EXCLUDED.website, linkedin=EXCLUDED.linkedin, github=EXCLUDED.github, skills=EXCLUDED.skills, interests=EXCLUDED.interests, academic_background=EXCLUDED.academic_background, experience_level=EXCLUDED.experience_level, updated_at=NOW()`,
        [userId, bio, website, linkedin, github, skills, interests, academicBackground, experienceLevel]
      );
      return res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  }

  // GET /api/user/settings
  async getSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await query(
        `SELECT notification_email, notification_push, notification_sms, theme, dashboard_layout, privacy_settings, language_preference, timezone_preference
         FROM user_settings WHERE user_id=$1`,
        [userId]
      );
      const settings = result.rows[0] || {};
      return res.json({ success: true, data: settings });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Failed to load settings' });
    }
  }

  // PUT /api/user/settings
  async updateSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { notificationEmail, notificationPush, notificationSms, theme, dashboardLayout, privacySettings, languagePreference, timezonePreference } = req.body;
      await query(
        `INSERT INTO user_settings(user_id, notification_email, notification_push, notification_sms, theme, dashboard_layout, privacy_settings, language_preference, timezone_preference, created_at, updated_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
         ON CONFLICT (user_id) DO UPDATE SET notification_email=EXCLUDED.notification_email, notification_push=EXCLUDED.notification_push, notification_sms=EXCLUDED.notification_sms, theme=EXCLUDED.theme, dashboard_layout=EXCLUDED.dashboard_layout, privacy_settings=EXCLUDED.privacy_settings, language_preference=EXCLUDED.language_preference, timezone_preference=EXCLUDED.timezone_preference, updated_at=NOW()`,
        [userId, notificationEmail, notificationPush, notificationSms, theme, dashboardLayout, privacySettings, languagePreference, timezonePreference]
      );
      return res.json({ success: true, message: 'Settings updated' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
  }

  // GET /api/user/sessions
  async getSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await query(
        `SELECT id, session_token, expires_at, ip_address, user_agent, device_type, is_active, created_at
         FROM user_sessions WHERE user_id=$1 ORDER BY created_at DESC`,
        [userId]
      );
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Failed to load sessions' });
    }
  }

  // GET /api/user/activity
  async getActivity(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await query(
        `SELECT activity_type, description, ip_address, user_agent, metadata, created_at
         FROM user_activity_logs WHERE user_id=$1 ORDER BY created_at DESC`,
        [userId]
      );
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Failed to load activity logs' });
    }
  }
}

export const settingsController = new SettingsController();
