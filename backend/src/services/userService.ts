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

  async findUserByEmail(email: string): Promise<(User & { isActive: boolean; loginCount: number }) | null> {
    const selectQuery = `
      SELECT id, email, first_name, last_name, password_hash, role, profile_image, created_at, updated_at, last_login, is_active, COALESCE(login_count,0) AS login_count
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
      lastLogin: user.last_login,
      isActive: user.is_active,
      loginCount: parseInt(user.login_count, 10)
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

  // Increment user's login count
  async incrementLoginCount(id: string): Promise<void> {
    await query('UPDATE users SET login_count = COALESCE(login_count,0) + 1 WHERE id = $1', [id]);
  }

  /**
   * Updates user's learning style based on VisionOva ML classification
   * @param id - User ID
   * @param learningStyle - Learning style classification (ADHD, Dyslexia, Anxiety, Autism Spectrum, General)
   */
  async updateLearningStyle(
    id: string,
    learningStyle: 'ADHD' | 'Dyslexia' | 'Anxiety' | 'Autism Spectrum' | 'General'
  ): Promise<void> {
    const updateQuery = `
      UPDATE users 
      SET learning_style = $1, updated_at = NOW() 
      WHERE id = $2
    `;

    await query(updateQuery, [learningStyle, id]);
    console.log(`[UserService] Updated learning style for user ${id}: ${learningStyle}`);
  }
}

export const userService = new UserService();
