import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile } from "@/lib/auth/profile";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || !profile.onboarding_completed) redirect("/onboarding");
  return <AppShell>{children}</AppShell>;
}
