"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsController = exports.SettingsController = void 0;
const db_1 = require("@/config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class SettingsController {
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const userRes = await (0, db_1.query)(`SELECT id, email, first_name, last_name, profile_image, timezone, language, last_login, login_count
         FROM users WHERE id = $1`, [userId]);
            const profileRes = await (0, db_1.query)(`SELECT id as profile_id, bio, website, linkedin, github, skills, interests, academic_background, experience_level,
                created_at, updated_at
         FROM user_profiles WHERE user_id = $1`, [userId]);
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
        }
        catch (err) {
            console.error('Error getting profile:', err);
            return res.status(500).json({ success: false, message: 'Failed to load profile' });
        }
    }
    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const { firstName, lastName, email, timezone, language, bio, website, linkedin, github, skills, interests, academicBackground, experienceLevel } = req.body;
            console.log('Profile update request:', req.body);
            if (email || firstName || lastName || timezone || language) {
                await (0, db_1.query)(`UPDATE users SET 
           first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           timezone = COALESCE($4, timezone),
           language = COALESCE($5, language),
           updated_at = NOW()
           WHERE id = $6`, [firstName, lastName, email, timezone, language, userId]);
            }
            const processedSkills = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
            const processedInterests = typeof interests === 'string' ? interests.split(',').map(s => s.trim()) : interests;
            const processedAcademicBackground = typeof academicBackground === 'string' ?
                academicBackground.split(',').map(s => s.trim()) : academicBackground;
            const profileCheck = await (0, db_1.query)(`SELECT id FROM user_profiles WHERE user_id = $1`, [userId]);
            if (profileCheck.rows.length === 0) {
                await (0, db_1.query)(`INSERT INTO user_profiles(
             user_id, bio, website, linkedin, github, skills, interests, 
             academic_background, experience_level, created_at, updated_at
           ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`, [
                    userId, bio, website, linkedin, github,
                    processedSkills ? JSON.stringify(processedSkills) : null,
                    processedInterests ? JSON.stringify(processedInterests) : null,
                    processedAcademicBackground ? JSON.stringify(processedAcademicBackground) : null,
                    experienceLevel
                ]);
            }
            else {
                await (0, db_1.query)(`UPDATE user_profiles SET
           bio = COALESCE($1, bio),
           website = COALESCE($2, website),
           linkedin = COALESCE($3, linkedin),
           github = COALESCE($4, github),
           skills = COALESCE($5, skills),
           interests = COALESCE($6, interests),
           academic_background = COALESCE($7, academic_background),
           experience_level = COALESCE($8, experience_level),
           updated_at = NOW()
           WHERE user_id = $9`, [
                    bio, website, linkedin, github,
                    processedSkills ? JSON.stringify(processedSkills) : null,
                    processedInterests ? JSON.stringify(processedInterests) : null,
                    processedAcademicBackground ? JSON.stringify(processedAcademicBackground) : null,
                    experienceLevel,
                    userId
                ]);
            }
            return res.json({ success: true, message: 'Profile updated' });
        }
        catch (err) {
            console.error('Error updating profile:', err);
            return res.status(500).json({ success: false, message: 'Failed to update profile' });
        }
    }
    async getSettings(req, res) {
        try {
            const userId = req.user.userId;
            const result = await (0, db_1.query)(`SELECT notification_email, notification_push, notification_sms, theme, dashboard_layout, privacy_settings, language_preference, timezone_preference
         FROM user_settings WHERE user_id=$1`, [userId]);
            const settings = result.rows[0] || {};
            return res.json({ success: true, data: settings });
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Failed to load settings' });
        }
    }
    async updateSettings(req, res) {
        try {
            const userId = req.user.userId;
            const { notificationEmail, notificationPush, notificationSms, theme, dashboardLayout, privacySettings, languagePreference, timezonePreference } = req.body;
            await (0, db_1.query)(`INSERT INTO user_settings(user_id, notification_email, notification_push, notification_sms, theme, dashboard_layout, privacy_settings, language_preference, timezone_preference, created_at, updated_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
         ON CONFLICT (user_id) DO UPDATE SET notification_email=EXCLUDED.notification_email, notification_push=EXCLUDED.notification_push, notification_sms=EXCLUDED.notification_sms, theme=EXCLUDED.theme, dashboard_layout=EXCLUDED.dashboard_layout, privacy_settings=EXCLUDED.privacy_settings, language_preference=EXCLUDED.language_preference, timezone_preference=EXCLUDED.timezone_preference, updated_at=NOW()`, [userId, notificationEmail, notificationPush, notificationSms, theme, dashboardLayout, privacySettings, languagePreference, timezonePreference]);
            return res.json({ success: true, message: 'Settings updated' });
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Failed to update settings' });
        }
    }
    async getSessions(req, res) {
        try {
            const userId = req.user.userId;
            const result = await (0, db_1.query)(`SELECT id, session_token, expires_at, ip_address, user_agent, device_type, is_active, created_at
         FROM user_sessions WHERE user_id=$1 ORDER BY created_at DESC`, [userId]);
            return res.json({ success: true, data: result.rows });
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Failed to load sessions' });
        }
    }
    async getActivity(req, res) {
        try {
            const userId = req.user.userId;
            const result = await (0, db_1.query)(`SELECT activity_type, description, ip_address, user_agent, metadata, created_at
         FROM user_activity_logs WHERE user_id=$1 ORDER BY created_at DESC`, [userId]);
            return res.json({ success: true, data: result.rows });
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Failed to load activity logs' });
        }
    }
    async updatePassword(req, res) {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;
            const result = await (0, db_1.query)('SELECT password_hash FROM users WHERE id = $1', [userId]);
            if (!result.rows.length) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            const { password_hash } = result.rows[0];
            const isValid = await bcryptjs_1.default.compare(currentPassword, password_hash);
            if (!isValid) {
                return res.status(400).json({ success: false, message: 'Current password is incorrect' });
            }
            const saltRounds = 12;
            const newHash = await bcryptjs_1.default.hash(newPassword, saltRounds);
            await (0, db_1.query)('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);
            return res.json({ success: true, message: 'Password updated' });
        }
        catch (err) {
            console.error('Error updating password:', err);
            return res.status(500).json({ success: false, message: 'Failed to update password' });
        }
    }
}
exports.SettingsController = SettingsController;
exports.settingsController = new SettingsController();
//# sourceMappingURL=settingsController.js.map