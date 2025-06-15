import { User, AuthResponse, LoginCredentials, RegisterCredentials, AuthTokens } from '@/lib/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const DEBUG_AUTH_SERVICE = true; // Set to false to disable auth-service logs

// Helper type for backend user structure (snake_case)
interface BackendUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
  updated_at?: string;
}

// Helper function to map backend user to frontend user
const mapBackendUserToFrontendUser = (backendUser: BackendUser): User => {
  if (DEBUG_AUTH_SERVICE) console.log('[AuthService] mapBackendUserToFrontendUser - Input:', backendUser);
  const frontendUser: User = {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.first_name,
    lastName: backendUser.last_name,
    role: backendUser.role,
    createdAt: backendUser.created_at,
    updatedAt: backendUser.updated_at,
  };
  if (DEBUG_AUTH_SERVICE) console.log('[AuthService] mapBackendUserToFrontendUser - Output:', frontendUser);
  return frontendUser;
};

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] Constructor called');
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      const userData = localStorage.getItem('currentUser');
      if (DEBUG_AUTH_SERVICE) {
        console.log('[AuthService] Initial accessToken:', this.accessToken ? 'Loaded' : 'Empty');
        console.log('[AuthService] Initial refreshToken:', this.refreshToken ? 'Loaded' : 'Empty');
        console.log('[AuthService] Initial currentUser data from localStorage:', userData ? 'Exists' : 'Empty');
      }
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
          if (DEBUG_AUTH_SERVICE) console.log('[AuthService] Parsed currentUser from localStorage:', this.currentUser);
        } catch (error) {
          console.error('[AuthService] Failed to parse stored user data:', error);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          if (DEBUG_AUTH_SERVICE) console.log('[AuthService] Cleared corrupted auth data from localStorage');
        }
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] login called with:', credentials.email);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      if (DEBUG_AUTH_SERVICE) console.log(`[AuthService] POST ${API_BASE_URL}/auth/login - Status: ${response.status}`);

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 'Login failed';
        if (DEBUG_AUTH_SERVICE) console.error('[AuthService] Login API error:', errorMessage, 'Data:', data);
        throw new Error(errorMessage);
      }

      if (DEBUG_AUTH_SERVICE) console.log('[AuthService] Login API success. User data from backend:', data.user, 'Tokens:', data.tokens ? 'Received' : 'Not Received');
      const { user: backendUser, tokens } = data;

      const mappedUser = mapBackendUserToFrontendUser(backendUser);
      if (DEBUG_AUTH_SERVICE) console.log('[AuthService] Login - Mapped user:', mappedUser);

      this.setTokens(tokens);
      this.currentUser = mappedUser;
      this.storeCurrentUser(mappedUser);

      return { user: mappedUser, tokens, message: data.message };
    } catch (error) {
      if (DEBUG_AUTH_SERVICE) console.error('[AuthService] login - Exception:', error);
      throw error; // Re-throw the error to be caught by the caller
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] register called with:', credentials.email, 'Role:', credentials.role);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      if (DEBUG_AUTH_SERVICE) console.log(`[AuthService] POST ${API_BASE_URL}/auth/register - Status: ${response.status}`);
      
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 'Registration failed';
        if (DEBUG_AUTH_SERVICE) console.error('[AuthService] Register API error:', errorMessage, 'Data:', data);
        throw new Error(errorMessage);
      }
      
      if (DEBUG_AUTH_SERVICE) console.log('[AuthService] Register API success. User data from backend:', data.user, 'Tokens:', data.tokens ? 'Received' : 'Not Received');
      const { user: backendUser, tokens } = data;

      const mappedUser = mapBackendUserToFrontendUser(backendUser);
      if (DEBUG_AUTH_SERVICE) console.log('[AuthService] Register - Mapped user:', mappedUser);

      this.setTokens(tokens);
      this.currentUser = mappedUser;
      this.storeCurrentUser(mappedUser);

      return { user: mappedUser, tokens, message: data.message };
    } catch (error) {
      if (DEBUG_AUTH_SERVICE) console.error('[AuthService] register - Exception:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getCurrentUser called. Current accessToken:', this.accessToken ? 'Exists' : 'Empty');
    if (!this.accessToken) {
      if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getCurrentUser - No access token, returning null.');
      return null;
    }
    try {
      // Attempt to use existing currentUser if available and not forced to refresh
      // For a more robust check, always fetch or verify token with backend here.
      // This implementation relies on getUserProfile for actual fetching if needed.
      if (this.currentUser) {
         if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getCurrentUser - Returning cached currentUser:', this.currentUser);
         // Optionally add token expiration check here before returning cached user
         // For now, we assume if token exists, cached user might be valid, getUserProfile will verify.
      }
      
      // The AuthContext will typically call getUserProfile if it needs to confirm with the backend.
      // This method can be simplified or enhanced based on strategy for fetching vs. caching user.
      // For now, it primarily checks token and relies on getUserProfile for actual fetch.
      // Let's ensure it tries to fetch if currentUser is null but token exists.
      if (!this.currentUser && this.accessToken) {
        if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getCurrentUser - No cached user, but token exists. Attempting to fetch profile.');
        // getUserProfile will handle mapping
        return await this.getUserProfile();
      }
      return this.currentUser;

    } catch (error) {
      if (DEBUG_AUTH_SERVICE) console.error('[AuthService] getCurrentUser - Exception:', error);
      return null; // Or handle error more specifically
    }
  }

  async getUserProfile(): Promise<User | null> {
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getUserProfile called. Current accessToken:', this.accessToken ? 'Exists' : 'Empty');
    if (!this.accessToken) {
      if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getUserProfile - No access token, returning null.');
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });
      if (DEBUG_AUTH_SERVICE) console.log(`[AuthService] GET ${API_BASE_URL}/auth/me - Status: ${response.status}`);

      if (response.status === 401) {
        if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getUserProfile - Received 401. Attempting token refresh.');
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getUserProfile - Token refreshed. Retrying fetch profile.');
          const retryResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
            },
          });
          if (DEBUG_AUTH_SERVICE) console.log(`[AuthService] GET ${API_BASE_URL}/auth/me (retry) - Status: ${retryResponse.status}`);
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({ message: 'Failed to fetch profile after refresh' }));
            const errorMessage = errorData.message;
            if (DEBUG_AUTH_SERVICE) console.error('[AuthService] getUserProfile (retry) API error:', errorMessage, 'Data:', errorData);
            this.logout(); // Logout if retry fails
            throw new Error(errorMessage);
          }
          const backendUserData = await retryResponse.json();
          if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getUserProfile (retry) API success. Backend user data:', backendUserData);
          const mappedUser = mapBackendUserToFrontendUser(backendUserData as BackendUser);
          if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getUserProfile (retry) - Mapped user:', mappedUser);
          this.currentUser = mappedUser;
          this.storeCurrentUser(this.currentUser);
          return this.currentUser;
        }
        if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getUserProfile - Token refresh failed. Logging out.');
        this.logout(); 
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user profile' }));
        const errorMessage = errorData.message;
        if (DEBUG_AUTH_SERVICE) console.error('[AuthService] getUserProfile API error:', errorMessage, 'Data:', errorData);
        // Consider logging out if profile fetch fails for reasons other than 401
        // this.logout(); 
        throw new Error(errorMessage);
      }

      const backendUserData = await response.json();
      if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getUserProfile API success. Backend user data:', backendUserData);
      const mappedUser = mapBackendUserToFrontendUser(backendUserData as BackendUser);
      if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getUserProfile - Mapped user:', mappedUser);
      this.currentUser = mappedUser;
      this.storeCurrentUser(this.currentUser);
      return this.currentUser;
    } catch (error) {
      if (DEBUG_AUTH_SERVICE) console.error('[AuthService] getUserProfile - Exception:', error);
      // If any error occurs during profile fetch, it might indicate an invalid session
      // this.logout(); // Consider if logout is appropriate here for all errors
      throw error;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] refreshAccessToken called. Current refreshToken:', this.refreshToken ? 'Exists' : 'Empty');
    if (!this.refreshToken) {
      if (DEBUG_AUTH_SERVICE) console.log('[AuthService] refreshAccessToken - No refresh token, returning false.');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: this.refreshToken }),
      });
      if (DEBUG_AUTH_SERVICE) console.log(`[AuthService] POST ${API_BASE_URL}/auth/refresh-token - Status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to refresh access token' }));
        if (DEBUG_AUTH_SERVICE) console.error('[AuthService] Refresh token API error:', errorData.message, 'Data:', errorData);
        this.logout(); 
        return false;
      }

      const { accessToken } = await response.json(); 
      if (accessToken) {
        if (DEBUG_AUTH_SERVICE) console.log('[AuthService] Refresh token API success. New accessToken received.');
        this.accessToken = accessToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          if (DEBUG_AUTH_SERVICE) console.log('[AuthService] New accessToken stored in localStorage.');
        }
        return true;
      }
      if (DEBUG_AUTH_SERVICE) console.warn('[AuthService] Refresh token API success but no accessToken in response.');
      this.logout(); // If no new token, treat as failure
      return false;
    } catch (error) {
      if (DEBUG_AUTH_SERVICE) console.error('[AuthService] refreshAccessToken - Exception:', error);
      this.logout(); 
      return false;
    }
  }

  logout(): void {
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] logout called.');
    this.accessToken = null;
    this.refreshToken = null;
    this.currentUser = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      if (DEBUG_AUTH_SERVICE) console.log('[AuthService] Cleared auth data from localStorage.');
    }
    // window.location.href = '/auth/login'; // Consider navigation in AuthContext instead
  }

  private setTokens(tokens: AuthTokens | undefined): void {
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] setTokens called. Tokens:', tokens ? 'Provided' : 'Undefined/Null');
    if (!tokens) {
      if (DEBUG_AUTH_SERVICE) console.warn('[AuthService] setTokens called with undefined tokens.');
      // Decide if to clear existing tokens or do nothing
      // this.accessToken = null;
      // this.refreshToken = null;
      // localStorage.removeItem('accessToken');
      // localStorage.removeItem('refreshToken');
      return;
    }
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] setTokens: accessToken set, refreshToken set.');
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      if (DEBUG_AUTH_SERVICE) console.log('[AuthService] Tokens stored in localStorage.');
    }
  }

  private storeCurrentUser(user: User | null): void {
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] storeCurrentUser called. User:', user);
    if (!user) {
      if (DEBUG_AUTH_SERVICE) console.warn('[AuthService] storeCurrentUser called with null user.');
      // localStorage.removeItem('currentUser'); // Already handled by logout
      return;
    }
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] storeCurrentUser:', user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
      if (DEBUG_AUTH_SERVICE) console.log('[AuthService] Current user stored in localStorage.');
    }
  }

  getAccessToken(): string | null {
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] getAccessToken called. Token:', this.accessToken ? 'Exists' : 'Empty');
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    const authenticated = !!this.accessToken;
    if (DEBUG_AUTH_SERVICE) console.log('[AuthService] isAuthenticated called. Result:', authenticated, 'Token present:', !!this.accessToken);
    return authenticated;
  }
}

export default new AuthService();