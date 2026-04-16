import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./slices/authSlice";
import childrenReducer from "./slices/childrenSlice";
import assignmentsReducer from "./slices/assignmentsSlice";
import tasksReducer from "./slices/tasksSlice";
import progressReducer from "./slices/progressSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    children: childrenReducer,
    assignments: assignmentsReducer,
    tasks: tasksReducer,
    progress: progressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
