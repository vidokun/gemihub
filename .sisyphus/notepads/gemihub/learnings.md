# Learnings

## Task 7: Dashboard Layout Shell & Navigation

### Tailwind v4 Patterns
- Uses `@import "tailwindcss"` instead of `@tailwind base/components/utilities`
- CSS variables referenced via arbitrary values: `bg-[var(--bg)]`, `text-[var(--text)]`
- `@theme inline` block maps custom tokens: `--color-background: var(--bg)`
- Arbitrary opacity modifiers work: `bg-[var(--accent)]/10` produces accent at 10% opacity

### Next.js 16.2.7 Patterns
- `usePathname()` from `next/navigation` — client component only, requires `'use client'` directive
- Route groups `(dashboard)` don't affect URL paths — `/dashboard` not `/(dashboard)/dashboard`
- Layouts don't re-render on navigation — `usePathname()` in client component handles route awareness
- `Link` from `next/link` for client-side navigation within the app

### Responsive Design
- `lg:w-56 max-lg:w-16` — full width on desktop, icon-only on mobile
- `max-lg:hidden` — hide text labels below lg breakpoint
- `shrink-0` on sidebar to prevent flex shrinking
- `min-w-0` on content area to allow proper flex truncation

## Task: API Bearer Token Validation

### Auth Patterns
- `env.MASTER_AUTH_TOKEN` from `@/lib/env` — required env var, throws at startup if missing
- Extract Bearer token: `header.startsWith('Bearer ')` then `header.slice(7)` (no regex)
- `env.MASTER_AUTH_TOKEN` is a plain string comparison — simple but adequate for single-token auth
- 401 response follows OpenAI-compatible error format: `{"error":{"message":"...","code":"UNAUTHORIZED"}}`

### Web API Request/Response
- `request.headers.get('Authorization')` returns `null` when header is absent
- `Content-Type: application/json` header required on 401 response body
- Request object is read-only — never mutate it during validation

## Task: API Keys CRUD Server Actions

### Supabase Server Action Patterns
- `'use server'` directive at top of file makes all exported functions server actions
- `createAdminClient()` from `@/lib/supabase/admin` uses service_role key — bypasses RLS, use only in server code
- `.select().single()` returns a single row from INSERT — throws if no row returned
- For toggle/upsert patterns, fetch current state first with `.select().single()`, then UPDATE
- `error_count` type in database.types.ts is `number` — use `(existing.error_count ?? 0) + 1` for null safety on increment
- Timestamps: use `new Date().toISOString()` for `last_used_at` updates
- All functions throw `new Error()` with meaningful messages — no silent failures
- Operations directory: `src/lib/supabase/operations/` — co-located with admin client

## Gemini Non-Streaming Proxy (2026-06-07)

### Created: `src/lib/gemini/proxy.ts`

**`callGeminiNonStreaming(request: GeminiRequest, apiKey: string): Promise<GeminiResponse>`**

#### Message Mapping
- OpenAI-style `messages[{role, content}]` → Gemini `contents[{role, parts:[{text}]}]`
- Role mapping: `user` → `"user"`, `assistant` → `"model"` (Gemini uses "model" not "assistant")
- `system` role → `systemInstruction.parts[{text}]` (top-level, separate from contents)

#### Generation Config
- Optional params `temperature`, `maxOutputTokens`, `topP`, `topK` → `generationConfig` object
- Only included when at least one param is defined

#### API Details
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
- Auth: `x-goog-api-key` header
- Original request object is never mutated
- No response caching
- API key never exposed in response

#### Error Handling
- `GeminiProxyError` class with `status` (HTTP status code) and optional `body` (parsed JSON or raw text)
- Non-200 responses throw `GeminiProxyError`

## Task: DEPLOYMENT.md Guide

