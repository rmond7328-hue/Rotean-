import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const defaults = {
  planning_style: "balanced",
  location_permission: false,
  calendar_permission: false,
  notification_preferences: { enabled: true },
  preferred_work_times: { start: "09:00", end: "17:00" },
  energy_pattern: { default: "medium" },
  budget_preferences: {},
};

export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [profile, preferences] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle(),
    supabase.from("user_preferences").select("*").eq("user_id", auth.user.id).maybeSingle(),
  ]);
  if (profile.error) return NextResponse.json({ error: profile.error.message }, { status: 500 });
  if (preferences.error) return NextResponse.json({ error: preferences.error.message }, { status: 500 });
  return NextResponse.json({ profile: profile.data, preferences: preferences.data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const displayName = typeof body.display_name === "string" ? body.display_name.trim().slice(0, 80) : "";
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30) || null : null;
  const timezone = typeof body.timezone === "string" && body.timezone.length <= 80 ? body.timezone : "UTC";
  const locale = typeof body.locale === "string" && body.locale.length <= 20 ? body.locale : "en-NG";

  const profilePayload = {
    id: auth.user.id,
    display_name: displayName || (typeof auth.user.user_metadata?.full_name === "string" ? auth.user.user_metadata.full_name.slice(0, 80) : null),
    username,
    timezone,
    locale,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };

  const preferencesPayload = {
    user_id: auth.user.id,
    ...defaults,
    ...(body.preferences && typeof body.preferences === "object" ? body.preferences : {}),
    updated_at: new Date().toISOString(),
  };

  const [profile, preferences] = await Promise.all([
    supabase.from("profiles").upsert(profilePayload, { onConflict: "id" }).select("*").single(),
    supabase.from("user_preferences").upsert(preferencesPayload, { onConflict: "user_id" }).select("*").single(),
  ]);

  if (profile.error) return NextResponse.json({ error: profile.error.message }, { status: 400 });
  if (preferences.error) return NextResponse.json({ error: preferences.error.message }, { status: 400 });
  return NextResponse.json({ profile: profile.data, preferences: preferences.data });
}
