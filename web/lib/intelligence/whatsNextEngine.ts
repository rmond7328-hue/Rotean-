import type { PersonalModel } from "@/lib/intelligence/personalModel";
import type { LifeSnapshot } from "@/lib/intelligence/lifeSnapshot";
import type { WhatsNextCandidate, WhatsNextResult } from "@/lib/intelligence/whatsNext";

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const done = (status: string) => status === "completed" || status === "done";

function minutesUntil(value: string, now: Date) { return Math.round((new Date(value).getTime() - now.getTime()) / 60000); }
function hourInTimezone(date: Date, timezone: string) {
  const value = Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", hour12: false }).format(date));
  return value === 24 ? 0 : value;
}
function deadlineScore(value: string | null | undefined, now: Date) {
  if (!value) return 0;
  const hours = (new Date(value).getTime() - now.getTime()) / 3600000;
  if (hours <= 0) return 38;
  if (hours <= 4) return 34;
  if (hours <= 24) return 27;
  if (hours <= 72) return 18;
  if (hours <= 168) return 9;
  return 2;
}

function baseConfidence(model: PersonalModel, evidence: number) { return clamp(0.42 + model.confidence * 0.38 + evidence * 0.05, 0.45, 0.96); }
function reasonForTask(task: NonNullable<LifeSnapshot["tasks"]>[number], now: Date, available: number, activeHour: boolean) {
  const overdue = Boolean(task.due_at && new Date(task.due_at).getTime() <= now.getTime());
  if (overdue) return "It is overdue and fits the window, so clearing it reduces pressure.";
  if (task.due_at && deadlineScore(task.due_at, now) >= 27) return "Its deadline is close enough to matter now, and it fits before your next commitment.";
  if (task.priority >= 4 && activeHour) return "It is high priority and you are in one of your stronger working periods.";
  if ((task.estimated_minutes ?? 30) <= Math.max(20, Math.floor(available * 0.6))) return "It is a contained piece of work that fits comfortably in the time available.";
  return "It is a useful next step that fits the time available without colliding with your next commitment.";
}

export function rankWhatsNext(snapshot: LifeSnapshot, model: PersonalModel, now = new Date()): WhatsNextResult {
  const timezone = snapshot.timezone || "Africa/Lagos";
  const hour = hourInTimezone(now, timezone);
  const activeHour = model.behavioral_patterns.most_active_hour;
  const isActiveHour = activeHour !== null && Math.abs(activeHour - hour) <= 2;
  const events = (snapshot.calendar_events ?? []).filter((event) => new Date(event.ends_at).getTime() > now.getTime()).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const next = events.find((event) => new Date(event.starts_at).getTime() > now.getTime());
  const available = next ? Math.max(0, Math.min(24 * 60, minutesUntil(next.starts_at, now))) : 120;
  const candidates: WhatsNextCandidate[] = [];

  for (const task of (snapshot.tasks ?? []).filter((item) => !done(item.status))) {
    const duration = Math.max(5, task.estimated_minutes ?? 30);
    if (available > 0 && duration > available) continue;
    let score = 30 + task.priority * 9 + deadlineScore(task.due_at, now);
    if (task.goal_id) score += 8;
    if (task.project_id) score += 3;
    if (isActiveHour && task.energy_level === "high") score += 12;
    if (!isActiveHour && task.energy_level === "low") score += 8;
    if (duration <= available) score += 8;
    if (available <= 30 && duration <= available) score += 12;
    candidates.push({ id: `task:${task.id}`, type: "task", title: task.title, duration_minutes: duration, score: clamp(score), confidence: baseConfidence(model, task.goal_id ? 2 : 1), reason: reasonForTask(task, now, available, isActiveHour), action: { type: "open_task", entity_id: task.id } });
  }

  for (const habit of snapshot.habits ?? []) {
    const duration = Math.max(5, habit.estimated_minutes ?? 15);
    if (available > 0 && duration > available) continue;
    let score = 27;
    if (habit.preferred_time) {
      const preferred = Number(habit.preferred_time.slice(0, 2));
      const distance = Math.abs(preferred - hour);
      score += distance <= 1 ? 20 : distance <= 2 ? 10 : 0;
    }
    if (habit.energy_level === "low" && !isActiveHour) score += 8;
    if (duration <= available) score += 7;
    candidates.push({ id: `habit:${habit.id}`, type: "habit", title: habit.title, duration_minutes: duration, score: clamp(score), confidence: baseConfidence(model, habit.preferred_time ? 2 : 0), reason: habit.preferred_time ? "Its preferred time is close to now, making this a natural point to keep the routine." : "It is a short recurring behavior that fits the available window.", action: { type: "open_habit", entity_id: habit.id } });
  }

  for (const goal of (snapshot.goals ?? []).filter((item) => !done(item.status)).slice(0, 8)) {
    if (snapshot.tasks?.some((task) => !done(task.status) && task.goal_id === goal.id)) continue;
    if (available < 20) continue;
    let score = 24 + goal.priority * 8 + (goal.target_date ? deadlineScore(`${goal.target_date}T23:59:59`, now) : 0);
    candidates.push({ id: `goal:${goal.id}`, type: "goal", title: `Move ${goal.title} forward`, duration_minutes: 25, score: clamp(score), confidence: baseConfidence(model, goal.target_date ? 2 : 0), reason: "This goal has no obvious open task attached to it, so a short progress session prevents it from becoming invisible.", action: { type: "open_goal", entity_id: goal.id } });
  }

  if (available >= 15) {
    const late = hour >= 21 || hour < 7;
    const restScore = model.workload.overdue_tasks > 0 ? 10 : late ? 28 : 17;
    candidates.push({ id: "free-time:reset", type: "free_time", title: "Take a real break", duration_minutes: Math.min(20, available), score: restScore, confidence: 0.72, reason: late ? "It is late enough that protecting recovery may be more useful than forcing another task." : "A free window does not always need to become work. A deliberate reset is a valid choice.", action: { type: "take_break" } });
  }

  candidates.sort((a, b) => b.score - a.score || a.duration_minutes - b.duration_minutes);
  const top = candidates.slice(0, 6).map((candidate, index) => ({ ...candidate, score: clamp(Math.round(candidate.score - index * 0.75)) }));
  return { generated_at: now.toISOString(), available_minutes: available, next_commitment_at: next?.starts_at ?? null, candidates: top };
}
