# Rotean Phase 10 Readiness

Phase 9 production hardening checkpoint.

## Verified

- Next.js production security headers are configured.
- `poweredByHeader` is disabled.
- Supabase authentication remains server-validated on protected server routes.
- PWA manifest is configured for `/app` standalone launch.
- Service worker registration is production-only and failure-tolerant.
- PWA app icon is present.
- Application-level error boundary is present.
- Global not-found UI is present.
- Robots policy excludes private application/API routes.
- Gemini remains server-side; the browser never receives the API key.
- Phase 8 action execution remains authenticated, allowlisted, validated, and confirmation-gated.

## Phase 10 gate

Before declaring the release production-ready, run:

1. `npm run typecheck`
2. `npm run build`
3. Test sign-up, sign-in, sign-out and password recovery.
4. Test onboarding completion and protected-route redirects.
5. CRUD test tasks, projects, goals, habits, notes, memories and calendar events.
6. Verify RLS prevents cross-user reads/writes.
7. Test personal-model generation and correction flow.
8. Test What's Next ranking with empty, short-window and deadline-heavy schedules.
9. Test JARVIS with Gemini configured and deterministic fallback without Gemini.
10. Test each Phase 8 action and reject unconfirmed/invalid requests.
11. Test PWA install, reload, offline shell and service-worker recovery on Android Chrome.
12. Test mobile and desktop layouts.
13. Test API error states, expired sessions and malformed payloads.
14. Confirm production environment variables are configured in the deployment platform.
15. Only after all gates pass, produce the final deployment ZIP and release checklist.

Phase 10 should be a QA/release phase, not a feature-expansion phase. New product capabilities should be deferred unless a blocking defect is found.
