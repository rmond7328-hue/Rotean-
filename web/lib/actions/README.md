# Rotean Action Execution

Phase 8 owns the boundary between an AI proposal and a database mutation.

## Executable actions

- `create_task`
- `update_task`
- `schedule_event`
- `save_memory`

Read-only/open/focus/break/search actions remain proposals until their owning integration exists.

## Safety invariants

1. Every execution request is authenticated server-side.
2. The API rejects actions outside the executable allowlist.
3. Mutating requests require `confirmed: true`.
4. Payloads are type/length/range validated before database writes.
5. Task updates are scoped to the authenticated user.
6. Event end must be after event start.
7. Gemini never receives database credentials and never executes SQL directly.

Phase 9 can add production hardening, idempotency/audit improvements, integrations, notifications, and observability around this boundary.
