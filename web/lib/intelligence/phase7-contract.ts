import type { RoteanContext } from "@/lib/intelligence/context";

/** Phase 7 boundary: AI interprets context; deterministic engines remain authoritative for state and ranking. */
export type JarvisIntent =
  | "plan"
  | "ask"
  | "create_task"
  | "update_task"
  | "schedule"
  | "remember"
  | "search"
  | "recommend"
  | "unknown";

export type JarvisAction = {
  type: string;
  label: string;
  requires_confirmation: boolean;
  payload?: Record<string, unknown>;
};

export type JarvisResponse = {
  message: string;
  intent: JarvisIntent;
  confidence: number;
  actions: JarvisAction[];
};

export type JarvisContextInput = Pick<RoteanContext, "generated_at" | "model" | "now" | "upcoming_events" | "open_tasks" | "active_goals">;

export function createPhase7Context(context: RoteanContext): JarvisContextInput {
  return {
    generated_at: context.generated_at,
    model: context.model,
    now: context.now,
    upcoming_events: context.upcoming_events,
    open_tasks: context.open_tasks,
    active_goals: context.active_goals,
  };
}
