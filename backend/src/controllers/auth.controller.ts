import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../services/database.service';
import { UserRole, AuthResponse, BackendUser } from '../types/auth.types'; // Removed .ts extension

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';
const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    try {
        // Check if user already exists
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert new user
        const newUserResult = await db.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, created_at',
            [email, hashedPassword, firstName, lastName, role]
        );
        
        const dbUser = newUserResult.rows[0];

        // Create student/teacher entry if applicable
        if (role === 'student') {
            const studentId = `student-${Date.now()}`;
            await db.query(
                'INSERT INTO students (user_id, student_id, enrollment_date) VALUES ($1, $2, $3)',
                [dbUser.id, studentId, new Date()]
            );
        } else if (role === 'teacher') {
            const employeeId = `teacher-${Date.now()}`;
            await db.query(
                'INSERT INTO teachers (user_id, employee_id, hire_date) VALUES ($1, $2, $3)',
                [dbUser.id, employeeId, new Date()]
            );
        }

        // Generate JWT token
        const token = jwt.sign({ userId: dbUser.id, role: dbUser.role }, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: dbUser.id }, JWT_SECRET, { expiresIn: '7d' }); // Longer-lived refresh token

        const responseUser: Omit<BackendUser, 'password_hash'> = {
            id: dbUser.id,
            email: dbUser.email,
            first_name: dbUser.first_name, // Corrected: snake_case
            last_name: dbUser.last_name,   // Corrected: snake_case
            role: dbUser.role,
            created_at: dbUser.created_at, // Corrected: snake_case
        };

        const authResponse: AuthResponse = {
            message: 'User registered successfully',
            user: responseUser,
            tokens: {
                accessToken: token,
                refreshToken: refreshToken,
            }
        };
        res.status(201).json(authResponse);

    } catch (error) {
        console.error('Registration error:', error);
        const err = error as Error;
        res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        // Update last_login (optional, can be a separate middleware/trigger)
        // For simplicity, we'll use updated_at from the user record after a successful login update
        const updateResult = await db.query('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING updated_at', [user.id]);
        const lastLogin = updateResult.rows[0]?.updated_at || user.updated_at; 

        const responseUser: Omit<BackendUser, 'password_hash'> = {
            id: user.id,
            email: user.email,
            first_name: user.first_name, // Corrected: snake_case
            last_name: user.last_name,   // Corrected: snake_case
            role: user.role,
            created_at: user.created_at, // Corrected: snake_case
            updated_at: lastLogin,       // Corrected: snake_case
        };

        const authResponse: AuthResponse = {
            message: 'Login successful',
            user: responseUser,
            tokens: {
                accessToken: token,
                refreshToken: refreshToken,
            }
        };
        res.status(200).json(authResponse);

    } catch (error) {
        console.error('Login error:', error);
        const err = error as Error;
        res.status(500).json({ message: 'Server error during login', error: err.message });
    }
};

export const getMyProfile = async (req: Request, res: Response) => {
    // Access userId from the request object (set by authMiddleware)
    const userId = (req as any).user?.userId; 

    if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const result = await db.query('SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = result.rows[0];
        // Ensure the response matches the expected structure for getMyProfile, which might be slightly different
        // from AuthResponse.user. For now, aligning with BackendUser fields.
        const profileResponse: Omit<BackendUser, 'password_hash'> = {
            id: user.id,
            email: user.email,
            first_name: user.first_name, // Corrected: snake_case
            last_name: user.last_name,   // Corrected: snake_case
            role: user.role,
            created_at: user.created_at, // Corrected: snake_case
            updated_at: user.updated_at, // Corrected: snake_case (representing lastLogin/last activity)
        };
        res.status(200).json(profileResponse);
    } catch (error) {
        console.error('Get profile error:', error);
        const err = error as Error;
        res.status(500).json({ message: 'Server error fetching profile', error: err.message });
    }
};

// Basic token refresh endpoint (can be more sophisticated)
export const refreshToken = async (req: Request, res: Response) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, iat: number, exp: number };
        const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '1h' });
        // Optionally, issue a new refresh token with a sliding window expiration
        // const newRefreshToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            accessToken: newAccessToken,
            // refreshToken: newRefreshToken // if re-issuing
        });
    } catch (error) {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }
};
