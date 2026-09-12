import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "You need to be signed in." }, { status: 401 });

    const body = await request.json();
    const pattern = typeof body.pattern === "string" ? body.pattern.trim().slice(0, 300) : "";
    const correction = typeof body.correction === "string" ? body.correction.trim().slice(0, 500) : "";
    if (!pattern || !correction) return NextResponse.json({ error: "Pattern and correction are required." }, { status: 400 });

    const { data, error } = await supabase.from("memories").insert({
      user_id: auth.user.id,
      memory_type: "preference",
      content: correction,
      source: "correction",
      importance: 5,
      confidence: 1,
    }).select().single();
    if (error) throw error;

    await supabase.from("behavior_signals").insert({
      user_id: auth.user.id,
      signal_type: "pattern_correction",
      metadata: { pattern, correction },
      occurred_at: new Date().toISOString(),
    });

    return NextResponse.json({ memory: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save correction." }, { status: 500 });
  }
}
