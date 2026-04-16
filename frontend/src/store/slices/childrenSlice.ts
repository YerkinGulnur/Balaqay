import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { childrenApi } from "@/api/services";
import type { Child, Measurement } from "@/types";

// ─── State ────────────────────────────────────────────────────

interface ChildrenState {
  items: Child[];
  loading: boolean;
  error: string | null;
  // Measurements keyed by childId
  measurements: Record<string, Measurement[]>;
  measurementsLoading: boolean;
}

const initialState: ChildrenState = {
  items: [],
  loading: false,
  error: null,
  measurements: {},
  measurementsLoading: false,
};

// ─── Async Thunks ─────────────────────────────────────────────

/** Fetch all children for the current user */
export const fetchChildren = createAsyncThunk(
  "children/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await childrenApi.getAll();
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Не удалось загрузить детей"
      );
    }
  }
);

/** Fetch one child by id */
export const fetchChild = createAsyncThunk(
  "children/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      return await childrenApi.getOne(id);
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Не удалось загрузить ребёнка"
      );
    }
  }
);

/** Create a new child */
export const createChild = createAsyncThunk(
  "children/create",
  async (
    payload: {
      name: string;
      ageGroup: string;
      birthDate?: string;
      avatarColor?: string;
      heightCm?: number;
      weightKg?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      return await childrenApi.create(payload);
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Не удалось добавить ребёнка"
      );
    }
  }
);

/** Update child info (name, ageGroup, birthDate, avatarColor, height, weight) */
export const updateChild = createAsyncThunk(
  "children/update",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        name: string;
        ageGroup: string;
        birthDate: string;
        avatarColor: string;
        heightCm: number;
        weightKg: number;
      }>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await childrenApi.update(id, data);
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Не удалось обновить данные"
      );
    }
  }
);

/** Delete a child */
export const removeChild = createAsyncThunk(
  "children/remove",
  async (id: string, { rejectWithValue }) => {
    try {
      await childrenApi.remove(id);
      return id; // return id so we can filter it from state
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Не удалось удалить ребёнка"
      );
    }
  }
);

/** Fetch height/weight measurement history for a child */
export const fetchMeasurements = createAsyncThunk(
  "children/fetchMeasurements",
  async (childId: string, { rejectWithValue }) => {
    try {
      const data = await childrenApi.getMeasurements(childId);
      return { childId, data };
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Не удалось загрузить измерения"
      );
    }
  }
);

/** Add a new height/weight snapshot for a child */
export const addMeasurement = createAsyncThunk(
  "children/addMeasurement",
  async (
    {
      childId,
      heightCm,
      weightKg,
      note,
    }: {
      childId: string;
      heightCm?: number;
      weightKg?: number;
      note?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await childrenApi.addMeasurement(childId, {
        heightCm,
        weightKg,
        note,
      });
      return { childId, data };
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Не удалось сохранить измерение"
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────

const childrenSlice = createSlice({
  name: "children",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    // Optimistic local update (e.g. avatar colour change before API round-trip)
    setAvatarColor(
      state,
      action: PayloadAction<{ id: string; color: string }>
    ) {
      const child = state.items.find((c) => c.id === action.payload.id);
      if (child) child.avatarColor = action.payload.color;
    },
  },
  extraReducers: (builder) => {
    // ── fetchChildren ───────────────────────────────────────
    builder
      .addCase(fetchChildren.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchChildren.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchChildren.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      });

    // ── fetchChild ──────────────────────────────────────────
    builder.addCase(fetchChild.fulfilled, (s, a) => {
      const idx = s.items.findIndex((c) => c.id === a.payload.id);
      if (idx !== -1) s.items[idx] = a.payload;
      else s.items.push(a.payload);
    });

    // ── createChild ─────────────────────────────────────────
    builder
      .addCase(createChild.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createChild.fulfilled, (s, a) => {
        s.loading = false;
        s.items.push(a.payload);
      })
      .addCase(createChild.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      });

    // ── updateChild ─────────────────────────────────────────
    builder
      .addCase(updateChild.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateChild.fulfilled, (s, a) => {
        s.loading = false;
        const idx = s.items.findIndex((c) => c.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      })
      .addCase(updateChild.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      });

    // ── removeChild ─────────────────────────────────────────
    builder
      .addCase(removeChild.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(removeChild.fulfilled, (s, a) => {
        s.loading = false;
        s.items = s.items.filter((c) => c.id !== a.payload);
        // Clean up measurements cache for removed child
        delete s.measurements[a.payload];
      })
      .addCase(removeChild.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      });

    // ── fetchMeasurements ───────────────────────────────────
    builder
      .addCase(fetchMeasurements.pending, (s) => {
        s.measurementsLoading = true;
      })
      .addCase(fetchMeasurements.fulfilled, (s, a) => {
        s.measurementsLoading = false;
        s.measurements[a.payload.childId] = a.payload.data;
      })
      .addCase(fetchMeasurements.rejected, (s) => {
        s.measurementsLoading = false;
      });

    // ── addMeasurement ──────────────────────────────────────
    builder
      .addCase(addMeasurement.pending, (s) => {
        s.measurementsLoading = true;
      })
      .addCase(addMeasurement.fulfilled, (s, a) => {
        s.measurementsLoading = false;
        const { childId, data } = a.payload;
        if (!s.measurements[childId]) s.measurements[childId] = [];
        s.measurements[childId].push(data);
        // Also update the latest measurement snapshot on the child object itself
        const child = s.items.find((c) => c.id === childId);
        if (child) {
          if (data.heightCm != null) child.latestHeightCm = data.heightCm;
          if (data.weightKg != null) child.latestWeightKg = data.weightKg;
        }
      })
      .addCase(addMeasurement.rejected, (s) => {
        s.measurementsLoading = false;
      });
  },
});

export const { clearError, setAvatarColor } = childrenSlice.actions;
export default childrenSlice.reducer;
