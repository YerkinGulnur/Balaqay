import axios from "axios";
import type {
  AuthResponse,
  User,
  Child,
  Measurement,
  Task,
  TaskSection,
  AgeGroup,
  Assignment,
  ProgressData,
} from "@/types";

// ─── Axios instance ───────────────────────────────────────────

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("balaqay_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("balaqay_token");
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, name: string, password: string) =>
    api
      .post<AuthResponse>("/auth/register", { email, name, password })
      .then((r) => r.data),

  login: (email: string, password: string) =>
    api
      .post<AuthResponse>("/auth/login", { email, password })
      .then((r) => r.data),

  me: () => api.get<User>("/auth/me").then((r) => r.data),
};

// ─── Children ─────────────────────────────────────────────────

export const childrenApi = {
  getAll: () => api.get<Child[]>("/children").then((r) => r.data),

  getOne: (id: string) => api.get<Child>(`/children/${id}`).then((r) => r.data),

  create: (payload: {
    name: string;
    ageGroup: string;
    birthDate?: string;
    avatarColor?: string;
    heightCm?: number;
    weightKg?: number;
  }) => api.post<Child>("/children", payload).then((r) => r.data),

  update: (
    id: string,
    data: Partial<{
      name: string;
      ageGroup: string;
      birthDate: string;
      avatarColor: string;
      heightCm: number;
      weightKg: number;
    }>
  ) => api.patch<Child>(`/children/${id}`, data).then((r) => r.data),

  remove: (id: string) => api.delete(`/children/${id}`).then((r) => r.data),

  getMeasurements: (childId: string) =>
    api
      .get<Measurement[]>(`/children/${childId}/measurements`)
      .then((r) => r.data),

  addMeasurement: (
    childId: string,
    payload: { heightCm?: number; weightKg?: number; note?: string }
  ) =>
    api
      .post<Measurement>(`/children/${childId}/measurements`, payload)
      .then((r) => r.data),
};

// ─── Tasks ────────────────────────────────────────────────────

export const tasksApi = {
  list: (params?: { section?: TaskSection; ageGroup?: AgeGroup }) =>
    api.get<Task[]>("/tasks", { params }).then((r) => r.data),
};

// ─── Assignments ──────────────────────────────────────────────

export const assignmentsApi = {
  /** Today's + unread past assignments. Pass date for history. */
  getForChild: (childId: string, date?: string) =>
    api
      .get<Assignment[]>(`/children/${childId}/assignments`, {
        params: date ? { date } : undefined,
      })
      .then((r) => r.data),

  complete: (childId: string, assignmentId: string) =>
    api
      .patch<Assignment>(
        `/children/${childId}/assignments/${assignmentId}/complete`
      )
      .then((r) => r.data),

  uncomplete: (childId: string, assignmentId: string) =>
    api
      .patch<Assignment>(
        `/children/${childId}/assignments/${assignmentId}/uncomplete`
      )
      .then((r) => r.data),
};

// ─── Progress ─────────────────────────────────────────────────

export const progressApi = {
  /** All children summary */
  getAll: () => api.get<ProgressData[]>("/progress").then((r) => r.data),

  /** One child — detailed daily breakdown + measurements */
  getForChild: (childId: string, days?: number) =>
    api
      .get<ProgressData>(`/progress/children/${childId}`, {
        params: days ? { days } : undefined,
      })
      .then((r) => r.data),
};

export default api;
