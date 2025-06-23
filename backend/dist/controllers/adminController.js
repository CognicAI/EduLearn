"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const db_1 = require("@/config/db");
class AdminController {
    async getUsers(req, res) {
        try {
            const result = await (0, db_1.query)(`
        SELECT id, email, first_name, last_name, role, profile_image, last_login, is_active, created_at
        FROM users
        ORDER BY created_at DESC
      `);
            const users = result.rows.map((u) => ({
                id: u.id,
                email: u.email,
                firstName: u.first_name,
                lastName: u.last_name,
                role: u.role,
                status: u.is_active ? 'active' : 'inactive',
                avatar: u.profile_image,
                createdAt: u.created_at?.toISOString?.(),
                lastLogin: u.last_login?.toISOString?.(),
                coursesEnrolled: 0,
                coursesCompleted: 0,
                coursesCreated: 0,
                studentsTotal: 0,
                systemAccess: 'Full'
            }));
            return res.json({ success: true, data: users });
        }
        catch (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
//# sourceMappingURL=adminController.js.map