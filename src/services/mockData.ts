import { User, Expense, UserRole, ExpenseCategory, ExpenseStatus } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.EMPLOYEE,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z')
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: UserRole.ADMIN,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z')
  }
];

export const mockExpenses: Expense[] = [
  {
    id: '1',
    userId: '1',
    amount: 25.50,
    category: ExpenseCategory.MEALS,
    description: 'Team lunch',
    date: new Date('2024-01-15'),
    status: ExpenseStatus.APPROVED,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: '2',
    userId: '1',
    amount: 120.00,
    category: ExpenseCategory.TRAVEL,
    description: 'Taxi to client meeting',
    date: new Date('2024-01-14'),
    status: ExpenseStatus.PENDING,
    createdAt: new Date('2024-01-14T14:30:00Z'),
    updatedAt: new Date('2024-01-14T14:30:00Z')
  }
];