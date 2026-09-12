import { NextResponse } from "next/server";
import { recordBehaviorServer } from "@/lib/intelligence/behavior.server";

const allowed = new Set(["task_completed", "task_deferred", "habit_completed", "habit_skipped", "note_created", "goal_created", "project_created"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body?.type !== "string" || !allowed.has(body.type)) return NextResponse.json({ error: "Invalid behavior signal." }, { status: 400 });
    const { data, error } = await recordBehaviorServer({ type: body.type, entity_id: typeof body.entity_id === "string" ? body.entity_id : null, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {} });
    if (error) throw error;
    return NextResponse.json({ signal: data }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to record behavior." }, { status: 500 }); }
}
