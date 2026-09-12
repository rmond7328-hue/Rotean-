import { NextResponse } from "next/server";
import { getRoteanContext } from "@/lib/intelligence/context";

export async function GET() {
  try { return NextResponse.json(await getRoteanContext()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to build Rotean context." }, { status: 500 }); }
}
