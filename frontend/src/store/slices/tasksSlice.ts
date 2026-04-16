// ── tasksSlice.ts ────────────────────────────────────────────
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tasksApi } from "@/api/services";
import type { Task, TaskSection, AgeGroup } from "@/types";

interface TasksState {
  items: Task[];
  loading: boolean;
}

export const fetchTasks = createAsyncThunk(
  "tasks/fetch",
  async ({
    section,
    ageGroup,
  }: {
    section?: TaskSection;
    ageGroup?: AgeGroup;
  }) => {
    return await tasksApi.list({ section, ageGroup });
  }
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState: { items: [], loading: false } as TasksState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTasks.pending, (s) => {
      s.loading = true;
    })
      .addCase(fetchTasks.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchTasks.rejected, (s) => {
        s.loading = false;
      });
  },
});

export default tasksSlice.reducer;