### Env Vars (from .env.example)
- `NEXT_PUBLIC_SUPABASE_URL` — public, exposed to browser (used by supabase-js)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public, anon/publishable key
- `SUPABASE_SERVICE_ROLE_KEY` — secret, bypasses RLS, never exposed to browser
- `ADMIN_PASSCODE` — secret, used for admin dashboard login
- `MASTER_AUTH_TOKEN` — secret, used for API Bearer auth

### Auth Mechanism
- Bearer token validation in `src/lib/auth/api-auth.ts` compares `Authorization: Bearer <token>` against `MASTER_AUTH_TOKEN`
- 401 response follows OpenAI-compatible format: `{"error":{"message":"...","code":"UNAUTHORIZED"}}`

### API Endpoints
- Chat completions: `POST /api/v1/chat/completions`
- Supports `stream: true` (SSE) and `stream: false` (standard JSON response)
- Auth via `Authorization: Bearer <MASTER_AUTH_TOKEN>` header

### Supabase Schema
- `api_keys` table: id, key_string, name, is_active, error_count, created_at, last_used_at
- `request_logs` table: id, api_key_id (FK), timestamp, model, status_code, tokens_used, latency_ms, error_message, request_ip
- Indexes on `is_active` (partial, WHERE true), `timestamp DESC`, `api_key_id`

## Task: README.md (2026-06-07)

### Sections Created
- Title with tagline, features list (11 items), quick start (clone/cp/npm)
- ASCII architecture diagram: Client → Gateway (Bearer Auth → LRU → Retry → Proxy → Logger) → Gemini
- Environment variables reference table with 5 vars
- API usage with curl examples for streaming (SSE) and non-streaming (JSON)
- Error responses table (400/401/503 with OpenAI-compatible JSON shape)
- Dashboard routes table (/login, /dashboard, /keys)
- Project structure tree (full 50-entry tree)
- Link to DEPLOYMENT.md, MIT License

### Anti-AI-Slop Applied
- Replaced all em dashes with periods/colons (14 occurrences)
- No AI-slop phrases: no "delve", "leverage", "utilize", "robust", "it's important to note"
- Varied sentence length, used contractions naturally
- Placeholder tokens for all credentials: `ghub_master_abc123def456`, `your-project-id.supabase.co`


## Task 17: 429 Retry & Key Rotation (2026-06-07)

### Created: `src/lib/gemini/retry.ts`

**Exported function**: `executeWithRetry(request: GeminiRequest, maxRetries?: number): Promise<Response>`

#### Architecture

- Uses `tryWithKey()` for single-attempt → returns discriminated union `TryResult`
- Uses `attemptWithBackoff()` for per-key retry loop (max 3 retries, exponential backoff + jitter)
- `executeWithRetry()` wraps both with key loop + `Set<number>` exhaustion tracking

#### Retry Strategy

| Status | Behavior |
|--------|----------|
| 200 | Log request, mark key used, return Response |
| 429 (RESOURCE_EXHAUSTED) | `incrementErrorCount` + `toggleApiKey` to disable, add to exhausted `Set<number>`, try next key |
| 500/503/504 | Retry same key with backoff (1s→2s→4s, jitter 0.8-1.2x), max 3 per key |
| 400/401/403/404/413 | Return error immediately (no retry) |
| Network error | Treat as server error, retry with backoff |

#### Jitter Formula
```
actualDelay = baseDelay * (0.8 + Math.random() * 0.4)
```
Where `baseDelay = Math.pow(2, attempt - 1) * 1000` (1s, 2s, 4s).

#### Response Format
- Non-streaming success: Open AI-compatible JSON via `convertToOpenAIFormat()`
- Streaming success: SSE `ReadableStream` via duplicated `processSSEStream()` (mirrors proxy.ts)
- Error: `{ error: { message: "...", code: "..." } }`
- All keys exhausted: 503 `{ error: { message: "All API keys exhausted", code: "NO_KEYS_AVAILABLE" } }`

