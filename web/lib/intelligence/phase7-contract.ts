import type { LifeSnapshot } from "@/lib/intelligence/lifeSnapshot";
import type { PersonalModel } from "@/lib/intelligence/personalModel";
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

export type JarvisActionType =
  | "open_task"
  | "open_goal"
  | "open_habit"
  | "start_focus"
  | "take_break"
  | "create_task"
  | "update_task"
  | "schedule_event"
  | "save_memory"
  | "search";

export type JarvisAction = {
  type: JarvisActionType | string;
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

export type JarvisContextInput = {
  generated_at: string;
  now: RoteanContext["now"];
  timezone: string;
  model: PersonalModel;
  life: Pick<LifeSnapshot, "preferences" | "tasks" | "projects" | "goals" | "habits" | "notes" | "memories" | "calendar_events">;
};

export function createPhase7Context(context: RoteanContext, snapshot?: LifeSnapshot): JarvisContextInput {
  const life: JarvisContextInput["life"] = snapshot
    ? {
        preferences: snapshot.preferences,
        tasks: snapshot.tasks,
        projects: snapshot.projects,
        goals: snapshot.goals,
        habits: snapshot.habits,
        notes: snapshot.notes,
        memories: snapshot.memories,
        calendar_events: snapshot.calendar_events,
      }
    : {
        preferences: null,
        tasks: context.open_tasks,
        projects: [],
        goals: context.active_goals,
        habits: [],
        notes: [],
        memories: [],
        calendar_events: context.upcoming_events,
      };

  return {
    generated_at: context.generated_at,
    now: context.now,
    timezone: context.now.timezone,
    model: context.model,
    life,
  };
}
