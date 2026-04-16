import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { assignmentsApi } from "@/api/services";
import type { Assignment } from "@/types";

interface AssignmentsState {
  // keyed by childId
  byChild: Record<string, Assignment[]>;
  loading: Record<string, boolean>;
}

const initialState: AssignmentsState = { byChild: {}, loading: {} };

export const fetchAssignments = createAsyncThunk(
  "assignments/fetch",
  async ({ childId, date }: { childId: string; date?: string }) => {
    const data = await assignmentsApi.getForChild(childId, date);
    return { childId, data };
  }
);

export const completeAssignment = createAsyncThunk(
  "assignments/complete",
  async ({
    childId,
    assignmentId,
  }: {
    childId: string;
    assignmentId: string;
  }) => {
    const updated = await assignmentsApi.complete(childId, assignmentId);
    return { childId, updated };
  }
);

export const uncompleteAssignment = createAsyncThunk(
  "assignments/uncomplete",
  async ({
    childId,
    assignmentId,
  }: {
    childId: string;
    assignmentId: string;
  }) => {
    const updated = await assignmentsApi.uncomplete(childId, assignmentId);
    return { childId, updated };
  }
);

const assignmentsSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (s, a) => {
        s.loading[a.meta.arg.childId] = true;
      })
      .addCase(fetchAssignments.fulfilled, (s, a) => {
        s.loading[a.payload.childId] = false;
        s.byChild[a.payload.childId] = a.payload.data;
      })
      .addCase(fetchAssignments.rejected, (s, a) => {
        s.loading[a.meta.arg.childId] = false;
      })

      .addCase(completeAssignment.fulfilled, (s, a) => {
        const list = s.byChild[a.payload.childId];
        if (list) {
          const idx = list.findIndex((x) => x.id === a.payload.updated.id);
          if (idx !== -1) list[idx] = a.payload.updated;
        }
      })
      .addCase(uncompleteAssignment.fulfilled, (s, a) => {
        const list = s.byChild[a.payload.childId];
        if (list) {
          const idx = list.findIndex((x) => x.id === a.payload.updated.id);
          if (idx !== -1) list[idx] = a.payload.updated;
        }
      });
  },
});

export default assignmentsSlice.reducer;
