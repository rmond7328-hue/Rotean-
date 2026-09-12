import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "You need to be signed in." }, { status: 401 });
    const body = await request.json() as { recommendation_id?: string; rating?: "accepted" | "rejected" | "dismissed" };
    if (!body.recommendation_id || !body.rating) return NextResponse.json({ error: "Recommendation and rating are required." }, { status: 400 });
    const { error } = await supabase.from("behavior_signals").insert({ user_id: auth.user.id, signal_type: "recommendation_feedback", entity_id: null, metadata: { recommendation_id: body.recommendation_id, rating: body.rating }, occurred_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to record feedback." }, { status: 500 });
  }
}
