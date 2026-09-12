"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const nav = [
  { href: "/app", label: "Today", icon: "⌂" },
  { href: "/app/tasks", label: "Tasks", icon: "✓" },
  { href: "/app/calendar", label: "Calendar", icon: "▦" },
  { href: "/app/goals", label: "Goals", icon: "◌" },
  { href: "/app/projects", label: "Projects", icon: "▱" },
  { href: "/app/habits", label: "Habits", icon: "↗" },
  { href: "/app/notes", label: "Notes", icon: "□" },
  { href: "/app/memory", label: "Memory", icon: "◇" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-[var(--line)] bg-[var(--surface)] lg:flex lg:flex-col">
      <div className="flex h-20 items-center px-7"><Link href="/app" className="text-xl font-semibold tracking-[-0.035em]">rotean<span className="text-[var(--lime)]">.</span></Link></div>
      <nav className="flex-1 overflow-y-auto px-4 py-5"><p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Your life</p><div className="space-y-1">{nav.map(item=>{const active=pathname===item.href||(item.href!=="/app"&&pathname.startsWith(item.href));return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active?"bg-[var(--soft-green)] text-[var(--green)]":"text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--ink)]"}`}><span className="flex h-7 w-7 items-center justify-center rounded-lg border border-current/10 text-sm">{item.icon}</span>{item.label}</Link>})}</div><p className="px-3 pb-3 pt-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Intelligence</p><Link href="/app/whats-next" className="flex items-center gap-3 rounded-xl bg-[var(--green)] px-3 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(23,77,58,0.14)]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">✦</span>What’s next?</Link><Link href="/app/jarvis" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--ink)]"><span className="flex h-7 w-7 items-center justify-center rounded-lg border border-current/10">◉</span>JARVIS</Link></nav>
      <div className="border-t border-[var(--line)] p-4"><Link href="/app/profile" className="flex items-center gap-3 rounded-xl p-2 hover:bg-[var(--background)]"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--green)] text-xs font-bold text-white">R</span><span className="min-w-0"><span className="block truncate text-sm font-semibold">Your profile</span><span className="block truncate text-xs text-[var(--muted)]">Personal context</span></span></Link></div>
    </aside>
    <main className="min-h-screen lg:pl-[248px]"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--line)] bg-[var(--background)]/90 px-5 backdrop-blur-md sm:px-8 lg:px-10"><div className="lg:hidden"><Link href="/app" className="text-lg font-semibold tracking-[-0.035em]">rotean<span className="text-[var(--lime)]">.</span></Link></div><div className="hidden lg:block"><p className="text-xs font-medium text-[var(--muted)]">Personal operating system</p></div><div className="flex items-center gap-2"><Link href="/app/jarvis" className="flex h-9 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-semibold shadow-sm hover:border-[var(--green)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]"/>Ask Rotean</Link><Link href="/app/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--green)] text-xs font-bold text-white">R</Link></div></header><div className="mx-auto w-full max-w-[1440px] px-5 pb-28 pt-7 sm:px-8 lg:px-10 lg:pb-10">{children}</div></main>
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--surface)]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg lg:hidden"><div className="mx-auto flex max-w-lg items-center justify-around">{nav.slice(0,5).map(item=>{const active=pathname===item.href||(item.href!=="/app"&&pathname.startsWith(item.href));return <Link key={item.href} href={item.href} className={`flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold ${active?"text-[var(--green)]":"text-[var(--muted)]"}`}><span className="text-base">{item.icon}</span>{item.label}</Link>})}</div></nav>
  </div>
}
