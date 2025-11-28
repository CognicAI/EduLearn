import { User, AuthResponse, LoginCredentials, RegisterCredentials, AuthTokens } from '@/lib/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

  public async request<T>(endpoint: string, options: RequestInit, retryOnAuth = true): Promise<T> {
    // Add authorization header if token exists and not already present
    const headers = new Headers(options.headers);
    if (this.accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - try to refresh token once
    if (res.status === 401 && retryOnAuth && this.refreshToken && endpoint !== '/auth/refresh') {
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

    // Handle 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    let json: { success?: boolean; message?: string; data?: any };
    try {
      const text = await res.text();
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      json = {};
    }

    if (!res.ok || json.success === false) {
      if (res.status === 401) {
        this.clearTokens();
        throw new Error('Invalid or expired token');
      }
      throw new Error(json.message || `Request failed with status ${res.status}`);
    }

    return json.data !== undefined ? json.data : json;
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
      // Backward‑compatible key used by older code paths
      localStorage.setItem('token', tokens.accessToken);
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
      localStorage.removeItem('token'); // Remove legacy token
    }
  }

  getAccessToken(): string | null {
    // Prefer the in‑memory token, but fall back to localStorage (including legacy key)
    if (this.accessToken) return this.accessToken;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('accessToken') || localStorage.getItem('token');
      this.accessToken = stored || null;
    }
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    if (this.accessToken && this.currentUser) return true;

    // Check localStorage if memory is empty (hydration fallback)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('currentUser');
      if (token && user) {
        // Rehydrate state
        this.accessToken = token;
        this.currentUser = JSON.parse(user);
        return true;
      }
    }
    return false;
  }
}

export const authService = new AuthService();