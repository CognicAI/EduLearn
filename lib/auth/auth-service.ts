import { User, AuthResponse, LoginCredentials, RegisterCredentials, AuthTokens } from '@/lib/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
        this.currentUser = JSON.parse(userData);
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Request failed');
    }
    return json.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = await this.request<{ user: User; tokens: AuthTokens }>(
      '/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }
    );

    this.setTokens(data.tokens);
    this.currentUser = data.user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }

    return { user: data.user, tokens: data.tokens };
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const data = await this.request<{ user: User; tokens: AuthTokens }>(
      '/auth/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }
    );

    this.setTokens(data.tokens);
    this.currentUser = data.user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }

    return { user: data.user, tokens: data.tokens };
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.accessToken) return null;
    const data = await this.request<User>('/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    this.currentUser = data;
    return data;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;
    const data = await this.request<{ tokens: AuthTokens }>(
      '/auth/refresh',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      }
    );

    this.setTokens(data.tokens);
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

export const authService = new AuthService();