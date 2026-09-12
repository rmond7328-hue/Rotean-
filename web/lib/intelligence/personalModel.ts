import { getLifeSnapshot, type LifeSnapshot } from "@/lib/intelligence/lifeSnapshot";
import { getRecentBehavior, type BehaviorSignal } from "@/lib/intelligence/behavior";

export type PersonalModel = {
  generated_at: string;
  planning_style: string;
  workload: { open_tasks: number; overdue_tasks: number; due_today: number; active_projects: number; active_goals: number };
  time_preferences: { preferred_start: string | null; preferred_end: string | null };
  energy_preferences: { default_level: string | null; high_energy_tasks: number; low_energy_tasks: number };
  behavioral_patterns: { completion_count: number; deferral_count: number; habit_signal_count: number; recent_activity: string[] };
  priorities: { high_priority_tasks: string[]; active_goals: string[] };
  memory_summary: { count: number; high_confidence: string[] };
  confidence: number;
};

function preference<T>(value: unknown, fallback: T): T {
  return value === undefined || value === null ? fallback : value as T;
}

export function buildPersonalModel(snapshot: LifeSnapshot, behavior: BehaviorSignal[] = []): PersonalModel {
  const now = Date.now();
  const tasks = snapshot.tasks ?? [];
  const open = tasks.filter((task) => task.status !== "completed" && task.status !== "done");
  const overdue = open.filter((task) => task.due_at && new Date(task.due_at).getTime() < now);
  const dueToday = open.filter((task) => task.due_at && new Date(task.due_at).toDateString() === new Date().toDateString());
  const highEnergy = open.filter((task) => task.energy_level === "high").length;
  const lowEnergy = open.filter((task) => task.energy_level === "low").length;
  const prefs = snapshot.preferences ?? {};
  const highPriority = open.filter((task) => task.priority >= 4).sort((a, b) => b.priority - a.priority).slice(0, 8).map((task) => task.title);
  const goals = (snapshot.goals ?? []).filter((goal) => goal.status !== "completed").sort((a, b) => b.priority - a.priority).slice(0, 6).map((goal) => goal.title);
  const highConfidence = (snapshot.memories ?? []).filter((memory) => memory.confidence >= 0.8).slice(0, 10).map((memory) => memory.content);
  const recentActivity = behavior.slice(0, 12).map((signal) => signal.signal_type);
  const completed = behavior.filter((signal) => signal.signal_type === "task_completed").length;
  const deferred = behavior.filter((signal) => signal.signal_type === "task_deferred").length;
  const habitSignals = behavior.filter((signal) => signal.signal_type === "habit_completed" || signal.signal_type === "habit_skipped").length;
  const signalConfidence = behavior.length ? Math.min(1, behavior.length / 30) : 0;
  return {
    generated_at: new Date().toISOString(),
    planning_style: preference(prefs.planning_style, "balanced"),
    workload: { open_tasks: open.length, overdue_tasks: overdue.length, due_today: dueToday.length, active_projects: (snapshot.projects ?? []).filter((p) => p.status === "active").length, active_goals: goals.length },
    time_preferences: { preferred_start: typeof prefs.preferred_work_times === "object" && prefs.preferred_work_times ? String((prefs.preferred_work_times as Record<string, unknown>).start ?? "09:00") : "09:00", preferred_end: typeof prefs.preferred_work_times === "object" && prefs.preferred_work_times ? String((prefs.preferred_work_times as Record<string, unknown>).end ?? "17:00") : "17:00" },
    energy_preferences: { default_level: typeof prefs.energy_pattern === "object" && prefs.energy_pattern ? String((prefs.energy_pattern as Record<string, unknown>).default ?? "medium") : "medium", high_energy_tasks: highEnergy, low_energy_tasks: lowEnergy },
    behavioral_patterns: { completion_count: completed, deferral_count: deferred, habit_signal_count: habitSignals, recent_activity: recentActivity },
    priorities: { high_priority_tasks: highPriority, active_goals: goals },
    memory_summary: { count: snapshot.memories?.length ?? 0, high_confidence: highConfidence },
    confidence: Math.min(1, 0.35 + signalConfidence * 0.4 + Math.min(0.25, (snapshot.memories?.length ?? 0) / 40)),
  };
}

export async function getPersonalModel(): Promise<PersonalModel> {
  const [snapshot, behavior] = await Promise.all([getLifeSnapshot(), getRecentBehavior(100)]);
  return buildPersonalModel(snapshot, behavior.data ?? []);
}
