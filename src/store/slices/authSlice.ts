import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { AuthState, User, ApiResponse } from '@/types';
import { authService } from '@/services/authService';

// Helper function to get user from localStorage
const getUserFromStorage = (): User | null => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

export const loginAsync = createAsyncThunk<
  ApiResponse<{ user: User; token: string }>,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return rejectWithValue(message);
  }
});

export const logoutAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('auth/logout', async (_: void, { rejectWithValue }) => {
  try {
    await authService.logout();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return rejectWithValue(message);
  }
});

export const getCurrentUserAsync = createAsyncThunk<
  ApiResponse<User>,
  void,
  { rejectValue: string }
>('auth/getCurrentUser', async (_: void, { rejectWithValue }) => {
  try {
    const response = await authService.getCurrentUser();
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state: AuthState) => {
      state.error = null;
    },
    setUser: (state: AuthState, action: PayloadAction<User>) => {
      state.user = action.payload;
      // Also update localStorage when user is set
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state: AuthState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state: AuthState, action: PayloadAction<ApiResponse<{ user: User; token: string }>>) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        // User data is already stored in localStorage by authService
      })
      .addCase(loginAsync.rejected, (state: AuthState, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      })
      // Logout
      .addCase(logoutAsync.pending, (state: AuthState) => {
        state.error = null;
      })
      .addCase(logoutAsync.fulfilled, (state: AuthState) => {
        state.user = null;
        state.token = null;
        // Data is already removed from localStorage by authService
      })
      .addCase(logoutAsync.rejected, (state: AuthState, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Logout failed';
      })
      // Get Current User
      .addCase(getCurrentUserAsync.pending, (state: AuthState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state: AuthState, action: PayloadAction<ApiResponse<User>>) => {
        state.isLoading = false;
        state.user = action.payload.data;
      })
      .addCase(getCurrentUserAsync.rejected, (state: AuthState, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to get user';
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;