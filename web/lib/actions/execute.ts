import { createClient } from "@/lib/supabase/client";
import { recordBehavior } from "@/lib/intelligence/behavior";
import { createTask, updateTask, createCalendarEvent, updateCalendarEvent, createMemory } from "@/lib/data/life";
import { isExecutableAction, requireIsoDate, requireString, optionalNumber, optionalString, type ActionRequest, type ActionResult } from "./registry";

const getUser = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You need to be signed in.");
  return data.user;
};

export async function executeAction(request: ActionRequest): Promise<ActionResult> {
  const user = await getUser();
  if (!isExecutableAction(request.type)) throw new Error("Action is not executable.");
  const payload = request.payload ?? {};

  if (request.type === "create_task") {
    const result = await createTask({
      title: requireString(payload, "title", 300),
      description: optionalString(payload, "description"),
      priority: optionalNumber(payload, "priority", 1, 5),
      estimated_minutes: optionalNumber(payload, "estimated_minutes", 1, 1440),
      due_at: payload.due_at == null ? null : requireIsoDate(payload, "due_at"),
      energy_level: optionalString(payload, "energy_level", 30),
      project_id: optionalString(payload, "project_id", 100),
      goal_id: optionalString(payload, "goal_id", 100),
    });
    if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to create task.");
    await recordBehavior({ type: "action_executed", entity_id: result.data.id, metadata: { action: request.type } }).catch(() => undefined);
    return { type: request.type, entity_id: result.data.id, message: `Created task “${result.data.title}”.` };
  }

  if (request.type === "update_task") {
    const id = requireString(payload, "task_id", 100);
    const patch: Record<string, unknown> = {};
    for (const key of ["title", "description", "status", "energy_level", "project_id", "goal_id"] as const) {
      const value = payload[key];
      if (value !== undefined) patch[key] = typeof value === "string" ? value.trim() : value;
    }
    if (payload.priority !== undefined) patch.priority = optionalNumber(payload, "priority", 1, 5);
    if (payload.estimated_minutes !== undefined) patch.estimated_minutes = optionalNumber(payload, "estimated_minutes", 1, 1440);
    if (payload.due_at !== undefined) patch.due_at = payload.due_at === null ? null : requireIsoDate(payload, "due_at");
    if (payload.actual_minutes !== undefined) patch.actual_minutes = optionalNumber(payload, "actual_minutes", 1, 1440);
    if (!Object.keys(patch).length) throw new Error("No task changes supplied.");
    const result = await updateTask(id, patch);
    if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to update task.");
    await recordBehavior({ type: "action_executed", entity_id: result.data.id, metadata: { action: request.type } }).catch(() => undefined);
    return { type: request.type, entity_id: result.data.id, message: `Updated task “${result.data.title}”.` };
  }

  if (request.type === "schedule_event") {
    const title = requireString(payload, "title", 300);
    const starts_at = requireIsoDate(payload, "starts_at");
    const ends_at = requireIsoDate(payload, "ends_at");
    if (new Date(ends_at).getTime() <= new Date(starts_at).getTime()) throw new Error("Event end must be after its start.");
    const result = await createCalendarEvent({ title, description: optionalString(payload, "description"), starts_at, ends_at, location_name: optionalString(payload, "location_name", 300), all_day: payload.all_day === true });
    if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to schedule event.");
    await recordBehavior({ type: "action_executed", entity_id: result.data.id, metadata: { action: request.type } }).catch(() => undefined);
    return { type: request.type, entity_id: result.data.id, message: `Scheduled “${result.data.title}”.` };
  }

  if (request.type === "save_memory") {
    const result = await createMemory({ content: requireString(payload, "content", 2000), memory_type: optionalString(payload, "memory_type", 50), source: "jarvis", importance: optionalNumber(payload, "importance", 1, 5), confidence: optionalNumber(payload, "confidence", 0, 1) });
    if (result.error || !result.data) throw new Error(result.error?.message ?? "Unable to save memory.");
    await recordBehavior({ type: "action_executed", entity_id: result.data.id, metadata: { action: request.type } }).catch(() => undefined);
    return { type: request.type, entity_id: result.data.id, message: "Saved that to memory." };
  }

  throw new Error("Unsupported action.");
}
