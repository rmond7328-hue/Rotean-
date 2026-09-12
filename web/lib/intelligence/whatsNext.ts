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
export type WhatsNextResult = { generated_at: string; available_minutes: number; next_commitment_at: string | null; candidates: WhatsNextCandidate[] };

export { rankWhatsNext } from "./whatsNextEngine";

export function buildWhatsNext(snapshot: LifeSnapshot, model: PersonalModel, now = new Date()): WhatsNextResult {
  // Compatibility wrapper retained for existing imports. The hardened engine is authoritative.
  return require("./whatsNextEngine").rankWhatsNext(snapshot, model, now) as WhatsNextResult;
}
