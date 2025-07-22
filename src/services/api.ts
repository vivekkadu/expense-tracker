import { Expense, ExpenseFormData, User, ExpenseStats, ExpenseCategory, ExpenseStatus, UserRole, ExpenseApiResponse } from '../types';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types';

class ApiService {
  private expenses: Expense[] = [];
  private users: User[] = [];
  private currentUser: User = this.users[0]; // Mock current user

  // Auth methods
  getCurrentUser(): User {
    return this.currentUser;
  }

  login(email: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.find(u => u.email === email);
        if (user) {
          this.currentUser = user;
          resolve(user);
        } else {
          reject(new Error('User not found'));
        }
      }, 500);
    });
  }

  // Expense methods
  // Update the getExpenses method
  getExpenses(userId?: string): Promise<Expense[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock the new API response format
        const mockApiResponse: ExpenseApiResponse = {
          expenses: this.expenses.map(expense => ({
            id: parseInt(expense.id),
            title: expense.description, // Using description as title
            description: expense.description,
            amount: expense.amount.toString(),
            category: expense.category,
            status: expense.status,
            expenseDate: expense.date.toISOString().split('T')[0],
            receiptUrl: expense.receipt || null,
            rejectionReason: expense.rejectionReason || null,
            userId: parseInt(expense.userId),
            approvedBy: expense.approvedBy ? parseInt(expense.approvedBy) : null,
            createdAt: expense.createdAt.toISOString(),
            updatedAt: expense.updatedAt.toISOString(),
            user: {
              id: parseInt(expense.userId),
              email: this.users.find(u => u.id === expense.userId)?.email || '',
              firstName: this.users.find(u => u.id === expense.userId)?.firstName || '',
              lastName: this.users.find(u => u.id === expense.userId)?.lastName || '',
              role: this.users.find(u => u.id === expense.userId)?.role || 'employee',
              isActive: true,
              createdAt: expense.createdAt.toISOString(),
              updatedAt: expense.updatedAt.toISOString()
            }
          })),
          total: this.expenses.length,
          page: 1,
          totalPages: Math.ceil(this.expenses.length / 10)
        };
  
        // Transform the API response back to the expected Expense format
        const transformedExpenses: Expense[] = mockApiResponse.expenses.map((apiExpense: ExpenseApiResponse['expenses'][0]) => ({
          id: apiExpense.id.toString(),
          amount: parseFloat(apiExpense.amount),
          category: apiExpense.category as ExpenseCategory,
          description: apiExpense.description,
          date: new Date(apiExpense.expenseDate),
          status: apiExpense.status as ExpenseStatus,
          userId: apiExpense.userId.toString(),
          user: {
            id: apiExpense.user.id.toString(),
            email: apiExpense.user.email,
            firstName: apiExpense.user.firstName,
            lastName: apiExpense.user.lastName,
            role: apiExpense.user.role as UserRole,
            isActive: apiExpense.user.isActive,
            createdAt: new Date(apiExpense.user.createdAt),
            updatedAt: new Date(apiExpense.user.updatedAt)
          },
          receipt: apiExpense.receiptUrl || undefined,
          approvedBy: apiExpense.approvedBy?.toString(),
          rejectionReason: apiExpense.rejectionReason || undefined,
          createdAt: new Date(apiExpense.createdAt),
          updatedAt: new Date(apiExpense.updatedAt)
        }));
  
        let filteredExpenses = transformedExpenses;
        if (userId && this.currentUser.role === 'employee') {
          filteredExpenses = transformedExpenses.filter(e => e.userId === userId);
        }
        resolve(filteredExpenses);
      }, 300);
    });
  }

  createExpense(expenseData: ExpenseFormData): Promise<Expense> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newExpense = {
          id: Date.now().toString(),
          userId: this.currentUser.id,
          ...expenseData,
          status: ExpenseStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.expenses.push({
          ...newExpense,
          receipt: newExpense.receipt ? URL.createObjectURL(newExpense.receipt) : undefined
        });
        resolve({
          ...newExpense,
          receipt: newExpense.receipt ? URL.createObjectURL(newExpense.receipt) : undefined
        });
      }, 300);
    });
  }

  updateExpenseStatus(expenseId: string, status: ExpenseStatus.APPROVED | ExpenseStatus.REJECTED): Promise<Expense> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const expense = this.expenses.find(e => e.id === expenseId);
        if (expense) {
          expense.status = status;
          expense.updatedAt = new Date();
          resolve(expense);
        } else {
          reject(new Error('Expense not found'));
        }
      }, 300);
    });
  }

  getExpenseStats(): Promise<ExpenseStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userExpenses = this.currentUser.role === 'admin' 
          ? this.expenses 
          : this.expenses.filter(e => e.userId === this.currentUser.id);

        const totalAmount = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalCount = userExpenses.length;
        
        const pendingExpenses = userExpenses.filter(e => e.status === 'pending');
        const pendingAmount = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const pendingCount = pendingExpenses.length;
        
        const approvedExpenses = userExpenses.filter(e => e.status === 'approved');
        const approvedAmount = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const approvedCount = approvedExpenses.length;
        
        const rejectedCount = userExpenses.filter(e => e.status === 'rejected').length;
        
        const categoryBreakdown = userExpenses.reduce((acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          return acc;
        }, {} as Record<string, number>);

        const monthlyData = userExpenses.reduce((acc, expense) => {
          const month = expense.date.toISOString().substring(0, 7); // YYYY-MM format
          if (!acc[month]) {
            acc[month] = { amount: 0, count: 0 };
          }
          acc[month].amount += expense.amount;
          acc[month].count += 1;
          return acc;
        }, {} as { [key: string]: { amount: number; count: number } });

        const monthlyTrend = Object.entries(monthlyData)
          .map(([month, data]) => ({
            month,
            amount: data.amount,
            count: data.count
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

        resolve({
          totalAmount,
          totalCount,
          pendingAmount,
          pendingCount,
          approvedAmount,
          approvedCount,
          rejectedCount,
          categoryBreakdown,
          monthlyTrend
        });
      }, 300);
    });
  }
}

export const apiService = new ApiService();


class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://13.233.143.17:3000') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();