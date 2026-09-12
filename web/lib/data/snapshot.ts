import { createClient } from "@/lib/supabase/client";

export async function getLifeSnapshot() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("You need to be signed in.");
  const [tasks, projects, goals, habits, notes, memories] = await Promise.all([
    supabase.from("tasks").select("*").order("due_at", { ascending: true, nullsFirst: false }),
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("goals").select("*").order("priority", { ascending: false }),
    supabase.from("habits").select("*").eq("active", true).order("title"),
    supabase.from("notes").select("*").order("updated_at", { ascending: false }).limit(50),
    supabase.from("memories").select("*").order("importance", { ascending: false }).order("updated_at", { ascending: false }).limit(100),
  ]);
  const error = [tasks, projects, goals, habits, notes, memories].find((result) => result.error)?.error;
  if (error) throw error;
  return { tasks: tasks.data ?? [], projects: projects.data ?? [], goals: goals.data ?? [], habits: habits.data ?? [], notes: notes.data ?? [], memories: memories.data ?? [], captured_at: new Date().toISOString() };
}
