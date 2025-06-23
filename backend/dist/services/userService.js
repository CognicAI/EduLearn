"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("@/config/db");
class UserService {
    async createUser(userData) {
        const { email, firstName, lastName, password, role } = userData;
        const existingUserResult = await (0, db_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUserResult.rows.length > 0) {
            throw new Error('User already exists with this email');
        }
        const saltRounds = 12;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        const insertQuery = `
      INSERT INTO users (email, first_name, last_name, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role, created_at
    `;
        const result = await (0, db_1.query)(insertQuery, [
            email,
            firstName,
            lastName,
            passwordHash,
            role || 'student'
        ]);
        const user = result.rows[0];
        return {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            createdAt: user.created_at.toISOString()
        };
    }
    async findUserByEmail(email) {
        const selectQuery = `
      SELECT id, email, first_name, last_name, password_hash, role, profile_image, created_at, updated_at, last_login
      FROM users 
      WHERE email = $1
    `;
        const result = await (0, db_1.query)(selectQuery, [email]);
        if (result.rows.length === 0) {
            return null;
        }
        const user = result.rows[0];
        return {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            passwordHash: user.password_hash,
            role: user.role,
            avatar: user.profile_image,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            lastLogin: user.last_login
        };
    }
    async findUserById(id) {
        const selectQuery = `
      SELECT id, email, first_name, last_name, role, profile_image, created_at, last_login
      FROM users 
      WHERE id = $1
    `;
        const result = await (0, db_1.query)(selectQuery, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const user = result.rows[0];
        return {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            avatar: user.profile_image,
            createdAt: user.created_at.toISOString(),
            lastLogin: user.last_login?.toISOString()
        };
    }
    async validatePassword(password, passwordHash) {
        return bcryptjs_1.default.compare(password, passwordHash);
    }
    async updateLastLogin(id) {
        await (0, db_1.query)('UPDATE users SET last_login = NOW() WHERE id = $1', [id]);
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
//# sourceMappingURL=userService.js.map