import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerLifeSnapshot } from "@/lib/intelligence/serverSnapshot";
import { getRecentBehaviorServer } from "@/lib/intelligence/serverBehavior";
import { buildPersonalModel } from "@/lib/intelligence/personalModel";
import { rankWhatsNext } from "@/lib/intelligence/whatsNextEngine";
import { buildJarvisContext, fallbackJarvis, parseJarvisResponse } from "@/lib/intelligence/jarvis";

const MODEL = "gemini-2.5-flash";
const SYSTEM = `You are Rotean Intelligence, a calm personal life operating system. You help the user understand and manage their life. Use the supplied context, but never invent facts. Be concise, practical and human. The deterministic What's Next result is authoritative for ranking recommendations; do not override it with invented priorities. AI interprets context and proposes actions; it does not execute actions. Return ONLY valid JSON matching this shape: {"message":string,"intent":"plan|ask|create_task|update_task|schedule|remember|search|recommend|unknown","confidence":number,"actions":[{"type":string,"label":string,"requires_confirmation":boolean,"payload":object}]}. Consequential actions such as changing schedules, deleting/completing data, sending messages, making purchases or external commitments must have requires_confirmation=true. Keep actions to 4 or fewer.`;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "You need to be signed in." }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const input = typeof body.input === "string" ? body.input.trim().slice(0, 2000) : "";
    if (!input) return NextResponse.json({ error: "Tell Rotean what you need." }, { status: 400 });

    const [snapshot, behavior] = await Promise.all([getServerLifeSnapshot(), getRecentBehaviorServer(200)]);
    if (behavior.error) throw new Error(behavior.error.message);
    const model = buildPersonalModel(snapshot, behavior.data ?? []);
    const next = rankWhatsNext(snapshot, model);
    const context = buildJarvisContext(snapshot, model, next);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ response: fallbackJarvis(input, next), source: "deterministic-fallback" });

    const gemini = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: `USER REQUEST:\n${input}\n\nROTEAN CONTEXT:\n${JSON.stringify(context)}` }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json", maxOutputTokens: 1000 },
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!gemini.ok) throw new Error(`Gemini request failed (${gemini.status}).`);
    const data = await gemini.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { parsed = null; }
    const response = parseJarvisResponse(parsed);
    if (!response) return NextResponse.json({ response: fallbackJarvis(input, next), source: "deterministic-fallback" });
    return NextResponse.json({ response, source: "gemini", context: { model_confidence: model.confidence, available_minutes: next.available_minutes } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Rotean could not process that request." }, { status: 500 });
  }
}
