import type { LifeSnapshot } from "@/lib/intelligence/lifeSnapshot";
import type { PersonalModel } from "@/lib/intelligence/personalModel";
import type { WhatsNextResult } from "@/lib/intelligence/whatsNext";
import type { JarvisResponse } from "./phase7-contract";

const intents = ["plan", "ask", "create_task", "update_task", "schedule", "remember", "search", "recommend", "unknown"] as const;

function clean(value: unknown, max = 800) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function buildJarvisContext(snapshot: LifeSnapshot, model: PersonalModel, next: WhatsNextResult) {
  return {
    now: new Date().toISOString(),
    timezone: snapshot.timezone,
    preferences: snapshot.preferences ?? {},
    personal_model: model,
    tasks: (snapshot.tasks ?? []).filter((t) => t.status !== "completed" && t.status !== "done").slice(0, 30).map((t) => ({ id: t.id, title: clean(t.title, 160), status: t.status, priority: t.priority, due_at: t.due_at, duration_minutes: t.duration_minutes, energy_level: t.energy_level, project_id: t.project_id, goal_id: t.goal_id })),
    goals: (snapshot.goals ?? []).filter((g) => g.status !== "completed" && g.status !== "done").slice(0, 15).map((g) => ({ id: g.id, title: clean(g.title, 160), priority: g.priority, target_date: g.target_date, status: g.status })),
    habits: (snapshot.habits ?? []).slice(0, 15).map((h) => ({ id: h.id, title: clean(h.title, 160), preferred_time: h.preferred_time, duration_minutes: h.duration_minutes, frequency: h.frequency })),
    calendar: (snapshot.calendar_events ?? []).slice(0, 20).map((e) => ({ id: e.id, title: clean(e.title, 160), starts_at: e.starts_at, ends_at: e.ends_at, location: clean(e.location, 120) })),
    memories: (snapshot.memories ?? []).filter((m) => m.confidence >= 0.8).slice(0, 20).map((m) => ({ id: m.id, content: clean(m.content, 300), memory_type: m.memory_type, confidence: m.confidence })),
    next: { available_minutes: next.available_minutes, next_commitment_at: next.next_commitment_at, candidates: next.candidates.slice(0, 6) },
  };
}

function heuristicIntent(input: string): JarvisResponse["intent"] {
  const text = input.toLowerCase();
  if (/\b(create|add|make)\b.*\b(task|todo)\b/.test(text)) return "create_task";
  if (/\b(schedule|book|put)\b/.test(text)) return "schedule";
  if (/\b(remember|remember that|don't forget)\b/.test(text)) return "remember";
  if (/\b(recommend|suggest|where should|what should)\b/.test(text)) return "recommend";
  if (/\b(plan|fix my day|organize my day)\b/.test(text)) return "plan";
  if (/\b(update|change|move|reschedule|complete)\b/.test(text)) return "update_task";
  return "ask";
}

export function fallbackJarvis(input: string, next: WhatsNextResult): JarvisResponse {
  const intent = heuristicIntent(input);
  const top = next.candidates[0];
  const message = top
    ? `Based on your current time, workload and commitments, I'd start with “${top.title}” for about ${top.duration_minutes} minutes. ${top.reason}`
    : "I don't have enough current life data to make a strong recommendation yet. Add a task, goal, habit or calendar event and I'll use it to plan with you.";
  return {
    message,
    intent,
    confidence: top ? 0.62 : 0.35,
    actions: top ? [{ type: top.action.type, label: top.action.type === "start_focus" ? `Start ${top.title}` : top.title, requires_confirmation: false, payload: { entity_id: top.action.entity_id ?? top.id } }] : [],
  };
}

export function parseJarvisResponse(value: unknown): JarvisResponse | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const intent = typeof v.intent === "string" && intents.includes(v.intent as (typeof intents)[number]) ? v.intent as JarvisResponse["intent"] : "unknown";
  const message = typeof v.message === "string" ? v.message.trim().slice(0, 4000) : "";
  if (!message) return null;
  const confidence = Math.max(0, Math.min(1, Number(v.confidence) || 0));
  const actions = Array.isArray(v.actions) ? v.actions.filter((a): a is Record<string, unknown> => !!a && typeof a === "object").slice(0, 8).map((a) => ({ type: clean(a.type, 80), label: clean(a.label, 200), requires_confirmation: Boolean(a.requires_confirmation), payload: typeof a.payload === "object" && a.payload !== null ? a.payload as Record<string, unknown> : undefined })) : [];
  return { message, intent, confidence, actions };
}
