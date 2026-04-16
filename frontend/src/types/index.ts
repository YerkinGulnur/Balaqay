// ─── Enums ────────────────────────────────────────────────────

export type AgeGroup = "0-1" | "1-3" | "3-6" | "6-10";
export type TaskType = "игровое" | "двигательное" | "речевое" | "когнитивное";
export type TaskSection = "задание" | "питание" | "развитие";

// ─── Auth ─────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// ─── Assignments ──────────────────────────────────────────────

export interface Assignment {
  id: string;
  childId: string;
  taskId: string;
  task: Task;
  assignedDate: string; // 'YYYY-MM-DD'
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
}

// ─── Progress ─────────────────────────────────────────────────

export interface DailyProgress {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionPct: number;
}

export interface ProgressData {
  child: Pick<Child, "id" | "name" | "ageGroup" | "avatarColor">;
  totalEver: number;
  completedEver: number;
  streakDays: number;
  dailyProgress: DailyProgress[];
  measurements: Measurement[];
}

// ─── Children ─────────────────────────────────────────────────

export interface Child {
  id: string;
  userId: string;
  name: string;
  ageGroup: AgeGroup;
  birthDate: string | null;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
  measurements?: Measurement[];
  // Denormalised latest values (populated by addMeasurement in slice)
  latestHeightCm?: number | null;
  latestWeightKg?: number | null;
}

export interface Measurement {
  id: string;
  childId: string;
  heightCm: number | null;
  weightKg: number | null;
  measuredAt: string;
  note: string | null;
}

export interface CreateChildPayload {
  name: string;
  ageGroup: AgeGroup;
  birthDate?: string;
  avatarColor?: string;
  heightCm?: number;
  weightKg?: number;
}

export interface UpdateChildPayload extends Partial<CreateChildPayload> {}

// ─── Tasks ────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: TaskType;
  section: TaskSection;
  ageGroup: AgeGroup;
  daySlot: 1 | 2;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

// ─── Progress ─────────────────────────────────────────────────

export interface DailyProgress {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionPct: number;
}

export interface ChildProgress {
  child: Pick<Child, "id" | "name" | "ageGroup" | "avatarColor">;
  totalEver: number;
  completedEver: number;
  streakDays: number;
  dailyProgress: DailyProgress[];
  measurements: Measurement[];
}

// ─── UI ───────────────────────────────────────────────────────

export type TabKey = "home" | "tasks" | "tips" | "progress";

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  "0-1": "0–1 год",
  "1-3": "1–3 года",
  "3-6": "3–6 лет",
  "6-10": "6–10 лет",
};

export const AVATAR_COLORS = [
  "#FFB347",
  "#87CEEB",
  "#98FB98",
  "#FFB6C1",
  "#DDA0DD",
  "#F0E68C",
  "#87CEFA",
  "#FFA07A",
  "#98F0D4",
  "#C3A6F7",
];
