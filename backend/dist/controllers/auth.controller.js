"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.getMyProfile = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_service_1 = __importDefault(require("../services/database.service"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';
const SALT_ROUNDS = 10;
const register = async (req, res) => {
    const { email, password, firstName, lastName, role } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (!['student', 'teacher', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
    }
    try {
        // Check if user already exists
        const existingUser = await database_service_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Insert new user
        const newUserResult = await database_service_1.default.query('INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, created_at, updated_at', [email, hashedPassword, firstName, lastName, role]);
        const newUser = newUserResult.rows[0];
        // Create student/teacher entry if applicable
        if (role === 'student') {
            const studentId = `student-${Date.now()}`;
            await database_service_1.default.query('INSERT INTO students (user_id, student_id, enrollment_date) VALUES ($1, $2, $3)', [newUser.id, studentId, new Date()]);
        }
        else if (role === 'teacher') {
            const employeeId = `teacher-${Date.now()}`;
            await database_service_1.default.query('INSERT INTO teachers (user_id, employee_id, hire_date) VALUES ($1, $2, $3)', [newUser.id, employeeId, new Date()]);
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' }); // Longer-lived refresh token
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.first_name,
                lastName: newUser.last_name,
                role: newUser.role,
                createdAt: newUser.created_at,
            },
            tokens: {
                accessToken: token,
                refreshToken: refreshToken,
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        const err = error;
        res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const result = await database_service_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = result.rows[0];
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        // Update last_login (optional, can be a separate middleware/trigger)
        await database_service_1.default.query('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                createdAt: user.created_at,
                lastLogin: user.updated_at, // or a dedicated last_login column
            },
            tokens: {
                accessToken: token,
                refreshToken: refreshToken,
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        const err = error;
        res.status(500).json({ message: 'Server error during login', error: err.message });
    }
};
exports.login = login;
const getMyProfile = async (req, res) => {
    var _a;
    // Access userId from the request object (set by authMiddleware)
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    try {
        const result = await database_service_1.default.query('SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = result.rows[0];
        res.status(200).json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            createdAt: user.created_at,
            lastLogin: user.updated_at, // or a dedicated last_login column
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        const err = error;
        res.status(500).json({ message: 'Server error fetching profile', error: err.message });
    }
};
exports.getMyProfile = getMyProfile;
// Basic token refresh endpoint (can be more sophisticated)
const refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '1h' });
        // Optionally, issue a new refresh token with a sliding window expiration
        // const newRefreshToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            accessToken: newAccessToken,
            // refreshToken: newRefreshToken // if re-issuing
        });
    }
    catch (error) {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }
};
exports.refreshToken = refreshToken;
