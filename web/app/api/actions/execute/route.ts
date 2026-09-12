import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { executeActionServer } from "@/lib/actions/executeServer";
import { isExecutableAction, type ExecutableActionType } from "@/lib/actions/registry";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "You need to be signed in." }, { status: 401 });
    const body = await request.json();
    if (!body || typeof body !== "object" || typeof body.type !== "string" || !isExecutableAction(body.type)) return NextResponse.json({ error: "Invalid or non-executable action." }, { status: 400 });
    if (body.confirmed !== true) return NextResponse.json({ error: "This action requires explicit confirmation." }, { status: 409 });
    if (!body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) return NextResponse.json({ error: "Invalid action payload." }, { status: 400 });
    const result = await executeActionServer({ type: body.type as ExecutableActionType, payload: body.payload });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to execute action." }, { status: 400 });
  }
}
