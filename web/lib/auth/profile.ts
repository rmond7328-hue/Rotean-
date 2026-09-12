import { createClient } from "@/lib/supabase/server";

export type RoteanProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  onboarding_completed: boolean;
};

export async function getCurrentProfile() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase.from("profiles").select("id,display_name,username,avatar_url,timezone,locale,onboarding_completed").eq("id", auth.user.id).maybeSingle();
  if (error) throw error;
  return data as RoteanProfile | null;
}
