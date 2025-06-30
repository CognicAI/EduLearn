'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '@/lib/types/auth';
import { authService } from './auth-service';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if backend is available
      const isBackendAvailable = await authService.checkBackendConnection();
      if (!isBackendAvailable) {
        console.warn('Backend is not available');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const user = await authService.getCurrentUser();
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Don't show toast on initial load if token is expired
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const redirectToDashboard = (user: User) => {
    const dashboardMap = {
      student: '/dashboard/student',
      teacher: '/dashboard/teacher',
      admin: '/dashboard/admin',
    };
    router.push(dashboardMap[user.role]);
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Check backend availability first
      const isBackendAvailable = await authService.checkBackendConnection();
      if (!isBackendAvailable) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }

      const { user } = await authService.login(credentials);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success(`Welcome back, ${user.firstName}!`);
      
      // Redirect to appropriate dashboard
      redirectToDashboard(user);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Check backend availability first
      const isBackendAvailable = await authService.checkBackendConnection();
      if (!isBackendAvailable) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }

      const { user } = await authService.register(credentials);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success(`Welcome to EduLearn, ${user.firstName}!`);
      
      // Redirect to appropriate dashboard
      redirectToDashboard(user);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast.success('Logged out successfully');
    router.push('/');
  };

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setAuthState(prev => ({ ...prev, user }));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const getAccessToken = () => {
    return authService.getAccessToken();
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshUser,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}