export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  passwordHash: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}
