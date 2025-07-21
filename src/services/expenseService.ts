import { apiClient } from './api';
import { Expense, ExpenseFormData, ExpenseFilters, ExpenseStats, PaginatedResponse, ApiResponse, ExpenseCategory, ExpenseStatus } from '@/types';

class ExpenseService {
  async getExpenses(params?: { page?: number; limit?: number; filters?: ExpenseFilters }): Promise<PaginatedResponse<Expense>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockExpenses: Expense[] = [
          {
            id: '1',
            amount: 150.00,
            category: ExpenseCategory.MEALS,
            description: 'Team lunch meeting',
            date: new Date('2024-01-15'),
            status: ExpenseStatus.APPROVED,
            userId: '1',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-16'),
          },
          {
            id: '2',
            amount: 500.00,
            category: ExpenseCategory.TRAVEL,
            description: 'Flight to conference',
            date: new Date('2024-01-10'),
            status: ExpenseStatus.PENDING,
            userId: '1',
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-10'),
          },
        ];

        resolve({
          data: mockExpenses,
          message: 'Expenses retrieved successfully',
          success: true,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: mockExpenses.length,
            totalPages: 1,
          },
        });
      }, 1000);
    });
  }

  async createExpense(expenseData: ExpenseFormData): Promise<ApiResponse<Expense>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real implementation, you would upload the file and get a URL back
        const receiptUrl = expenseData.receipt ? `https://api.example.com/uploads/${Date.now()}-${expenseData.receipt.name}` : undefined;
        
        const newExpense: Expense = {
          id: Date.now().toString(),
          amount: expenseData.amount,
          category: expenseData.category,
          description: expenseData.description,
          date: expenseData.date,
          receipt: receiptUrl,
          status: ExpenseStatus.PENDING,
          userId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        resolve({
          data: newExpense,
          message: 'Expense created successfully',
          success: true,
        });
      }, 1000);
    });
  }

  async updateExpense(id: string, data: Partial<ExpenseFormData>): Promise<ApiResponse<Expense>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedExpense: Expense = {
          id,
          amount: data.amount || 0,
          category: data.category || ExpenseCategory.OTHER,
          description: data.description || '',
          date: data.date || new Date(),
          status: ExpenseStatus.PENDING,
          userId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        resolve({
          data: updatedExpense,
          message: 'Expense updated successfully',
          success: true,
        });
      }, 1000);
    });
  }

  async deleteExpense(id: string): Promise<ApiResponse<void>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: undefined!,
          message: 'Expense deleted successfully',
          success: true,
        });
      }, 1000);
    });
  }

  async getStats(filters?: ExpenseFilters): Promise<ApiResponse<ExpenseStats>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockStats: ExpenseStats = {
          totalAmount: 2500.00,
          totalCount: 15,
          pendingAmount: 800.00,
          pendingCount: 3,
          approvedAmount: 1700.00,
          approvedCount: 12,
          rejectedCount: 0,
          categoryBreakdown: {
            [ExpenseCategory.TRAVEL]: 1200.00,
            [ExpenseCategory.MEALS]: 600.00,
            [ExpenseCategory.OFFICE_SUPPLIES]: 300.00,
            [ExpenseCategory.SOFTWARE]: 400.00,
            [ExpenseCategory.TRAINING]: 0,
            [ExpenseCategory.MARKETING]: 0,
            [ExpenseCategory.OTHER]: 0,
          },
          monthlyTrend: [
            { month: 'Jan', amount: 2500, count: 15 },
            { month: 'Dec', amount: 1800, count: 12 },
            { month: 'Nov', amount: 2200, count: 18 },
          ],
        };

        resolve({
          data: mockStats,
          message: 'Stats retrieved successfully',
          success: true,
        });
      }, 1000);
    });
  }
}

export const expenseService = new ExpenseService();