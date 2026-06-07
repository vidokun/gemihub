# Draft: GemiHub — Next.js AI API Gateway & Load Balancer

## Requirements (confirmed from user brief)

- **Project Name**: GemiHub
- **Tech Stack**: Next.js (App Router), Tailwind CSS, Edge Runtime, Supabase Database (Free Tier)
- **Database**: Supabase — table `api_keys` with columns: id, key_string, is_active (boolean, default true), error_count (integer, default 0)
- **Env Variables**: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ADMIN_PASSCODE, MASTER_AUTH_TOKEN
- **Frontend Pages**:
  - Login page (Tailwind CSS, validates ADMIN_PASSCODE)
  - Dashboard (stats: active keys, rate-limited keys, total requests)
  - Key Management (CRUD: add, delete, toggle active/inactive)
- **Backend API**:
  - `/api/v1/chat/completions` — Edge Runtime, streaming response
  - Round-robin load balancing across active API keys
  - Auto-retry on 429 (Rate Limit) — switch to next key
  - Authorization: Bearer MASTER_AUTH_TOKEN required
- **Deployment Guides**:
  - Supabase setup (create project, copy keys, run SQL)
  - Vercel deploy (connect GitHub, set env vars, go live)

## Technical Decisions

- **Framework**: Next.js with App Router (route handlers in `app/api/`)
- **Runtime**: Edge Runtime for API routes (streaming support, no Vercel timeout)
- **Styling**: Tailwind CSS (no component library mentioned)
- **Auth (Dashboard)**: Simple passcode-based (ADMIN_PASSCODE), stored in env — likely cookie/sessionStorage based
- **Auth (API)**: Bearer token (MASTER_AUTH_TOKEN), header validation in middleware
- **Database Access**: Supabase client (@supabase/supabase-js) — use service_role key server-side for CRUD, anon key client-side (read-only via RLS or not exposed)

## Research Findings

### Workspace State
- **Completely empty** — no package.json, no config, no git repo. Fresh project.

### Next.js App Router Patterns
- Route handlers: `app/api/v1/chat/completions/route.ts`
- Edge Runtime: `export const runtime = 'edge'` (works, though deprecated in newer Next.js)
- Streaming: Use `ReadableStream` + SSE format. Return `new Response(stream, {...})` with `Content-Type: text/event-stream`
- Env vars: `NEXT_PUBLIC_` prefix for client-safe vars, `.env.local` for secrets

### Supabase Integration (CRITICAL)
- **MUST use `@supabase/ssr`**, NOT `@supabase/auth-helpers-nextjs` (deprecated)
- **MUST use `getAll`/`setAll`** cookie methods, NEVER `get`/`set`/`remove`
- Server client: `createServerClient` from `@supabase/ssr`
- Admin client: `createClient` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS
- Browser client: `createBrowserClient` from `@supabase/ssr`

### Gemini API (CRITICAL for gateway)
- **Base URL**: `https://generativelanguage.googleapis.com/v1beta/models/`
- **Streaming endpoint**: `{MODEL}:streamGenerateContent?alt=sse`
- **Auth**: `x-goog-api-key` header (NOT Bearer token)
- **SSE format**: `data: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}` — each event is a COMPLETE JSON object, not a delta
- **No `[DONE]` terminator** — connection closes naturally when streaming ends
- **429 error**: `RESOURCE_EXHAUSTED` status with quota details (RPM/TPM/RPD). Response body includes violator type.
- **Retry strategy**: 429, 500, 503, 504 are retryable. 400, 401, 403, 404, 413 are NOT.
- **Request format**: Gemini uses `contents[]` + `parts[]`, NOT OpenAI's `messages[]`

### AI Gateway OSS Patterns
- **Key rotation**: balanced (distribution) vs sequential (use-til-exhausted)
- **Cooldown tiers**: 10s → 30s → 60s → 120s exponential backoff
- **Cross-provider fallback**: If Gemini-1 is rate-limited, try Gemini-2, then fallback model
- **Per-key locking**: Prevent hammering a rate-limited key

## Decisions (confirmed)

- **Request Logging**: Full `request_logs` table in Supabase — columns: id, api_key_id, timestamp, model, status, tokens_used, latency_ms, error_message. Dashboard queries real-time stats.
- **Gemini Model**: Configurable via request body (`model` field). Gateway is model-agnostic — client specifies which Gemini model to use.
- **Dashboard Auth**: Cookie-based session. Login page validates ADMIN_PASSCODE, sets httpOnly cookie (`admin_token`). Middleware checks cookie on all `/dashboard/*` routes.
- **Test Strategy**: No automated unit/integration tests. Agent-executed QA scenarios ONLY (curl for API, Playwright for UI).

## Supabase Research (Additional)
- **Client patterns**: Three clients — `createBrowserClient` (client-side), `createServerClient` (server/SSR), admin client with `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- **CRUD**: Use Server Actions (`"use server"`) for mutations. Server Components for read-only queries.
- **RLS**: Enable on `api_keys` table. Use `auth.uid()` for ownership scoping. Admin operations use service_role to bypass.
- **Pagination**: Use `.range(from, to)` for server-side or fetch all + client-side paginate for <200 rows.
- **Free Tier**: 50K rows total, 500MB DB, 5GB egress/month. Plenty for API key management.

## Open Questions

*All resolved — see Decisions section below.*

## Scope Boundaries

- INCLUDE: Full Next.js app (App Router), Tailwind CSS dark mode dashboard, Supabase SQL (2 tables: `api_keys` + `request_logs`), deployment guides (Supabase + Vercel), 3 frontend pages (login, dashboard, key management), API endpoint `/api/v1/chat/completions` with Edge Runtime streaming, round-robin LB + auto-retry on 429, cookie-based dashboard auth, Bearer token API security, client-side pagination on key management
- EXCLUDE: User authentication system (no Supabase Auth — simple passcode), OpenAI/Claude provider support (Gemini only), multi-tenant support, i18n, file upload, monitoring/alerting, CI/CD pipeline, Docker setup
