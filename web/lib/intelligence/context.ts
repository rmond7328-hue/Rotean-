import { getLifeSnapshot } from "@/lib/intelligence/lifeSnapshot";
import { getRecentBehavior } from "@/lib/intelligence/behavior";
import { buildPersonalModel, type PersonalModel } from "@/lib/intelligence/personalModel";

export type RoteanContext = { generated_at: string; model: PersonalModel; now: { iso: string; timezone: string; day_of_week: string }; upcoming_events: NonNullable<Awaited<ReturnType<typeof getLifeSnapshot>>["calendar_events"]>; open_tasks: NonNullable<Awaited<ReturnType<typeof getLifeSnapshot>>["tasks"]>; active_goals: NonNullable<Awaited<ReturnType<typeof getLifeSnapshot>>["goals"]>; };

export async function getRoteanContext(): Promise<RoteanContext> {
  const [snapshot, behavior] = await Promise.all([getLifeSnapshot(), getRecentBehavior(100)]);
  const model = buildPersonalModel(snapshot, behavior.data ?? []);
  const timezone = typeof snapshot.preferences?.timezone === "string" ? snapshot.preferences.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone;
  return { generated_at: new Date().toISOString(), model, now: { iso: new Date().toISOString(), timezone, day_of_week: new Intl.DateTimeFormat("en", { weekday: "long", timeZone: timezone }).format(new Date()) }, upcoming_events: snapshot.calendar_events ?? [], open_tasks: (snapshot.tasks ?? []).filter((t) => t.status !== "completed" && t.status !== "done"), active_goals: (snapshot.goals ?? []).filter((g) => g.status !== "completed") };
}
