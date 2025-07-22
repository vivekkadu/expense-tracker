import axios from 'axios';
import { User, ApiResponse } from '@/types';

class AuthService {
  private baseURL = 'http://13.233.143.17:3000';

  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // Use axios directly since the API doesn't return ApiResponse format
      const response = await axios.post<{ user: any; token: string }>(`${this.baseURL}/api/auth/login`, {
        email: credentials.email,
        password: credentials.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('Login API Response:', response.data);
      
      // Check if response has the expected structure
      if (response.data && response.data.user && response.data.token) {
        const apiUser = response.data.user;
        const transformedUser: User = {
          id: apiUser.id.toString(),
          email: apiUser.email,
          firstName: apiUser.firstName,
          lastName: apiUser.lastName,
          name: `${apiUser.firstName} ${apiUser.lastName}`,
          role: apiUser.role,
          isActive: apiUser.isActive,
          department: apiUser.department || 'General',
          avatar: apiUser.avatar || undefined,
          createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : new Date(),
          updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt) : new Date(),
        };
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(transformedUser));
        localStorage.setItem('token', response.data.token);
        
        return {
          data: {
            user: transformedUser,
            token: response.data.token
          },
          message: 'Login successful',
          success: true
        };
      }
      
      throw new Error('Invalid response format from server');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Clear any existing data on login failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Handle different types of errors
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            `Server error: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Login failed');
      }
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear token and user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      // Even if API call fails, clear local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        throw new Error('No authentication data found');
      }

      // Parse stored user data
      const user = JSON.parse(userData) as User;
      
      return {
        data: user,
        message: 'User retrieved successfully',
        success: true
      };
    } catch (error: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error(error.message || 'Failed to get current user');
    }
  }
}

export const authService = new AuthService();