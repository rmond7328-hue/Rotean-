import type { PersonalModel } from "@/lib/intelligence/personalModel";
import type { LifeSnapshot } from "@/lib/intelligence/lifeSnapshot";
import { rankWhatsNext } from "./whatsNextEngine";

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

export { rankWhatsNext };

/** Backwards-compatible name for existing callers. */
export function buildWhatsNext(snapshot: LifeSnapshot, model: PersonalModel, now = new Date()): WhatsNextResult {
  return rankWhatsNext(snapshot, model, now);
}
