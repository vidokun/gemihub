# Learnings

## Edge Runtime + Server Actions
- `'use server'` directive on `request-logs.ts` made it a server action. In Edge Runtime, Next.js invokes server actions via HTTP POST which fails silently.
- Internal module (`operations/internal/request-logs.ts`) without `'use server'` works because it's a direct function import — no HTTP layer involved.

## Token columns
- `prompt_tokens` and `completion_tokens` were already being passed to `logRequest`/`logRequestInternal` via `promptTokens`/`completionTokens` params and inserted into Supabase, but the schema lacked the columns.
- Added to both schema.sql (new installs) and a migration file (existing DBs).
- Updated `RequestLog` TypeScript interface to match.

## Dashboard table styling
- RequestLogTable matches KeyTable styling: same CSS var usage (`var(--card)`, `var(--border)`, `var(--text)`, `var(--muted)`), same border/radius/spacing patterns, same empty state pattern.
- Status badges follow same rounded-full + dot pattern as KeyTable's Active/Inactive badges.

## 2025-06-15: Removing prompt/completion token columns entirely
- **Decision**: Instead of trying to ensure the migration ran everywhere, we removed `prompt_tokens` and `completion_tokens` from both the TypeScript interface and the SQL schema. Only `tokens_used` remains as the single token column.
- **Rationale**: If the migration hasn't run in production, inserts with those columns fail. Rather than risk silent failures tripped by `.catch(() => {})`, we eliminated the columns entirely.
- **Retry fix**: Changed `success` case from fire-and-forget (`void ... catch(() => {})`) to `await` with explicit `try/catch` + `console.error`. This ensures (a) Node.js actually waits for the DB write, and (b) any Supabase error surfaces in Vercel logs.
- **Fire-and-forget preserved** for: stream_success (response already started), rate_limited/server_error/network_error (retry paths — don't delay).
