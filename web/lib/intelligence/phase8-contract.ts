import type { JarvisAction } from "./phase7-contract";

/** Phase 8 will turn approved proposals into authenticated application actions. */
export type ExecutableActionType =
  | "create_task"
  | "update_task"
  | "schedule_event"
  | "save_memory"
  | "complete_task"
  | "create_note"
  | "set_reminder"
  | "search";

export type ApprovedAction = JarvisAction & {
  type: ExecutableActionType;
  confirmation_token?: string;
};

export type ActionResult = {
  ok: boolean;
  action_type: string;
  entity_id?: string;
  message: string;
};

/** Phase 8 invariant: every state-changing action is authenticated, validated and explicitly approved. */
export function requiresExplicitApproval(action: JarvisAction) {
  return action.requires_confirmation || ["create_task", "update_task", "schedule_event", "save_memory", "complete_task", "create_note", "set_reminder"].includes(action.type);
}
