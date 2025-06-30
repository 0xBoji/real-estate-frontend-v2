import Cookies from 'js-cookie';
import { AuthResponse, User } from './api';

// Token management
export const TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';

export const authUtils = {
  // Store authentication data
  setAuth: (authData: AuthResponse) => {
    Cookies.set(TOKEN_KEY, authData.token, { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    const userData = {
      username: authData.username,
      email: authData.email,
      role: authData.role,
    };
    
    Cookies.set(USER_DATA_KEY, JSON.stringify(userData), { 
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  },

  // Get stored token
  getToken: (): string | null => {
    return Cookies.get(TOKEN_KEY) || null;
  },

  // Get stored user data
  getUser: (): User | null => {
    const userData = Cookies.get(USER_DATA_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!authUtils.getToken();
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    const user = authUtils.getUser();
    return user?.role === 'ADMIN';
  },

  // Clear authentication data
  clearAuth: () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_DATA_KEY);
  },

  // Logout user
  logout: () => {
    authUtils.clearAuth();
    window.location.href = '/auth/login';
  },
};

// Route protection utilities
export const routeUtils = {
  // Check if route requires authentication
  requiresAuth: (pathname: string): boolean => {
    const protectedRoutes = ['/dashboard', '/admin', '/profile', '/properties/create'];
    return protectedRoutes.some(route => pathname.startsWith(route));
  },

  // Check if route requires admin access
  requiresAdmin: (pathname: string): boolean => {
    const adminRoutes = ['/admin'];
    return adminRoutes.some(route => pathname.startsWith(route));
  },

  // Get redirect URL after login
  getRedirectUrl: (userRole: string, intendedUrl?: string): string => {
    if (intendedUrl && !intendedUrl.startsWith('/auth')) {
      return intendedUrl;
    }
    
    return userRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
  },
};

// Form validation utilities
export const validationUtils = {
  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  isValidPassword: (password: string): { isValid: boolean; message: string } => {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    return { isValid: true, message: 'Password is valid' };
  },

  // Validate username
  isValidUsername: (username: string): { isValid: boolean; message: string } => {
    if (username.length < 3) {
      return { isValid: false, message: 'Username must be at least 3 characters long' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    
    return { isValid: true, message: 'Username is valid' };
  },
};

// Error handling utilities
export const errorUtils = {
  // Extract error message from API response
  getErrorMessage: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  },

  // Check if error is network related
  isNetworkError: (error: any): boolean => {
    return !error.response && error.request;
  },

  // Check if error is authentication related
  isAuthError: (error: any): boolean => {
    return error.response?.status === 401 || error.response?.status === 403;
  },
};

export default authUtils;
