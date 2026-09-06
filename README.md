# Rotean

**Your life, intelligently managed.**

Rotean is a personal life operating system: it understands your time, responsibilities, goals, routines, preferences and context, then helps you decide and act on what makes sense next.

## Build status
- Phase 1 — Foundation: complete
- Phase 2 — Core product: complete
- Phase 3 — Intelligence foundation: complete
- Phase 4 — Real Rotean experience: complete
- Phase 5 — Action & real-world intelligence: complete
- Phase 6 — Deep personalization: complete
- Phase 7 — Agent & actions: complete

## Agent architecture
The agent plans actions from personal context, requires user confirmation for state-changing operations, executes only supported integrations, and records the lifecycle for auditing. Unsupported integrations are reported rather than simulated.

## Personalization
Rotean combines explicit preferences, durable memories and repeated behavioral signals. Routine and energy patterns are treated as soft hints, not facts. Recommendation feedback and user corrections can improve future planning.

## Architecture principles
1. Context before commands.
2. Recommendations before dashboards.
3. AI interprets and reasons; application services own state changes.
4. Consequential actions require appropriate permission.
5. Learned patterns remain probabilistic and correctable.
6. Never expose GEMINI_API_KEY in the client.
