import { NextResponse } from "next/server";
import { getPersonalModel } from "@/lib/intelligence/personalModel";

export async function GET() {
  try {
    return NextResponse.json({ model: await getPersonalModel() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to build personal model.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
