import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/config/database';
import { User, CreateUserData, UserResponse } from '@/types/user';

export class UserService {
  async createUser(userData: CreateUserData): Promise<UserResponse> {
    const { email, firstName, lastName, password, role } = userData;
    
    // Check if user already exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    const query = `
      INSERT INTO users (id, email, first_name, last_name, password_hash, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, email, first_name, last_name, role, created_at
    `;

    const result = await pool.query(query, [
      userId,
      email,
      firstName,
      lastName,
      passwordHash,
      role
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
    const query = `
      SELECT id, email, first_name, last_name, password_hash, role, avatar, created_at, updated_at, last_login
      FROM users 
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    
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
      avatar: user.avatar,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLogin: user.last_login
    };
  }

  async findUserById(id: string): Promise<UserResponse | null> {
    const query = `
      SELECT id, email, first_name, last_name, role, avatar, created_at, last_login
      FROM users 
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    
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
      avatar: user.avatar,
      createdAt: user.created_at.toISOString(),
      lastLogin: user.last_login?.toISOString()
    };
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async updateLastLogin(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login = NOW(), updated_at = NOW()
      WHERE id = $1
    `;

    await pool.query(query, [userId]);
  }
}

export const userService = new UserService();