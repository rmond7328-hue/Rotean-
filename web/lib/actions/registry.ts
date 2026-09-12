import type { JarvisActionType } from "@/lib/intelligence/phase7-contract";

export const EXECUTABLE_ACTIONS = ["create_task", "update_task", "schedule_event", "save_memory"] as const;
export type ExecutableActionType = (typeof EXECUTABLE_ACTIONS)[number];

export type ActionRequest = {
  type: ExecutableActionType;
  payload: Record<string, unknown>;
};

export type ActionResult = {
  type: ExecutableActionType;
  entity_id: string;
  message: string;
};

export function isExecutableAction(type: JarvisActionType | string): type is ExecutableActionType {
  return (EXECUTABLE_ACTIONS as readonly string[]).includes(type);
}

export function requireString(payload: Record<string, unknown>, key: string, max = 500) {
  const value = payload[key];
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error(`Invalid ${key}.`);
  return value.trim();
}

export function optionalString(payload: Record<string, unknown>, key: string, max = 2000) {
  const value = payload[key];
  if (value == null) return undefined;
  if (typeof value !== "string" || value.length > max) throw new Error(`Invalid ${key}.`);
  return value.trim() || undefined;
}

export function optionalNumber(payload: Record<string, unknown>, key: string, min: number, max: number) {
  const value = payload[key];
  if (value == null) return undefined;
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || number < min || number > max) throw new Error(`Invalid ${key}.`);
  return number;
}

export function requireIsoDate(payload: Record<string, unknown>, key: string) {
  const value = requireString(payload, key, 100);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${key}.`);
  return date.toISOString();
}
