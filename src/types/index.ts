export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export enum UserRole {
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft'
}

export enum ExpenseCategory {
  TRAVEL = 'travel',
  MEALS = 'meals',
  OFFICE_SUPPLIES = 'office_supplies',
  SOFTWARE = 'software',
  TRAINING = 'training',
  MARKETING = 'marketing',
  OTHER = 'other'
}

export interface Expense extends BaseEntity {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  status: ExpenseStatus;
  userId: string;
  user?: User;
  receipt?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export interface ExpenseFormData {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  receipt?: File;
}

export interface ExpenseFilters {
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
  search?: string;
}

export interface ExpenseStats {
  totalAmount: number;
  totalCount: number;
  pendingAmount: number;
  pendingCount: number;
  approvedAmount: number;
  approvedCount: number;
  rejectedCount: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ExpenseState {
  expenses: Expense[];
  stats: ExpenseStats | null;
  filters: ExpenseFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RootState {
  auth: AuthState;
  expenses: ExpenseState;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}