import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/types";
import { createUser, currentUser, loginUser, logoutUser } from "./userApi";

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  createdUser?: User | null;
  isAuthenticated: boolean; // ✅ New
  initialized: boolean;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
  createdUser: null,
  isAuthenticated: false, // ✅
  initialized: false,
};

export const loginUserThunk = createAsyncThunk<
  User,
  { username: string; password: string }
>("user/login", async (loginData, { rejectWithValue }) => {
  try {
    const user = await loginUser(loginData);
    return user;
  } catch (error: any) {
    return rejectWithValue(error.message || "Login failed");
  }
});

export const currentUserThunk = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("user/current", async (_, { rejectWithValue }) => {
  try {
    const user = await currentUser();
    return user;
  } catch (error: any) {
    return rejectWithValue(error.message || "Unauthorized");
  }
});

export const createUserThunk = createAsyncThunk<
  User,
  Partial<User>,
  { rejectValue: string }
>("user/create", async (formData, { rejectWithValue }) => {
  try {
    const user = await createUser(formData);
    return user;
  } catch (error: any) {
    return rejectWithValue(error.message || "User creation failed");
  }
});

export const logoutEmployeeThunk = createAsyncThunk(
  "Employee/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login user
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUserThunk.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.currentUser = action.payload;
        },
      )
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Current user
      .addCase(currentUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        currentUserThunk.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.currentUser = action.payload;
        },
      )
      .addCase(currentUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.currentUser = null;
        state.error = action.payload || null;
      })

      // Create user
      .addCase(createUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createUserThunk.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.createdUser = action.payload;
        },
      )
      .addCase(createUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(logoutEmployeeThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutEmployeeThunk.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;

        state.loading = false;
        state.initialized = true;
      })
      .addCase(logoutEmployeeThunk.rejected, (state) => {
        state.loading = false;
        state.currentUser = null;
        state.isAuthenticated = false;

        state.initialized = true;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
