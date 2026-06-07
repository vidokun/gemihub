# LRU Load Balancer — Learnings

## Pattern: DB-backed LRU via last_used_at timestamp
- `getActiveKeys()` returns all `is_active=true` keys from Supabase
- Sort client-side by `last_used_at` ASC with nulls first → the key least recently used (or never used) is selected
- No in-memory state — safe across serverless cold starts
- `markKeyUsed()` delegates to `updateLastUsed()` which sets `last_used_at = NOW()` in DB

## TypeScript narrowing gotcha
- TS cannot narrow nullable types through boolean variables (e.g., after `if (aNull) return -1`, the else branch still sees `a.last_used_at` as `string | null`)
- Solution: use `!` non-null assertion when control flow already guarantees non-null

## File structure
- `src/lib/gemini/load-balancer.ts` — public API for key selection
- `src/lib/supabase/operations/api-keys.ts` — raw DB operations (existing)
- `src/lib/types.ts` — `ApiKey` interface (existing)
