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

  private async request<T>(endpoint: string, options: RequestInit, retryOnAuth = true): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, options);
    
    // Handle 403 Forbidden - try to refresh token once
    if (res.status === 403 && retryOnAuth && this.refreshToken && endpoint !== '/auth/refresh') {
      try {
        await this.refreshAccessToken();
        // Retry the request with new token
        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${this.accessToken}`,
          },
        };
        return this.request<T>(endpoint, newOptions, false); // Don't retry again
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        this.clearTokens();
        throw new Error('Session expired. Please log in again.');
      }
    }

    const json = await res.json();
    if (!res.ok || !json.success) {
      if (res.status === 401 || res.status === 403) {
        this.clearTokens();
        throw new Error('Invalid or expired token');
      }
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
    
    try {
      const data = await this.request<User>('/auth/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      this.currentUser = data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(data));
      }
      return data;
    } catch (error) {
      // If getting current user fails, clear local auth state
      this.clearTokens();
      return null;
    }
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

  async logout(): Promise<void> {
    // Notify backend to log out and record activity
    if (this.accessToken) {
      try {
        await this.request<{ message: string }>(
          '/auth/logout',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.accessToken}`
            }
          },
          false // Don't retry on auth error during logout
        );
      } catch (err) {
        console.error('Error during backend logout:', err);
      }
    }
    // Clear local auth data
    this.clearTokens();
  }

  async checkBackendConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch (error) {
      console.error('Backend connection check failed:', error);
      return false;
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

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.currentUser;
  }
}

export const authService = new AuthService();