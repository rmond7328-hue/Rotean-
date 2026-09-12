import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRecentBehaviorServer } from "@/lib/intelligence/behavior";
import { buildPersonalModel } from "@/lib/intelligence/personalModel";
import { getServerLifeSnapshot } from "@/lib/intelligence/serverSnapshot";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "You need to be signed in." }, { status: 401 });
    const [snapshot, behavior] = await Promise.all([getServerLifeSnapshot(), getRecentBehaviorServer(200)]);
    if (behavior.error) throw new Error(behavior.error.message);
    return NextResponse.json({ model: buildPersonalModel(snapshot, behavior.data ?? []) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to build personal model." }, { status: 500 });
  }
}
