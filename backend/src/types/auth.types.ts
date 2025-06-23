export type UserRole = 'student' | 'teacher' | 'admin';

// Add other types from the original lib/types/auth.ts if they are directly used by the backend controllers
// For now, only UserRole is explicitly mentioned in the error.

export interface BackendUser {
  id: string;
  email: string;
  first_name: string; // Note: snake_case from database
  last_name: string;  // Note: snake_case from database
  role: UserRole;
  created_at: string; // Note: snake_case from database
  updated_at?: string; // Note: snake_case from database
  password_hash?: string; // Internal backend use
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<BackendUser, 'password_hash'>;
  tokens: AuthTokens;
  message: string;
}
