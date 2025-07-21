export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Office Supplies',
  'Travel',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other'
];

export const EXPENSE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  EXPENSES: {
    LIST: '/expenses',
    CREATE: '/expenses',
    UPDATE: (id: string) => `/expenses/${id}`,
    DELETE: (id: string) => `/expenses/${id}`,
    APPROVE: (id: string) => `/expenses/${id}/approve`,
    REJECT: (id: string) => `/expenses/${id}/reject`,
    STATS: '/expenses/stats',
  },
  USERS: {
    PROFILE: '/users/profile',
    LIST: '/users',
  },
} as const;

export const QUERY_KEYS = {
  EXPENSES: 'expenses',
  EXPENSE_STATS: 'expense-stats',
  USER_PROFILE: 'user-profile',
  USERS: 'users',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
} as const;

export const VALIDATION_RULES = {
  EXPENSE: {
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 10000,
    MAX_DESCRIPTION_LENGTH: 500,
  },
  USER: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
  },
} as const;