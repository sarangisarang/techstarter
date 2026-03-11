export function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

type ApiOptions = RequestInit & { auth?: boolean };

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path}`;

  const headers = new Headers(options.headers || {});
  const bodyIsForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && options.body && !bodyIsForm) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return (null as any);
  return (await res.json()) as T;
}

export type UserRead = {
  id: string;
  email: string;
  name?: string | null;
  created_at?: string;
};

export type ExerciseRead = {
  id: string;
  name: string;
  muscle_group: string;
  description?: string | null;
  image_url?: string | null;
};

export type WorkoutExerciseRead = {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight?: number | string | null;
  rest_seconds: number;
  rest_limit_seconds: number;
  order_index: number;
};

export type WorkoutRead = {
  id: string;
  user_id: string;
  date: string;
  notes?: string | null;
  created_at?: string;
  workout_exercises: WorkoutExerciseRead[];
};

export async function login(payload: { email: string; password: string }) {
  return apiFetch<{ access_token: string; token_type?: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: { name: string; email: string; password: string }) {
  return apiFetch<UserRead>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function me() {
  return apiFetch<UserRead>("/auth/me", { auth: true });
}

export async function getUsers() {
  return apiFetch<UserRead[]>("/users/", { auth: true });
}

export async function createUser(data: { email: string; password: string; name?: string | null }) {
  return apiFetch<UserRead>("/users", {
    method: "POST",
    auth: false,
    body: JSON.stringify(data),
  });
}

export async function getExercises() {
  return apiFetch<ExerciseRead[]>("/exercises/", { auth: true });
}

export async function createExercise(payload: { name: string; muscle_group: string; description?: string }) {
  return apiFetch<ExerciseRead>("/exercises/", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function uploadExerciseImage(exerciseId: string, file: File) {
  const base = getApiBase();
  const token = getToken();
  if (!token) throw new Error("No token. Please login first.");

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${base}/exercises/${exerciseId}/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed: ${res.status}`);
  }
  return (await res.json()) as ExerciseRead;
}

export async function getWorkouts(opts?: { auth?: boolean }) {
  return apiFetch<WorkoutRead[]>("/workouts/", { auth: opts?.auth ?? true });
}

export async function getWorkout(id: string) {
  return apiFetch<WorkoutRead>(`/workouts/${id}`, { auth: true });
}

export async function getWorkoutAnalysis(id: string, bodyWeightKg?: number | null) {
  const params = new URLSearchParams();
  if (bodyWeightKg != null && Number.isFinite(bodyWeightKg) && bodyWeightKg > 0) {
    params.set("body_weight_kg", String(bodyWeightKg));
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<WorkoutAnalysisRead>(`/workouts/${id}/analysis${suffix}`, { auth: true });
}

export async function createWorkout(payload: any) {
  return apiFetch<WorkoutRead>("/workouts/", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function deleteWorkout(id: string) {
  return apiFetch<{ message?: string }>(`/workouts/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export type StrengthMaxRead = {
  id: string;
  user_id: string;
  exercise_id: string;
  one_rep_max: number | string;
  training_max: number | string;
  increment_step: number | string;
  load_mode: "TOTAL" | "PER_HAND" | string;
  created_at: string;
  updated_at: string;
};

export type ProgramItemRead = {
  id: string;
  program_id: string;
  exercise_id: string;
  week_number: number;
  day_number: number;
  sets: number;
  reps: number;
  percentage: number | string;
  calculated_weight: number | string;
  weight_per_hand?: number | string | null;
  total_weight?: number | string | null;
  rest_seconds: number;
  concentric_seconds: number;
  pause_seconds: number;
  eccentric_seconds: number;
  estimated_set_duration_seconds: number;
  estimated_total_duration_seconds: number;
  notes?: string | null;
};

export type ProgramRead = {
  id: string;
  user_id: string;
  goal: string;
  training_days_per_week: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  items: ProgramItemRead[];
};

export type WorkoutAnalysisRead = {
  goal: string;
  body_weight_kg?: number | string | null;
  total_exercises: number;
  total_sets: number;
  total_reps: number;
  total_volume_kg: number | string;
  average_weight_per_rep_kg: number | string;
  recommended_rest_seconds: number;
  concentric_seconds: number;
  pause_seconds: number;
  eccentric_seconds: number;
  estimated_active_seconds: number;
  estimated_rest_seconds: number;
  estimated_transition_seconds: number;
  estimated_total_seconds: number;
  met_value?: number | string | null;
  estimated_calories_kcal?: number | string | null;
  fat_energy_share?: number | string | null;
  estimated_fat_burned_grams?: number | string | null;
};

export async function saveStrengthMax(payload: {
  exercise_id: string;
  one_rep_max: number;
  increment_step?: number;
  load_mode?: "TOTAL" | "PER_HAND";
}) {
  return apiFetch<StrengthMaxRead>("/programs/maxes", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function getStrengthMaxes() {
  return apiFetch<StrengthMaxRead[]>("/programs/maxes", { auth: true });
}

export async function generateProgram(payload: {
  goal: "strength" | "hypertrophy" | "endurance";
  start_date: string;
  training_days_per_week: number;
  exercise_ids?: string[];
}) {
  return apiFetch<ProgramRead>("/programs/generate", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function getMyPrograms() {
  return apiFetch<ProgramRead[]>("/programs/mine", { auth: true });
}

export async function generateNextCycle(
  programId: string,
  payload: {
    start_date: string;
    goal?: "strength" | "hypertrophy" | "endurance";
    training_days_per_week: number;
    adjustments: Array<{ exercise_id: string; result: "SUCCESS" | "REPEAT" | "FAIL" }>;
  }
) {
  return apiFetch<ProgramRead>(`/programs/${programId}/next-cycle`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}
