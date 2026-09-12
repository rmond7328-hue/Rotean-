import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRecentBehaviorServer } from "@/lib/intelligence/behavior";
import { buildPersonalModel } from "@/lib/intelligence/personalModel";
import { getServerLifeSnapshot } from "@/lib/intelligence/serverSnapshot";
import { buildWhatsNext } from "@/lib/intelligence/whatsNext";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "You need to be signed in." }, { status: 401 });
    const [snapshot, behavior] = await Promise.all([getServerLifeSnapshot(), getRecentBehaviorServer(200)]);
    if (behavior.error) throw new Error(behavior.error.message);
    const model = buildPersonalModel(snapshot, behavior.data ?? []);
    return NextResponse.json({ context: { timezone: snapshot.timezone, model_confidence: model.confidence }, result: buildWhatsNext(snapshot, model) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to decide what is next." }, { status: 500 });
  }
}
