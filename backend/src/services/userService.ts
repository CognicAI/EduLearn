import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { User, CreateUserData, UserResponse } from '../types/user';

export class UserService {
  async createUser(userData: CreateUserData): Promise<UserResponse> {
    const { email, firstName, lastName, password, role } = userData;

    const existingUserResult = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUserResult.rows.length > 0) {
      throw new Error('User already exists with this email');
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insertQuery = `
      INSERT INTO users (email, first_name, last_name, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role, created_at
    `;

    const result = await query(insertQuery, [
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

  async findUserByEmail(email: string): Promise<User | null> {
    const selectQuery = `
      SELECT id, email, first_name, last_name, password_hash, role, profile_image, created_at, updated_at, last_login
      FROM users 
      WHERE email = $1
    `;

    const result = await query(selectQuery, [email]);
    
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

  async findUserById(id: string): Promise<UserResponse | null> {
    const selectQuery = `
      SELECT id, email, first_name, last_name, role, profile_image, created_at, last_login
      FROM users 
      WHERE id = $1
    `;

    const result = await query(selectQuery, [id]);
    
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

  async validatePassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  async updateLastLogin(id: string): Promise<void> {
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [id]);
  }
}

export const userService = new UserService();
