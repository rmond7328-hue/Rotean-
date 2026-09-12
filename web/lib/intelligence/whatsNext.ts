import type { PersonalModel } from "@/lib/intelligence/personalModel";
import type { LifeSnapshot } from "@/lib/intelligence/lifeSnapshot";

export type WhatsNextCandidate = {
  id: string;
  type: "task" | "habit" | "goal" | "free_time";
  title: string;
  duration_minutes: number;
  score: number;
  confidence: number;
  reason: string;
  action: { type: "open_task" | "open_habit" | "open_goal" | "start_focus" | "take_break"; entity_id?: string };
};

export type WhatsNextResult = {
  generated_at: string;
  available_minutes: number;
  next_commitment_at: string | null;
  candidates: WhatsNextCandidate[];
};

const done = (status: string) => status === "completed" || status === "done";
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function minutesUntil(date: string, now: Date) {
  return Math.round((new Date(date).getTime() - now.getTime()) / 60000);
}

function localHour(date: Date, timezone: string) {
  const value = Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", hour12: false }).format(date));
  return value === 24 ? 0 : value;
}

function urgency(dueAt: string | null, now: Date) {
  if (!dueAt) return 0;
  const hours = (new Date(dueAt).getTime() - now.getTime()) / 3600000;
  if (hours <= 0) return 35;
  if (hours <= 4) return 32;
  if (hours <= 24) return 25;
  if (hours <= 72) return 16;
  if (hours <= 168) return 8;
  return 2;
}

function energyFit(taskEnergy: string | null, hour: number, model: PersonalModel) {
  if (!taskEnergy) return 8;
  const activeHour = model.behavioral_patterns.most_active_hour;
  const nearActive = activeHour !== null && Math.abs(activeHour - hour) <= 2;
  if (taskEnergy === "high") return nearActive ? 18 : 7;
  if (taskEnergy === "low") return nearActive ? 7 : 14;
  return 10;
}

export function buildWhatsNext(snapshot: LifeSnapshot, model: PersonalModel, now = new Date()): WhatsNextResult {
  const timezone = snapshot.timezone || "UTC";
  const hour = localHour(now, timezone);
  const upcoming = (snapshot.calendar_events ?? []).filter((event) => new Date(event.ends_at).getTime() > now.getTime()).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const nextEvent = upcoming.find((event) => new Date(event.starts_at).getTime() > now.getTime());
  const availableMinutes = nextEvent ? clamp(minutesUntil(nextEvent.starts_at, now), 0, 24 * 60) : 120;
  const openTasks = (snapshot.tasks ?? []).filter((task) => !done(task.status));
  const candidates: WhatsNextCandidate[] = [];

  for (const task of openTasks) {
    const duration = task.estimated_minutes ?? 30;
    if (duration > availableMinutes && availableMinutes > 0) continue;
    let score = 35 + task.priority * 8 + urgency(task.due_at, now);
    score += energyFit(task.energy_level, hour, model);
    if (task.goal_id) score += 6;
    if (task.project_id) score += 3;
    if (model.behavioral_patterns.most_active_hour !== null && Math.abs(model.behavioral_patterns.most_active_hour - hour) <= 2) score += 6;
    if (duration <= availableMinutes) score += Math.max(0, 12 - Math.round(duration / 10));
    if (duration <= 20 && availableMinutes <= 30) score += 12;
    const overdue = task.due_at ? new Date(task.due_at).getTime() < now.getTime() : false;
    const reason = overdue ? "This is overdue, so it should move ahead of lower-urgency work." : task.due_at ? "Its deadline and priority make it a strong use of this window." : task.priority >= 4 ? "It is high priority and fits the time you have." : "It fits the available window without crowding your next commitment.";
    candidates.push({ id: `task:${task.id}`, type: "task", title: task.title, duration_minutes: duration, score, confidence: clamp(0.55 + (model.confidence * 0.35), 0, 0.95), reason, action: { type: "open_task", entity_id: task.id } });
  }

  for (const habit of snapshot.habits ?? []) {
    const duration = habit.estimated_minutes ?? 15;
    if (duration > availableMinutes && availableMinutes > 0) continue;
    let score = 28 + (habit.energy_level === "low" ? 8 : 0);
    if (habit.preferred_time) {
      const preferredHour = Number(habit.preferred_time.slice(0, 2));
      const distance = Math.abs(preferredHour - hour);
      score += distance <= 1 ? 18 : distance <= 2 ? 10 : 0;
    }
    if (duration <= availableMinutes) score += 8;
    candidates.push({ id: `habit:${habit.id}`, type: "habit", title: habit.title, duration_minutes: duration, score, confidence: clamp(0.5 + model.confidence * 0.35, 0, 0.92), reason: habit.preferred_time ? "Its preferred time is close to now, so this is a good moment to keep the routine." : "It is a short recurring behavior that fits the current window.", action: { type: "open_habit", entity_id: habit.id } });
  }

  for (const goal of (snapshot.goals ?? []).filter((item) => !done(item.status)).slice(0, 6)) {
    const linkedTask = openTasks.some((task) => task.goal_id === goal.id);
    if (!linkedTask && availableMinutes >= 20) {
      candidates.push({ id: `goal:${goal.id}`, type: "goal", title: `Work on ${goal.title}`, duration_minutes: 25, score: 26 + goal.priority * 7 + (goal.target_date ? urgency(`${goal.target_date}T23:59:59`, now) : 0), confidence: clamp(0.45 + model.confidence * 0.4, 0, 0.9), reason: "You have an active goal without an obvious next task, so a short planning or progress session keeps it moving.", action: { type: "open_goal", entity_id: goal.id } });
    }
  }

  if (availableMinutes >= 15) {
    const restScore = model.workload.overdue_tasks > 0 ? 8 : hour >= 21 || hour < 7 ? 24 : 15;
    candidates.push({ id: "free-time:reset", type: "free_time", title: "Take a real break", duration_minutes: Math.min(20, availableMinutes), score: restScore, confidence: 0.7, reason: model.workload.overdue_tasks > 0 ? "There is important work waiting, but a short reset can prevent burning the rest of the window." : "Not every free window needs to become another task. A deliberate reset is a valid choice.", action: { type: "take_break" } });
  }

  candidates.sort((a, b) => b.score - a.score);
  const normalized = candidates.slice(0, 5).map((candidate, index) => ({ ...candidate, score: clamp(Math.round(candidate.score - index * 0.5), 0, 100) }));
  return { generated_at: now.toISOString(), available_minutes: availableMinutes, next_commitment_at: nextEvent?.starts_at ?? null, candidates: normalized };
}
