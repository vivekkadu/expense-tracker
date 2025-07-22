import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import {
  ExpenseState,
  Expense,
  ExpenseFormData,
  ExpenseFilters,
  ExpenseStats,
  PaginatedResponse,
  ApiResponse,
} from '@/types';
import { expenseService } from '@/services/expenseService';

const initialState: ExpenseState = {
  expenses: [],
  stats: null,
  filters: {},
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const fetchExpensesAsync = createAsyncThunk<
  PaginatedResponse<Expense>,
  { page?: number; limit?: number; filters?: ExpenseFilters },
  { rejectValue: string }
>('expenses/fetchExpenses', async (params, { rejectWithValue }) => {
  try {
    console.log('Fetching expenses with params:', params);
    const response = await expenseService.getExpenses(params);
    console.log('Expense service response:', response);
    return response;
  } catch (error: unknown) {
    console.error('fetchExpensesAsync error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to fetch expenses';
    return rejectWithValue(message);
  }
});

export const createExpenseAsync = createAsyncThunk<
  ApiResponse<Expense>,
  ExpenseFormData,
  { rejectValue: string }
>(
  'expenses/createExpense',
  async (expenseData: ExpenseFormData, { rejectWithValue }) => {
    try {
      const response = await expenseService.createExpense(expenseData);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create expense';
      return rejectWithValue(message);
    }
  }
);

export const updateExpenseAsync = createAsyncThunk<
  ApiResponse<Expense>,
  { id: string; data: Partial<ExpenseFormData> },
  { rejectValue: string }
>('expenses/updateExpense', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await expenseService.updateExpense(id, data);
    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update expense';
    return rejectWithValue(message);
  }
});

export const deleteExpenseAsync = createAsyncThunk<
  ApiResponse<void>,
  string,
  { rejectValue: string }
>('expenses/deleteExpense', async (id: string, { rejectWithValue }) => {
  try {
    const response = await expenseService.deleteExpense(id);
    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete expense';
    return rejectWithValue(message);
  }
});

export const fetchStatsAsync = createAsyncThunk<
  ExpenseStats,
  ExpenseFilters | undefined,
  { rejectValue: string }
>(
  'expenses/fetchStats',
  async (filters: ExpenseFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await expenseService.getStats();
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch stats';
      return rejectWithValue(message);
    }
  }
);

export const updateExpenseStatusAsync = createAsyncThunk<
  ApiResponse<Expense>,
  { id: string; status: string },
  { rejectValue: string }
>('expenses/updateExpenseStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await expenseService.updateExpenseStatus(id, status);
    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update expense status';
    return rejectWithValue(message);
  }
});

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setFilters: (
      state: ExpenseState,
      action: PayloadAction<ExpenseFilters>
    ) => {
      state.filters = action.payload;
    },
    clearFilters: (state: ExpenseState) => {
      state.filters = {};
    },
    clearError: (state: ExpenseState) => {
      state.error = null;
    },
    setPage: (state: ExpenseState, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<ExpenseState>) => {
    builder
      // Fetch Expenses
      .addCase(fetchExpensesAsync.pending, (state: ExpenseState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchExpensesAsync.fulfilled,
        (
          state: ExpenseState,
          action: PayloadAction<PaginatedResponse<Expense>>
        ) => {
          console.log('fetchExpensesAsync.fulfilled - payload:', action.payload);
          state.isLoading = false;
          state.expenses = action.payload.data;
          state.pagination = action.payload.pagination;
          console.log('Updated state.expenses:', state.expenses);
        }
      )
      .addCase(
        fetchExpensesAsync.rejected,
        (state: ExpenseState, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to fetch expenses';
        }
      )
      // Create Expense
      .addCase(createExpenseAsync.pending, (state: ExpenseState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createExpenseAsync.fulfilled,
        (state: ExpenseState, action: PayloadAction<ApiResponse<Expense>>) => {
          state.isLoading = false;
          state.expenses.unshift(action.payload.data);
        }
      )
      .addCase(
        createExpenseAsync.rejected,
        (state: ExpenseState, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to create expense';
        }
      )
      // Update Expense
      .addCase(updateExpenseAsync.pending, (state: ExpenseState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateExpenseAsync.fulfilled,
        (state: ExpenseState, action: PayloadAction<ApiResponse<Expense>>) => {
          state.isLoading = false;
          const index = state.expenses.findIndex(
            exp => exp.id === action.payload.data.id
          );
          if (index !== -1) {
            state.expenses[index] = action.payload.data;
          }
        }
      )
      .addCase(
        updateExpenseAsync.rejected,
        (state: ExpenseState, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to update expense';
        }
      )
      // Delete Expense
      .addCase(deleteExpenseAsync.pending, (state: ExpenseState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteExpenseAsync.fulfilled,
        (state: ExpenseState, action) => {
          state.isLoading = false;
          // Remove the deleted expense from the state
          const expenseId = action.meta.arg; // Get the ID from the thunk argument
          state.expenses = state.expenses.filter(exp => exp.id !== expenseId);
        }
      )
      .addCase(
        deleteExpenseAsync.rejected,
        (state: ExpenseState, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to delete expense';
        }
      )
      // Update Expense Status
      .addCase(updateExpenseStatusAsync.pending, (state: ExpenseState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateExpenseStatusAsync.fulfilled,
        (state: ExpenseState, action: PayloadAction<ApiResponse<Expense>>) => {
          state.isLoading = false;
          const index = state.expenses.findIndex(
            exp => exp.id === action.payload.data.id
          );
          if (index !== -1) {
            state.expenses[index] = action.payload.data;
          }
        }
      )
      .addCase(
        updateExpenseStatusAsync.rejected,
        (state: ExpenseState, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to update expense status';
        }
      )
      // Fetch Stats
      .addCase(fetchStatsAsync.pending, (state: ExpenseState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchStatsAsync.fulfilled,
        (
          state: ExpenseState,
          action: PayloadAction<ExpenseStats>
        ) => {
          state.isLoading = false;
          state.stats = action.payload;
        }
      )
      .addCase(
        fetchStatsAsync.rejected,
        (state: ExpenseState, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to fetch stats';
        }
      );
  },
});

export const { setFilters, clearFilters, clearError, setPage } = expenseSlice.actions;
export default expenseSlice.reducer;
