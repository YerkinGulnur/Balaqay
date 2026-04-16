// ── progressSlice.ts ─────────────────────────────────────────
import { createSlice as cs2, createAsyncThunk as cat2 } from "@reduxjs/toolkit";
import { progressApi } from "@/api/services";
import type { ChildProgress } from "@/types";

interface ProgressState {
  items: ChildProgress[];
  loading: boolean;
}

export const fetchAllProgress = cat2("progress/fetchAll", async () => {
  return await progressApi.getAll();
});

export const fetchChildProgress = cat2(
  "progress/fetchChild",
  async ({ childId, days }: { childId: string; days?: number }) => {
    return await progressApi.getForChild(childId, days);
  }
);

const progressSlice = cs2({
  name: "progress",
  initialState: { items: [], loading: false } as ProgressState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAllProgress.pending, (s) => {
      s.loading = true;
    })
      .addCase(fetchAllProgress.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchAllProgress.rejected, (s) => {
        s.loading = false;
      })
      .addCase(fetchChildProgress.fulfilled, (s, a) => {
        const idx = s.items.findIndex((i) => i.child.id === a.payload.child.id);
        if (idx !== -1) s.items[idx] = a.payload;
        else s.items.push(a.payload);
      });
  },
});

export { progressSlice };
export default progressSlice.reducer;
