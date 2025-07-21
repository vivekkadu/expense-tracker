import { apiClient } from './api';
import { User, ApiResponse, UserRole } from '@/types';

class AuthService {
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          email: credentials.email,
          name: credentials.email === 'admin@company.com' ? 'Admin User' : 'John Doe',
          role: credentials.email === 'admin@company.com' ? UserRole.ADMIN : UserRole.EMPLOYEE,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        resolve({
          data: {
            user: mockUser,
            token: 'mock-jwt-token-' + Date.now(),
          },
          message: 'Login successful',
          success: true,
        });
      }, 1000);
    });
  }

  async logout(): Promise<void> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    // Mock implementation
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');
      if (!token) {
        reject(new Error('No token found'));
        return;
      }

      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          email: 'user@company.com',
          name: 'John Doe',
          role: UserRole.EMPLOYEE,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        resolve({
          data: mockUser,
          message: 'User retrieved successfully',
          success: true,
        });
      }, 500);
    });
  }
}

export const authService = new AuthService();