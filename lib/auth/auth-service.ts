import { User, AuthResponse, LoginCredentials, RegisterCredentials, AuthTokens } from '@/lib/types/auth';

// Mock user database
const mockUsers = {
  'student@demo.com': {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'student@demo.com',
    firstName: 'John',
    lastName: 'Student',
    role: 'student' as const,
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: undefined,
    password: 'password123'
  },
  'teacher@demo.com': {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'teacher@demo.com',
    firstName: 'Jane',
    lastName: 'Teacher',
    role: 'teacher' as const,
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: undefined,
    password: 'password123'
  },
  'admin@demo.com': {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'admin@demo.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const,
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: undefined,
    password: 'password123'
  }
};

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
        }
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUser = mockUsers[credentials.email as keyof typeof mockUsers];
    
    if (!mockUser || mockUser.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    // Create user object without password
    const { password, ...userWithoutPassword } = mockUser;
    const user: User = {
      ...userWithoutPassword,
      lastLogin: new Date().toISOString()
    };

    // Generate mock tokens
    const tokens: AuthTokens = {
      accessToken: `mock-access-token-${user.id}`,
      refreshToken: `mock-refresh-token-${user.id}`
    };

    this.setTokens(tokens);
    this.currentUser = user;

    // Store user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    return { user, tokens };
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    if (mockUsers[credentials.email as keyof typeof mockUsers]) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const user: User = {
      id: `mock-user-${Date.now()}`,
      email: credentials.email,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      role: credentials.role,
      avatar: undefined,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Generate mock tokens
    const tokens: AuthTokens = {
      accessToken: `mock-access-token-${user.id}`,
      refreshToken: `mock-refresh-token-${user.id}`
    };

    this.setTokens(tokens);
    this.currentUser = user;

    // Store user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    return { user, tokens };
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.accessToken) {
      return null;
    }

    // Return stored user data
    return this.currentUser;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken || !this.currentUser) {
      return false;
    }

    // Simulate token refresh
    const tokens: AuthTokens = {
      accessToken: `mock-access-token-refreshed-${this.currentUser.id}`,
      refreshToken: this.refreshToken
    };

    this.setTokens(tokens);
    return true;
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.currentUser = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
    }
  }

  private setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Demo credentials for testing
export function getDemoCredentials() {
  return {
    student: { email: 'student@demo.com', password: 'password123' },
    teacher: { email: 'teacher@demo.com', password: 'password123' },
    admin: { email: 'admin@demo.com', password: 'password123' }
  };
}

export const authService = new AuthService();