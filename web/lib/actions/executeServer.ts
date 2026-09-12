import { createClient } from "@/lib/supabase/server";
import { createTask, updateTask, createCalendarEvent, createMemory } from "@/lib/data/life";
import type { ActionRequest, ActionResult } from "./registry";
import { isExecutableAction, requireIsoDate, requireString, optionalNumber, optionalString } from "./registry";

export async function executeActionServer(request: ActionRequest): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You need to be signed in.");
  if (!isExecutableAction(request.type)) throw new Error("Action is not executable.");
  const p = request.payload ?? {};

  if (request.type === "create_task") {
    const result = await supabase.from("tasks").insert({ user_id: data.user.id, title: requireString(p, "title", 300), description: optionalString(p, "description") ?? null, priority: optionalNumber(p, "priority", 1, 5) ?? 3, estimated_minutes: optionalNumber(p, "estimated_minutes", 1, 1440) ?? null, due_at: p.due_at == null ? null : requireIsoDate(p, "due_at"), energy_level: optionalString(p, "energy_level", 30) ?? null, project_id: optionalString(p, "project_id", 100) ?? null, goal_id: optionalString(p, "goal_id", 100) ?? null, status: "todo", context_tags: [] }).select().single();
    if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to create task.");
    return { type: request.type, entity_id: result.data.id, message: `Created task “${result.data.title}”.` };
  }
  if (request.type === "update_task") {
    const id = requireString(p, "task_id", 100); const patch: Record<string, unknown> = {};
    for (const key of ["title", "description", "status", "energy_level", "project_id", "goal_id"] as const) if (p[key] !== undefined) patch[key] = p[key];
    if (p.priority !== undefined) patch.priority = optionalNumber(p, "priority", 1, 5);
    if (p.estimated_minutes !== undefined) patch.estimated_minutes = optionalNumber(p, "estimated_minutes", 1, 1440);
    if (p.due_at !== undefined) patch.due_at = p.due_at === null ? null : requireIsoDate(p, "due_at");
    if (!Object.keys(patch).length) throw new Error("No task changes supplied.");
    const result = await supabase.from("tasks").update(patch).eq("id", id).eq("user_id", data.user.id).select().single();
    if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to update task.");
    return { type: request.type, entity_id: result.data.id, message: `Updated task “${result.data.title}”.` };
  }
  if (request.type === "schedule_event") {
    const starts_at = requireIsoDate(p, "starts_at"); const ends_at = requireIsoDate(p, "ends_at");
    if (new Date(ends_at).getTime() <= new Date(starts_at).getTime()) throw new Error("Event end must be after its start.");
    const result = await supabase.from("calendar_events").insert({ user_id: data.user.id, title: requireString(p, "title", 300), description: optionalString(p, "description") ?? null, starts_at, ends_at, location_name: optionalString(p, "location_name", 300) ?? null, all_day: p.all_day === true, source: "rotean" }).select().single();
    if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to schedule event.");
    return { type: request.type, entity_id: result.data.id, message: `Scheduled “${result.data.title}”.` };
  }
  if (request.type === "save_memory") {
    const result = await supabase.from("memories").insert({ user_id: data.user.id, content: requireString(p, "content", 2000), memory_type: optionalString(p, "memory_type", 50) ?? "preference", source: "jarvis", importance: optionalNumber(p, "importance", 1, 5) ?? 3, confidence: optionalNumber(p, "confidence", 0, 1) ?? 1 }).select().single();
    if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to save memory.");
    return { type: request.type, entity_id: result.data.id, message: "Saved that to memory." };
  }
  throw new Error("Unsupported action.");
}
