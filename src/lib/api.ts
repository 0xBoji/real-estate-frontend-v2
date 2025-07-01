import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('auth_token');
      Cookies.remove('user_data');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
  status: string;
  createdAt: string;
  phoneNumber?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalPayments: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  newPropertiesThisMonth: number;
  pendingProperties: number;
  activeUsers: number;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  district: string;
  ward: string;
  propertyType: string;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
  propertyArea: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  userId: number;
  images?: string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Authentication API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  getUserProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>('/users/profile', userData);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
  },

  getUsers: async (page = 0, size = 10, sort = 'createdAt,desc'): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(`/admin/users?page=${page}&size=${size}&sort=${sort}`);
    return response.data;
  },

  updateUserStatus: async (userId: number, status: string): Promise<void> => {
    await apiClient.put(`/admin/users/${userId}/status`, { status });
  },

  getProperties: async (page = 0, size = 10): Promise<PaginatedResponse<Property>> => {
    const response = await apiClient.get<PaginatedResponse<Property>>(`/admin/properties?page=${page}&size=${size}`);
    return response.data;
  },

  approveProperty: async (propertyId: number): Promise<void> => {
    await apiClient.put(`/admin/properties/${propertyId}/approve`);
  },

  rejectProperty: async (propertyId: number, reason: string): Promise<void> => {
    await apiClient.put(`/admin/properties/${propertyId}/reject`, { reason });
  },

  bulkApproveProperties: async (propertyIds: number[]): Promise<void> => {
    await apiClient.post('/admin/properties/bulk-approve', { propertyIds });
  },

  getSystemHealth: async (): Promise<any> => {
    const response = await apiClient.get('/admin/system/health');
    return response.data;
  },

  getSystemInfo: async (): Promise<any> => {
    const response = await apiClient.get('/admin/system/info');
    return response.data;
  },

  clearCache: async (): Promise<void> => {
    await apiClient.post('/admin/system/cache/clear');
  },
};

// Chatbot API
export const chatbotApi = {
  quickSearch: async (query: string): Promise<any> => {
    const response = await apiClient.post('/chatbot/quick-search', { query });
    return response.data;
  },
};

// Membership API
export const membershipApi = {
  getPlans: async (): Promise<any[]> => {
    const response = await apiClient.get('/membership/plans');
    return response.data;
  },

  getUserMembership: async (): Promise<any> => {
    const response = await apiClient.get('/membership/my-membership');
    return response.data;
  },

  createPayment: async (paymentData: any): Promise<any> => {
    const response = await apiClient.post('/membership/payment', paymentData);
    return response.data;
  },

  verifyPayment: async (transactionId: string): Promise<any> => {
    const response = await apiClient.post('/membership/payment/verify', { transactionId });
    return response.data;
  },

  getPaymentHistory: async (): Promise<any[]> => {
    const response = await apiClient.get('/membership/payments');
    return response.data;
  },

  cancelMembership: async (): Promise<any> => {
    const response = await apiClient.post('/membership/cancel');
    return response.data;
  },
};

// Property search parameters
export interface PropertySearchParams {
  city?: string;
  district?: string;
  propertyType?: 'HOUSE' | 'APARTMENT' | 'LAND' | 'VILLA' | 'COMMERCIAL' | 'OFFICE';
  listingType?: 'SALE' | 'RENT';
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// Public API
export const publicApi = {
  getProperties: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Promise<PaginatedResponse<Property>> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Property>>(
        `/properties?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
      );

      // If backend returns empty data, use mock data for demo
      if (response.data.totalElements === 0) {
        const { createMockPaginatedResponse } = await import('./mockData');
        return createMockPaginatedResponse(page, size);
      }

      return response.data;
    } catch (error) {
      console.log('Backend not available, using mock data');
      const { createMockPaginatedResponse } = await import('./mockData');
      return createMockPaginatedResponse(page, size);
    }
  },

  getProperty: async (id: number): Promise<Property> => {
    try {
      const response = await apiClient.get<Property>(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.log('Backend not available, using mock data');
      const { mockProperties } = await import('./mockData');
      const property = mockProperties.find(p => p.id === id);
      if (!property) {
        throw new Error('Property not found');
      }
      return property;
    }
  },

  searchProperties: async (params: PropertySearchParams): Promise<PaginatedResponse<Property>> => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiClient.get<PaginatedResponse<Property>>(
        `/properties/search?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.log('Backend not available, using mock data');
      const { createMockPaginatedResponse } = await import('./mockData');
      return createMockPaginatedResponse(params.page || 0, params.size || 10);
    }
  },

  getFeaturedProperties: async (limit = 10): Promise<Property[]> => {
    try {
      const response = await apiClient.get<Property[]>(`/properties/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.log('Backend not available, using mock data');
      const { mockProperties } = await import('./mockData');
      return mockProperties.slice(0, limit);
    }
  },

  getCategories: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>('/categories');
      return response.data;
    } catch (error) {
      console.log('Backend not available, using mock categories');
      return [
        { id: 1, name: 'Nhà ở', description: 'Residential properties' },
        { id: 2, name: 'Chung cư', description: 'Apartments and condos' },
        { id: 3, name: 'Đất nền', description: 'Land plots' },
        { id: 4, name: 'Biệt thự', description: 'Villas and luxury homes' },
        { id: 5, name: 'Thương mại', description: 'Commercial properties' },
        { id: 6, name: 'Văn phòng', description: 'Office spaces' }
      ];
    }
  },
};

export default apiClient;