#### Key Decisions
- **Duplicated `buildGeminiRequestBody` and SSE processor** from proxy.ts — necessary because `callGeminiStreaming()` masks HTTP errors (returns error streams instead of throwing), so the retry layer needs its own fetch call to detect 429/500 before streaming begins.
- **`callGeminiNonStreaming` still used** for non-streaming path — it throws `GeminiProxyError` which the retry layer can catch and categorize.
- **Fire-and-forget logging**: `void fn().catch(() => {})` pattern used for `markKeyUsed`, `logRequest`, `incrementErrorCount`, `toggleApiKey` — prevents side-channel operations from blocking the response.
- **`exhaustedKeys: Set<number>`** safety net — even though `toggleApiKey` disables keys in the DB, the Set prevents infinite loops if DB state hasn't propagated.
- **Streaming tokens**: logged as `tokensUsed: 0` — `usageMetadata` only available after full stream consumption.

#### Type-Safe Error Body
- `GeminiErrorBody` interface matches Gemini's error JSON shape: `{ error?: { code?, message?, status? } }`
- `status: "RESOURCE_EXHAUSTED"` is the canonical 429 indicator (checked in addition to HTTP status code)

## Task 15: Gemini Streaming Proxy (2026-06-07)

### Added `callGeminiStreaming()` to `src/lib/gemini/proxy.ts`

**Shared body builder**: `buildGeminiRequestBody()` extracted from `callGeminiNonStreaming` — eliminates duplication, both functions use identical message mapping and generation config logic.

#### Gemini SSE Format
- Endpoint: `{model}:streamGenerateContent?alt=sse`
- Each event is a **complete JSON object** (not deltas) delimited by `\n\n`
- Text extracted from `candidates[0].content.parts[0].text` — always the full accumulated text
- No `[DONE]` terminator from Gemini; we must add our own

#### Delta Computation
- Since Gemini sends accumulated text, we track `previousText` and emit only the new suffix (`text.slice(previousText.length)`)
- Skip events where delta is empty (Gemini may re-send same content)

#### OpenAI SSE Output Format
- Each chunk: `data: {"choices":[{"delta":{"content":"..."},"index":0}]}\n\n`
- Final: `data: [DONE]\n\n`

#### Stream Parsing Pattern
- `response.body.getReader()` for chunked reads
- `TextDecoder.decode(value, { stream: true })` preserves partial multi-byte UTF-8 sequences
- Buffer-and-split by `\n\n`; last incomplete event stays in buffer for next read
- Flush remaining buffer after read loop ends

#### Error Handling
- Non-200 response → return `errorStream()` ReadableStream that emits SSE error event then `[DONE]`
- Network/fetch failures → same pattern, 500 status
- Internal stream parsing errors → caught in async start, emit STREAM_ERROR SSE event then `[DONE]`

## Code Review: 2026-06-07

### Build & Lint Results
- `npx tsc --noEmit`: PASS (0 errors)
- `npx next lint`: FAIL (1 error)
  - `src/app/(dashboard)/keys/page.tsx:122` — `react-hooks/set-state-in-effect`: `fetchKeys()` called inside `useEffect` triggers `setState` synchronously.
  - Fix recommendation: Convert `KeysPage` to a Server Component (data is fetched via `getAllKeys` which is already server-only).

### Pattern Audit (30 source files)
- `as any`: 0
- `@ts-ignore`: 0
- Empty catch blocks: 5 (all justified — I/O boundaries with explanatory comments)
- `console.log`: 0 (2× `console.error` in server code, acceptable)
- Commented-out code: 0
- Unused imports: 0
- Generic var names: 0
- AI slop: 0

### Code Quality Notes
- `page.tsx` (root landing page) still contains Next.js boilerplate content — placeholder, not blocking
- `buildGeminiRequestBody` and `extractDeltaFromSSEEvent` duplicated in `retry.ts` and `proxy.ts` — intentional, documented
- Spinner SVG duplicated across 3 components — minor DRY violation but within component boundaries acceptable
