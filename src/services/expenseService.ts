import { apiClient } from './api';
import { Expense, ExpenseFormData, ExpenseFilters, ExpenseStats, DashboardStats, PaginatedResponse, ApiResponse } from '@/types';

// Add interface for the actual API response
interface ExpenseApiResponse {
  expenses: Array<{
    id: number;
    title: string;
    description: string;
    amount: string;
    category: string;
    status: string;
    expenseDate: string;
    receiptUrl: string | null;
    rejectionReason: string | null;
    userId: number;
    approvedBy: number | null;
    createdAt: string;
    updatedAt: string;
    user: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }>;
  total: number;
  page: number;
  totalPages: number;
}

class ExpenseService {
  async getExpenses(params?: { page?: number; limit?: number; filters?: ExpenseFilters }): Promise<PaginatedResponse<Expense>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.filters?.category) queryParams.append('category', params.filters.category);
      if (params?.filters?.status) queryParams.append('status', params.filters.status);
      if (params?.filters?.dateFrom) queryParams.append('startDate', params.filters.dateFrom.toISOString());
      if (params?.filters?.dateTo) queryParams.append('endDate', params.filters.dateTo.toISOString());
      
      const url = `/api/expenses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<{ expenses: any[], total: number, page: number, totalPages: number }>(url);
      
      console.log('Raw API response in service:', response);
      
      // The API returns the data directly, not wrapped in a 'data' property
      const apiData = response.data || response;
      
      // Transform the API response to match our expected format
      const transformedExpenses: Expense[] = apiData.expenses.map((apiExpense): Expense => ({
        id: apiExpense.id.toString(),
        description: apiExpense.description,
        amount: parseFloat(apiExpense.amount),
        category: apiExpense.category as any,
        status: apiExpense.status as any,
        date: new Date(apiExpense.expenseDate),
        receipt: apiExpense.receiptUrl || undefined,
        rejectionReason: apiExpense.rejectionReason || undefined,
        userId: apiExpense.userId.toString(),
        approvedBy: apiExpense.approvedBy?.toString() || undefined,
        createdAt: new Date(apiExpense.createdAt),
        updatedAt: new Date(apiExpense.updatedAt),
        user: {
          id: apiExpense.user.id.toString(),
          email: apiExpense.user.email,
          firstName: apiExpense.user.firstName,
          lastName: apiExpense.user.lastName,
          role: apiExpense.user.role as any,
          isActive: apiExpense.user.isActive,
          createdAt: new Date(apiExpense.user.createdAt),
          updatedAt: new Date(apiExpense.user.updatedAt),
        },
      }));
      
      console.log('Transformed expenses:', transformedExpenses);
      
      return {
        data: transformedExpenses,
        message: 'Expenses retrieved successfully',
        success: true,
        pagination: {
          page: apiData.page,
          limit: params?.limit || 10,
          total: apiData.total,
          totalPages: apiData.totalPages,
        },
      };
    } catch (error: any) {
      console.error('Error in expenseService.getExpenses:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }

  async createExpense(expenseData: ExpenseFormData): Promise<ApiResponse<Expense>> {
    try {
      const payload = {
        title: expenseData.description, // Map description to title
        description: expenseData.description,
        amount: expenseData.amount,
        category: expenseData.category,
        expenseDate: expenseData.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      };
      
      console.log('Creating expense with payload:', payload);
      const response = await apiClient.post<any>('/api/expenses', payload);
      console.log('Create expense API response:', response);
      
      // Handle response data consistently with other methods
      const apiExpense = response.data || response; // API might return data directly or wrapped
      
      // Add validation to ensure we have the required data
      if (!apiExpense || !apiExpense.id) {
        throw new Error('Invalid response from server: missing expense data');
      }
      
      const transformedExpense: Expense = {
        id: apiExpense.id.toString(),
        description: apiExpense.description || expenseData.description,
        amount: parseFloat(apiExpense.amount) || expenseData.amount,
        category: apiExpense.category as any || expenseData.category,
        status: apiExpense.status as any || 'PENDING',
        date: apiExpense.expenseDate ? new Date(apiExpense.expenseDate) : expenseData.date,
        receipt: apiExpense.receiptUrl || undefined,
        rejectionReason: apiExpense.rejectionReason || undefined,
        userId: apiExpense.userId?.toString() || '',
        approvedBy: apiExpense.approvedBy?.toString() || undefined,
        createdAt: apiExpense.createdAt ? new Date(apiExpense.createdAt) : new Date(),
        updatedAt: apiExpense.updatedAt ? new Date(apiExpense.updatedAt) : new Date(),
        user: {
          id: apiExpense.user?.id?.toString() || '',
          email: apiExpense.user?.email || '',
          firstName: apiExpense.user?.firstName || '',
          lastName: apiExpense.user?.lastName || '',
          role: apiExpense.user?.role as any || 'USER',
          isActive: apiExpense.user?.isActive ?? true,
          createdAt: apiExpense.user?.createdAt ? new Date(apiExpense.user.createdAt) : new Date(),
          updatedAt: apiExpense.user?.updatedAt ? new Date(apiExpense.user.updatedAt) : new Date(),
        },
      };
   
      return {
        data: transformedExpense,
        message: 'Expense created successfully',
        success: true,
      };
    } catch (error: any) {
      console.error('Error creating expense:', error);
      throw new Error(error.response?.data?.message || 'Failed to create expense');
    }
  }

  async updateExpense(id: string, data: Partial<ExpenseFormData>): Promise<ApiResponse<Expense>> {
    try {
      const payload: any = {};
      
      if (data.description) {
        payload.title = data.description;
        payload.description = data.description;
      }
      if (data.amount) payload.amount = data.amount;
      if (data.category) payload.category = data.category;
      if (data.date) payload.expenseDate = data.date.toISOString().split('T')[0];
      
      const response = await apiClient.put<Expense>(`/api/expenses/${id}`, payload);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update expense');
    }
  }

  async updateExpenseStatus(id: string, status: string): Promise<ApiResponse<Expense>> {
    try {
      console.log('Updating expense status:', { id, status });
      const response = await apiClient.put<any>('/api/expenses/status', {
        expenseId: parseInt(id),
        status: status,
      });
      
      console.log('Update status API response:', response);
      
      // Handle response data consistently with other methods
      const apiExpense = response.data || response;
      
      // Add validation to ensure we have the required data
      if (!apiExpense || !apiExpense.id) {
        throw new Error('Invalid response from server: missing expense data');
      }
      
      // Transform the API response to match our expected Expense format
      const transformedExpense: Expense = {
        id: apiExpense.id.toString(),
        description: apiExpense.description,
        amount: parseFloat(apiExpense.amount),
        category: apiExpense.category as any,
        status: apiExpense.status as any,
        date: new Date(apiExpense.expenseDate),
        receipt: apiExpense.receiptUrl || undefined,
        rejectionReason: apiExpense.rejectionReason || undefined,
        userId: apiExpense.userId.toString(),
        approvedBy: apiExpense.approvedBy?.toString() || undefined,
        createdAt: new Date(apiExpense.createdAt),
        updatedAt: new Date(apiExpense.updatedAt),
        user: {
          id: apiExpense.user.id.toString(),
          email: apiExpense.user.email,
          firstName: apiExpense.user.firstName,
          lastName: apiExpense.user.lastName,
          role: apiExpense.user.role as any,
          isActive: apiExpense.user.isActive,
          createdAt: new Date(apiExpense.user.createdAt),
          updatedAt: new Date(apiExpense.user.updatedAt),
        },
      };
      
      return {
        data: transformedExpense,
        message: `Expense ${status.toLowerCase()} successfully`,
        success: true,
      };
    } catch (error: any) {
      console.error('Error updating expense status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update expense status');
    }
  }

  async deleteExpense(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(`/api/expenses/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete expense');
    }
  }

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await apiClient.get<DashboardStats>('/api/analytics/dashboard');
      console.log('Raw dashboard API response:', response);
      
      // If the API returns DashboardStats directly (not wrapped in ApiResponse)
      if ('totalStats' in response && 'categoryStats' in response) {
        return {
          data: response as DashboardStats,
          message: 'Dashboard stats retrieved successfully',
          success: true,
        };
      }
      
      // If the API returns ApiResponse<DashboardStats>
      return response as ApiResponse<DashboardStats>;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }

  async getStats(): Promise<ExpenseStats> {
    try {
      const dashboardResponse = await this.getDashboardStats();
      const dashboardData = dashboardResponse.data;
      
      // Transform dashboard data to ExpenseStats format
      return {
        totalAmount: parseFloat(dashboardData.totalStats.totalApprovedAmount || '0'),
        totalCount: dashboardData.totalStats.totalExpenses,
        pendingAmount: 0, // Not available in current API
        pendingCount: parseInt(dashboardData.totalStats.pendingExpenses),
        approvedAmount: parseFloat(dashboardData.totalStats.totalApprovedAmount || '0'),
        approvedCount: parseInt(dashboardData.totalStats.approvedExpenses),
        rejectedCount: parseInt(dashboardData.totalStats.rejectedExpenses),
        categoryBreakdown: dashboardData.categoryStats.reduce((acc, cat) => {
          acc[cat.category] = parseFloat(cat.totalAmount);
          return acc;
        }, {} as Record<string, number>),
        monthlyTrend: [] // Not available in current API
      };
    } catch (error) {
      console.error('Error transforming dashboard stats:', error);
      throw error;
    }
  }
}

export const expenseService = new ExpenseService();