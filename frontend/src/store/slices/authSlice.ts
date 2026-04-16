import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "@/api/services";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("balaqay_token"),
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  "auth/register",
  async (
    payload: { email: string; name: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      return await authApi.register(
        payload.email,
        payload.name,
        payload.password
      );
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Ошибка регистрации");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authApi.login(payload.email, payload.password);
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Неверный email или пароль"
      );
    }
  }
);

export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.me();
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Ошибка");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("balaqay_token");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleAuthFulfilled = (
      state: AuthState,
      action: PayloadAction<any>
    ) => {
      state.loading = false;
      state.error = null;
      state.token = action.payload.access_token;
      state.user = action.payload.user;
      localStorage.setItem("balaqay_token", action.payload.access_token);
    };

    builder
      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, handleAuthFulfilled)
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })

      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, handleAuthFulfilled)
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })

      .addCase(fetchMe.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(fetchMe.rejected, (s) => {
        s.loading = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
