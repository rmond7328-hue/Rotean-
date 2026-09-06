# Rotean architecture

## Principle
Rotean is a life operating system, not a chatbot. The application owns truth and state; intelligence reasons over a normalized life model and proposes or requests actions.

## Layers
1. Presentation — Expo Router screens and reusable components.
2. Domain — tasks, goals, habits, events, notes, memory and planning rules.
3. Services — Supabase repositories and future integrations.
4. Intelligence — context assembly, ranking, planning and Gemini adapter. No provider-specific code in UI.
5. Data — Supabase Postgres with RLS.

## Context model
A context request is assembled from current time/timezone, active commitments, available windows, due work, goals, habits, preferences, memories and recent activity. Location/weather/external integrations are optional inputs and must be permission-aware.

## AI boundary
Gemini receives a deliberately scoped context payload. It may return structured suggestions or proposed tool calls. Application services validate permissions and business rules before mutating state. The model never receives raw credentials and never writes directly to Postgres.

## Planning boundary
Date arithmetic, duration arithmetic, overlap detection, recurrence validation and authorization are deterministic application/database concerns. The model can explain and rank options but is not the source of truth for these operations.

## Data ownership
Every personal record is scoped to a user_id and protected by RLS. Cross-user access is not part of V1.
