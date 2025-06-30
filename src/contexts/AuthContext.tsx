'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, AuthResponse, User, LoginRequest, RegisterRequest } from '@/lib/api';
import { authUtils, errorUtils } from '@/lib/auth';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        const token = authUtils.getToken();
        const storedUser = authUtils.getUser();
        console.log('🔑 Token exists:', !!token);
        console.log('👤 Stored user exists:', !!storedUser);

        if (token && storedUser) {
          console.log('✅ Token and user found, verifying...');
          // Try to verify token by fetching user profile, fallback to stored user
          try {
            const currentUser = await authApi.getUserProfile();
            console.log('✅ User profile verified:', currentUser.username);
            setUser(currentUser);
          } catch (error) {
            console.log('⚠️ Profile verification failed, using stored user data');
            // If profile fetch fails, use stored user data (token might still be valid)
            setUser(storedUser);
          }
        } else {
          console.log('ℹ️ No valid auth data found');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        authUtils.clearAuth();
        setUser(null);
      } finally {
        console.log('✅ Auth initialization complete');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      console.log('🔐 Starting login process...');
      setIsLoading(true);
      const authResponse: AuthResponse = await authApi.login(credentials);
      console.log('✅ Login API successful:', authResponse.username, authResponse.role);

      // Store auth data
      authUtils.setAuth(authResponse);
      console.log('💾 Auth data stored in cookies');

      // Try to fetch full user profile, fallback to auth response data
      try {
        const userProfile = await authApi.getUserProfile();
        console.log('👤 User profile fetched:', userProfile.username);
        setUser(userProfile);
      } catch (profileError) {
        console.log('⚠️ Profile fetch failed, using auth response data');
        // Fallback to using data from auth response
        const fallbackUser: User = {
          id: 0, // We don't have ID from auth response
          username: authResponse.username,
          email: authResponse.email,
          firstName: '', // We don't have these from auth response
          lastName: '',
          role: authResponse.role,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        setUser(fallbackUser);
      }

      toast.success('Login successful!');
      console.log('🎉 Login process completed successfully');
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage = errorUtils.getErrorMessage(error);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      console.log('📝 Starting registration process...');
      setIsLoading(true);
      const authResponse: AuthResponse = await authApi.register(userData);
      console.log('✅ Registration API successful:', authResponse.username, authResponse.role);

      // Store auth data
      authUtils.setAuth(authResponse);
      console.log('💾 Auth data stored in cookies');

      // Try to fetch full user profile, fallback to auth response data
      try {
        const userProfile = await authApi.getUserProfile();
        console.log('👤 User profile fetched:', userProfile.username);
        setUser(userProfile);
      } catch (profileError) {
        console.log('⚠️ Profile fetch failed, using auth response data');
        // Fallback to using data from auth response + registration data
        const fallbackUser: User = {
          id: 0, // We don't have ID from auth response
          username: authResponse.username,
          email: authResponse.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: authResponse.role,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        setUser(fallbackUser);
      }

      toast.success('Registration successful!');
      console.log('🎉 Registration process completed successfully');
    } catch (error) {
      console.error('❌ Registration failed:', error);
      const errorMessage = errorUtils.getErrorMessage(error);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    authUtils.clearAuth();
    setUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/auth/login';
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await authApi.updateProfile(userData);
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      const errorMessage = errorUtils.getErrorMessage(error);
      toast.error(errorMessage);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const userProfile = await authApi.getUserProfile();
      setUser(userProfile);
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, user might be logged out
      if (errorUtils.isAuthError(error)) {
        logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
