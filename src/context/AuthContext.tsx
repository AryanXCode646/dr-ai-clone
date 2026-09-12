import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import { authService } from '../services/authService';

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  loginDemoUser: (role: 'patient' | 'doctor') => Promise<{ success: boolean; error?: string }>;
  switchDemoUser: (role: 'patient' | 'doctor') => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Explicit configuration for Demo Mode
const IS_DEMO_MODE_ENABLED =
  process.env.REACT_APP_DEMO_MODE === 'true' || process.env.NODE_ENV !== 'production';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dr_ai_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Bootstrap user identity from backend /me endpoint on initial load
  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const savedToken = localStorage.getItem('dr_ai_token');
      if (!savedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const data = await authService.getMe();
        if (isMounted) {
          setUser(data.user);
          setToken(savedToken);
        }
      } catch (err) {
        // Token was invalid, expired, or backend was unreachable
        if (isMounted) {
          localStorage.removeItem('dr_ai_token');
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    bootstrapAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('dr_ai_token', response.token);
      setToken(response.token);
      setUser(response.user);
      return { success: true };
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.response?.data?.error || 'Authentication failed. Please check credentials.';
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.register(data);
      localStorage.setItem('dr_ai_token', response.token);
      setToken(response.token);
      setUser(response.user);
      return { success: true };
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.response?.data?.error || 'Account registration failed.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem('dr_ai_token');
    setUser(null);
    setToken(null);
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      const res = await authService.updateProfile(updates);
      setUser(res.user);
      return true;
    } catch (err) {
      console.error('Failed to update profile:', err);
      return false;
    }
  };

  /**
   * Explicit Opt-In Demo Authentication
   * Authenticates against seeded demo credentials in development/demo mode.
   * Never creates tokens in the browser; obtains signed JWT from the backend.
   */
  const loginDemoUser = async (role: 'patient' | 'doctor'): Promise<{ success: boolean; error?: string }> => {
    if (!IS_DEMO_MODE_ENABLED) {
      return { success: false, error: 'Demo mode is disabled in production environment.' };
    }

    const demoCredentials =
      role === 'doctor'
        ? { email: 'dr.johnson@mediai.com', password: 'Password123!' }
        : { email: 'alex.rivera@example.com', password: 'Password123!' };

    try {
      return await login(demoCredentials.email, demoCredentials.password);
    } catch (err: any) {
      // If backend is in offline demo fallback
      console.warn('Backend unavailable for demo authentication:', err);
      return { success: false, error: 'Demo backend authentication unavailable.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isDemoMode: IS_DEMO_MODE_ENABLED,
        login,
        signup,
        logout,
        updateProfile,
        loginDemoUser,
        switchDemoUser: loginDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
