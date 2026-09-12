import { getLifeSnapshot, type LifeSnapshot } from "@/lib/intelligence/lifeSnapshot";
import { getRecentBehavior, type BehaviorSignal } from "@/lib/intelligence/behavior";

export type PersonalModel = {
  generated_at: string;
  planning_style: string;
  workload: { open_tasks: number; overdue_tasks: number; due_today: number; active_projects: number; active_goals: number };
  time_preferences: { preferred_start: string | null; preferred_end: string | null };
  energy_preferences: { default_level: string | null; high_energy_tasks: number; low_energy_tasks: number };
  behavioral_patterns: {
    completion_count: number;
    deferral_count: number;
    habit_signal_count: number;
    recommendation_feedback_count: number;
    recent_activity: string[];
    most_active_hour: number | null;
    most_active_weekday: string | null;
    completion_rate: number | null;
    average_task_duration_minutes: number | null;
  };
  inferred_patterns: Array<{ id: string; label: string; detail: string; confidence: number }>;
  priorities: { high_priority_tasks: string[]; active_goals: string[] };
  memory_summary: { count: number; high_confidence: string[]; correction_count: number };
  confidence: number;
};

const done = (s: string) => s === "completed" || s === "done";
const objectValue = (value: unknown, key: string) => typeof value === "object" && value !== null ? (value as Record<string, unknown>)[key] : undefined;

function buildPatterns(snapshot: LifeSnapshot, behavior: BehaviorSignal[]) {
  const patterns: PersonalModel["inferred_patterns"] = [];
  const timezone = snapshot.timezone || "UTC";
  const hourCounts = new Map<number, number>();
  const weekdayCounts = new Map<string, number>();
  let completed = 0;
  let deferred = 0;
  let durationTotal = 0;
  let durationSamples = 0;
  for (const signal of behavior) {
    const date = new Date(signal.occurred_at ?? 0);
    const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", hour12: false }).format(date));
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long" }).format(date);
    if (Number.isFinite(hour)) hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
    weekdayCounts.set(weekday, (weekdayCounts.get(weekday) ?? 0) + 1);
    if (signal.type === "task_completed") completed += 1;
    if (signal.type === "task_deferred") deferred += 1;
    const duration = Number(objectValue(signal.metadata, "actual_minutes"));
    if (Number.isFinite(duration) && duration > 0 && duration < 24 * 60) { durationTotal += duration; durationSamples += 1; }
  }
  const topHour = [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topWeekday = [...weekdayCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const evidence = behavior.length;
  if (topHour && evidence >= 5) patterns.push({ id: "active-hour", label: "Active window", detail: `You are most active around ${String(topHour[0]).padStart(2, "0")}:00.`, confidence: Math.min(0.95, 0.35 + evidence / 40) });
  if (topWeekday && evidence >= 7) patterns.push({ id: "active-weekday", label: "Strongest day", detail: `${topWeekday[0]} has the most recorded activity so far.`, confidence: Math.min(0.9, 0.3 + evidence / 50) });
  const rate = completed + deferred > 0 ? completed / (completed + deferred) : null;
  if (rate !== null && evidence >= 6) patterns.push({ id: "completion-rate", label: "Follow-through", detail: `Recorded task follow-through is about ${Math.round(rate * 100)}%.`, confidence: Math.min(0.9, 0.35 + evidence / 45) });
  return { patterns, mostActiveHour: topHour?.[0] ?? null, mostActiveWeekday: topWeekday?.[0] ?? null, completionRate: rate, averageDuration: durationSamples ? Math.round(durationTotal / durationSamples) : null };
}

export function buildPersonalModel(snapshot: LifeSnapshot, behavior: BehaviorSignal[] = []): PersonalModel {
  const now = Date.now();
  const tasks = snapshot.tasks ?? [];
  const open = tasks.filter((task) => !done(task.status));
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: snapshot.timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  const today = formatter.format(new Date());
  const overdue = open.filter((task) => task.due_at && new Date(task.due_at).getTime() < now);
  const dueToday = open.filter((task) => task.due_at && formatter.format(new Date(task.due_at)) === today);
  const prefs = snapshot.preferences ?? {};
  const highPriority = open.filter((task) => task.priority >= 4).sort((a, b) => b.priority - a.priority).slice(0, 8).map((task) => task.title);
  const goals = (snapshot.goals ?? []).filter((goal) => !done(goal.status)).sort((a, b) => b.priority - a.priority).slice(0, 6).map((goal) => goal.title);
  const memories = (snapshot.memories ?? []).filter((memory) => memory.confidence >= 0.8 && (!memory.expires_at || new Date(memory.expires_at).getTime() > now)).slice(0, 10).map((memory) => memory.content);
  const correctionCount = (snapshot.memories ?? []).filter((memory) => memory.source === "correction").length;
  const recent = behavior.slice(0, 12).map((signal) => signal.type);
  const completed = behavior.filter((signal) => signal.type === "task_completed").length;
  const deferred = behavior.filter((signal) => signal.type === "task_deferred").length;
  const habitSignals = behavior.filter((signal) => signal.type === "habit_completed" || signal.type === "habit_skipped").length;
  const recommendationFeedback = behavior.filter((signal) => signal.type === "recommendation_feedback" || signal.type === "recommendation_rating").length;
  const derived = buildPatterns(snapshot, behavior);
  const evidenceConfidence = Math.min(0.5, behavior.length / 60);
  const memoryConfidence = Math.min(0.25, (snapshot.memories?.length ?? 0) / 40);
  return {
    generated_at: new Date().toISOString(),
    planning_style: String(prefs.planning_style ?? "balanced"),
    workload: { open_tasks: open.length, overdue_tasks: overdue.length, due_today: dueToday.length, active_projects: (snapshot.projects ?? []).filter((project) => project.status === "active").length, active_goals: goals.length },
    time_preferences: { preferred_start: String(objectValue(prefs.preferred_work_times, "start") ?? "09:00"), preferred_end: String(objectValue(prefs.preferred_work_times, "end") ?? "17:00") },
    energy_preferences: { default_level: String(objectValue(prefs.energy_pattern, "default") ?? "medium"), high_energy_tasks: open.filter((task) => task.energy_level === "high").length, low_energy_tasks: open.filter((task) => task.energy_level === "low").length },
    behavioral_patterns: { completion_count: completed, deferral_count: deferred, habit_signal_count: habitSignals, recommendation_feedback_count: recommendationFeedback, recent_activity: recent, most_active_hour: derived.mostActiveHour, most_active_weekday: derived.mostActiveWeekday, completion_rate: derived.completionRate, average_task_duration_minutes: derived.averageDuration },
    inferred_patterns: derived.patterns,
    priorities: { high_priority_tasks: highPriority, active_goals: goals },
    memory_summary: { count: snapshot.memories?.length ?? 0, high_confidence: memories, correction_count: correctionCount },
    confidence: Math.min(0.98, 0.3 + evidenceConfidence + memoryConfidence + derived.patterns.length * 0.06),
  };
}

export async function getPersonalModel(): Promise<PersonalModel> {
  const [snapshot, behavior] = await Promise.all([getLifeSnapshot(), getRecentBehavior(200)]);
  return buildPersonalModel(snapshot, behavior.data ?? []);
}
