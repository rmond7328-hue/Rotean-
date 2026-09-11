import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[0_20px_60px_rgba(23,33,27,0.06)] sm:p-9">
          <div className="mb-8">
            <div className="text-xl font-semibold tracking-[-0.04em]">rotean</div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--green)]">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Your life, intelligently managed.</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Sign in to continue to your personal Rotean workspace.</p>
          </div>
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
