export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  passwordHash: string;
  learningStyle?: 'ADHD' | 'Dyslexia' | 'Anxiety' | 'Autism Spectrum' | 'General';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive?: boolean;
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  learningStyle?: 'ADHD' | 'Dyslexia' | 'Anxiety' | 'Autism Spectrum' | 'General';
  assessmentAnswers?: number[]; // 15 answers (0-3) for VisionOva ML classification
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
  learningStyle?: 'ADHD' | 'Dyslexia' | 'Anxiety' | 'Autism Spectrum' | 'General';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}
