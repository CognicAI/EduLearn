import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';
import bcrypt from 'bcryptjs';
import { activityLogService } from '../services/activityLogService';

export class SettingsController {  // GET /api/user/profile
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const userRes = await query(
        `SELECT id, email, first_name, last_name, profile_image, timezone, language, last_login, login_count
         FROM users WHERE id = $1`,
        [userId]
      );
      const profileRes = await query(
        `SELECT id as profile_id, bio, website, linkedin, github, skills, interests, academic_background, experience_level,
                created_at, updated_at
         FROM user_profiles WHERE user_id = $1`,
        [userId]
      );
      
      if (!userRes.rows.length) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const user = userRes.rows[0];
      const profile = profileRes.rows[0] || {
        bio: '',
        website: '',
        linkedin: '',
        github: '',
        skills: [],
        interests: [],
        academic_background: [],
        experience_level: 'beginner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Map the data to match our frontend expected format
      const profileData = {
        id: profile.profile_id || userId,
        userId: userId,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: profile.bio,
        website: profile.website,
        linkedin: profile.linkedin,
        github: profile.github,
        skills: profile.skills || [],
        interests: profile.interests || [],
        academicBackground: profile.academic_background || [],
        experienceLevel: profile.experience_level,
        createdAt: profile.created_at || user.created_at,
        updatedAt: profile.updated_at || user.updated_at
      };
      
      return res.json({ success: true, data: profileData });
    } catch (err) {
      console.error('Error getting profile:', err);
      return res.status(500).json({ success: false, message: 'Failed to load profile' });
    }
  }
  // PUT /api/user/profile
  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { 
        firstName, lastName, email, timezone, language, 
        bio, website, linkedin, github, 
        skills, interests, academicBackground, experienceLevel 
      } = req.body;

      // Log the incoming data for debugging
      console.log('Profile update request:', req.body);
      
      // First update user table
      if (email || firstName || lastName || timezone || language) {
        await query(
          `UPDATE users SET 
           first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           timezone = COALESCE($4, timezone),
           language = COALESCE($5, language),
           updated_at = NOW()
           WHERE id = $6`,
          [firstName, lastName, email, timezone, language, userId]
        );
      }
      
      // Then update the profile table
      // Convert skills, interests, and academicBackground from string to JSON if needed
      const processedSkills = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
      const processedInterests = typeof interests === 'string' ? interests.split(',').map(s => s.trim()) : interests;
      const processedAcademicBackground = typeof academicBackground === 'string' ? 
        academicBackground.split(',').map(s => s.trim()) : academicBackground;

      // Check if a profile exists for this user
      const profileCheck = await query(`SELECT id FROM user_profiles WHERE user_id = $1`, [userId]);
      
      if (profileCheck.rows.length === 0) {
        // Create new profile if it doesn't exist
        await query(
          `INSERT INTO user_profiles(
             user_id, bio, website, linkedin, github, skills, interests, 
             academic_background, experience_level, created_at, updated_at
           ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [
            userId, bio, website, linkedin, github, 
            processedSkills ? JSON.stringify(processedSkills) : null,
            processedInterests ? JSON.stringify(processedInterests) : null,
            processedAcademicBackground ? JSON.stringify(processedAcademicBackground) : null,
            experienceLevel
          ]
        );
      } else {
        // Update existing profile
        await query(
          `UPDATE user_profiles SET
           bio = COALESCE($1, bio),
           website = COALESCE($2, website),
           linkedin = COALESCE($3, linkedin),
           github = COALESCE($4, github),
           skills = COALESCE($5, skills),
           interests = COALESCE($6, interests),
           academic_background = COALESCE($7, academic_background),
           experience_level = COALESCE($8, experience_level),
           updated_at = NOW()
           WHERE user_id = $9`,
          [
            bio, website, linkedin, github,
            processedSkills ? JSON.stringify(processedSkills) : null,
            processedInterests ? JSON.stringify(processedInterests) : null,
            processedAcademicBackground ? JSON.stringify(processedAcademicBackground) : null,
            experienceLevel,
            userId
          ]
        );
      }
      
      // Log profile update activity
      await activityLogService.logActivity({
        userId,
        activityType: 'profile_update',
        description: 'User updated profile',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || undefined,
        metadata: req.body
      });
      
      return res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
      console.error('Error updating profile:', err);
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
      // Try updating existing settings
      const updateResult = await query(
        `UPDATE user_settings SET
           notification_email = $2,
           notification_push = $3,
           notification_sms = $4,
           theme = $5,
           dashboard_layout = $6,
           privacy_settings = $7,
           language_preference = $8,
           timezone_preference = $9,
           updated_at = NOW()
         WHERE user_id = $1`,
        [userId, notificationEmail, notificationPush, notificationSms, theme, dashboardLayout, privacySettings, languagePreference, timezonePreference]
      );
      if (updateResult.rowCount === 0) {
        // Insert new settings if none exist
        await query(
          `INSERT INTO user_settings
           (user_id, notification_email, notification_push, notification_sms, theme, dashboard_layout, privacy_settings, language_preference, timezone_preference, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())`,
          [userId, notificationEmail, notificationPush, notificationSms, theme, dashboardLayout, privacySettings, languagePreference, timezonePreference]
        );
      }
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

  // PUT /api/user/password
  async updatePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      // Fetch current password hash
      const result = await query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );
      if (!result.rows.length) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const { password_hash } = result.rows[0];

      // Validate current password
      const isValid = await bcrypt.compare(currentPassword, password_hash);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      // Hash new password and update
      const saltRounds = 12;
      const newHash = await bcrypt.hash(newPassword, saltRounds);
      await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newHash, userId]
      );

      // Log password change activity
      await activityLogService.logActivity({
        userId,
        activityType: 'profile_update',
        description: 'User changed password',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || undefined
      });

      return res.json({ success: true, message: 'Password updated' });
    } catch (err) {
      console.error('Error updating password:', err);
      return res.status(500).json({ success: false, message: 'Failed to update password' });
    }
  }
}

export const settingsController = new SettingsController();
