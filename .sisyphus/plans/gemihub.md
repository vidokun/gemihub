# GemiHub — Next.js AI API Gateway & Load Balancer

## TL;DR

> **Quick Summary**: Build a production-ready Next.js App Router application that serves as a load-balancing gateway for Google Gemini API — proxies chat completion requests through a pool of API keys with round-robin distribution, automatic 429 retry fallback, streaming SSE support via Edge Runtime, and an admin dashboard to manage keys and view request stats.
> 
> **Deliverables**:
> - Full Next.js project scaffold with TypeScript, Tailwind CSS, App Router
> - 2 Supabase SQL tables: `api_keys` and `request_logs`
> - 3 frontend pages: Login, Dashboard, Key Management (CRUD)
> - 1 Edge Runtime API endpoint: `/api/v1/chat/completions` (streaming + non-streaming)
> - Round-robin load balancer with auto-retry on Gemini 429 errors
> - Cookie-based admin auth + Bearer token API security
> - Deployment guides for Supabase and Vercel
> 
> **Estimated Effort**: Medium (21 implementation tasks + 4 verification tasks = 25 total)
> **Parallel Execution**: YES — 4 waves + final verification wave
> **Critical Path**: Task 1 → Task 5 → Task 8 → Task 11 → Task 15 → Task 21 → F1-F4 → user okay

---

## Context

### Original Request
Build GemiHub — a full-stack Next.js AI API Gateway & Load Balancer for Google Gemini API with Supabase database, admin dashboard, streaming API endpoint, round-robin key rotation, automatic rate-limit retry, and deployment guides for Supabase + Vercel.

### Interview Summary
**Key Discussions**:
- **Tech Stack**: Next.js App Router, Tailwind CSS, Edge Runtime, Supabase Free Tier — locked in
- **Database Schema**: `api_keys` table with 8 columns (id, key_string, name, is_active, error_count, created_at, last_used_at) + `request_logs` table with 9 columns for tracking
- **Model Config**: Gemini model is client-configurable via request body — gateway is model-agnostic
- **Dashboard Auth**: Simple passcode-based with httpOnly cookie session (ADMIN_PASSCODE env var)
- **API Security**: Bearer token auth (MASTER_AUTH_TOKEN env var) required on all /api/v1/* requests
- **UI Design**: Dark mode default, card-based stats, clean minimalis
- **Pagination**: Client-side pagination on key management table
- **Test Strategy**: No automated unit/integration tests — agent-executed QA scenarios only (curl + Playwright)
- **Scope Exclusions**: No Supabase Auth, no multi-provider support (Gemini only), no multi-tenant, no i18n, no CI/CD, no Docker

**Research Findings**:
- Gemini API streaming endpoint: `{MODEL}:streamGenerateContent?alt=sse`, auth via `x-goog-api-key` header
- Gemini SSE: each event is a complete JSON object (`candidates[0].content.parts[0].text`), no `[DONE]` terminator
- Gemini 429: `RESOURCE_EXHAUSTED` status with RPM/TPM/RPD quota violation details
- Supabase SSR: MUST use `@supabase/ssr` (not deprecated `@supabase/auth-helpers-nextjs`), `getAll`/`setAll` cookie methods
- Three Supabase client types: browser (publishable key), server (publishable key + cookie store), admin (service_role key — bypasses RLS)
- Next.js Edge Runtime: `export const runtime = 'edge'` still works, compatible with ReadableStream for SSE

---

## Core Objective

Build a Next.js application that proxies Google Gemini chat completion requests through a managed pool of API keys, distributing load via round-robin, automatically retrying on rate-limit errors, and providing a secured admin dashboard to create, toggle, and delete keys while displaying real-time usage statistics.

---

## Work Objectives

### Core Objective
Build GemiHub: a Next.js API Gateway that load-balances Gemini chat completion requests across active API keys with streaming support, backed by Supabase for key management and request logging, with a Tailwind-styled admin dashboard.

### Concrete Deliverables
- `package.json` + `next.config.ts` + `tailwind.config.ts` + `tsconfig.json` — scaffolded project
- `src/lib/supabase/client.ts`, `server.ts`, `admin.ts` — three Supabase client factories
- `src/lib/gemini/proxy.ts` — Gemini API proxy with round-robin + retry logic
- `src/lib/auth/api-auth.ts` — Bearer token validation middleware
- `src/lib/auth/dashboard-auth.ts` — Cookie-based session utilities
- `src/app/api/v1/chat/completions/route.ts` — Edge Runtime streaming endpoint
- `src/app/(dashboard)/login/page.tsx` — Passcode-based login page
- `src/app/(dashboard)/dashboard/page.tsx` — Stats dashboard page
- `src/app/(dashboard)/keys/page.tsx` — Key management CRUD page
- `src/components/` — Reusable UI components (StatsCard, KeyTable, KeyForm, etc.)
- `supabase/schema.sql` — DDL for `api_keys` and `request_logs` tables
- `DEPLOYMENT.md` — Step-by-step Supabase + Vercel deployment guide
- `.env.example` — Environment variable template

### Definition of Done
- [ ] `npm run dev` starts without errors on `localhost:3000`
- [ ] Login page accepts ADMIN_PASSCODE and sets auth cookie
- [ ] Dashboard displays active key count, rate-limited count, total request count
- [ ] Key Management supports full CRUD (create, read, toggle, delete)
- [ ] `/api/v1/chat/completions` returns streaming SSE response when `stream: true`
- [ ] `/api/v1/chat/completions` returns JSON response when `stream: false`
- [ ] Round-robin distributes across all active keys
- [ ] Rate-limited key (429) triggers automatic switch to next key
- [ ] Requests without `Authorization: Bearer <MASTER_AUTH_TOKEN>` receive 401
- [ ] Requests with invalid/disabled API keys receive 503 with helpful error
- [ ] `request_logs` table records every proxied request with status and timing

### Must Have
- [ ] Edge Runtime streaming via SSE for chat completions
- [ ] Round-robin load balancing across active `api_keys`
- [ ] Automatic retry on Gemini 429 with next available key
- [ ] Bearer token protection on `/api/v1/*` routes
- [ ] Cookie-based session for dashboard access
- [ ] Full CRUD for API keys (create, read, toggle active/inactive, delete)
- [ ] Request logging to Supabase `request_logs` table
- [ ] Dark mode Tailwind UI for all dashboard pages
- [ ] `.env.example` with all required variables documented
- [ ] Supabase SQL schema file ready to run in SQL Editor
- [ ] Deployment guide covering Supabase setup + Vercel deploy

### Must NOT Have (Guardrails)
- [ ] NO Supabase Auth integration — dashboard uses simple passcode only
- [ ] NO multi-provider support — Gemini only (no OpenAI, Claude, etc.)
- [ ] NO multi-tenant architecture — single admin, single key pool
- [ ] NO internationalization (i18n)
- [ ] NO CI/CD pipeline or Docker configuration
- [ ] NO API key encryption at rest — keys stored as plaintext in Supabase
- [ ] NO rate limiting on the gateway itself — only Gemini-side rate limits matter
- [ ] NO WebSocket support — SSE streaming only
- [ ] NO `@supabase/auth-helpers-nextjs` — use `@supabase/ssr` exclusively
- [ ] NO `get`/`set`/`remove` cookie methods — use `getAll`/`setAll` only

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (fresh project)
- **Automated tests**: None
- **Framework**: N/A
- **Agent-Executed QA**: ALWAYS — every task includes detailed Playwright/curl scenarios

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Library/Module**: Use Bash (bun/node REPL) — Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation + scaffolding):
├── Task 1: Project scaffold + package.json [quick]
├── Task 2: Environment config + .env.example [quick]
├── Task 3: Supabase SQL schema [quick]
├── Task 4: TypeScript types + interfaces [quick]
├── Task 5: Supabase client factories (client/server/admin) [quick]
├── Task 6: Tailwind globals + dark mode config [quick]
└── Task 7: Layout shell + navigation [visual-engineering]

Wave 2 (After Wave 1 — auth + data layer):
├── Task 8: Dashboard auth (cookie session) [quick]
├── Task 9: API Bearer token middleware [quick]
├── Task 10: API keys CRUD server actions [deep]
├── Task 11: Request logs query functions [quick]
├── Task 12: Login page UI [visual-engineering]
└── Task 13: Middleware for dashboard route protection [quick]

Wave 3 (After Wave 2 — core business logic):
├── Task 14: Gemini API proxy (non-streaming) [deep]
├── Task 15: Gemini API proxy (streaming SSE) [deep]
├── Task 16: Round-robin load balancer [deep]
├── Task 17: 429 retry + key rotation logic [deep]
└── Task 18: /api/v1/chat/completions route handler [deep]

Wave 4 (After Wave 3 — dashboard pages):
├── Task 19: Dashboard stats page [visual-engineering]
├── Task 20: Key management page (CRUD table) [visual-engineering]
├── Task 21: Deployment guide (Supabase + Vercel) [writing]
└── Task 22: README.md project documentation [writing]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 2-7 | 1 |
| 2 | — | 5, 8, 9, 14-18 | 1 |
| 3 | — | 5, 10, 11 | 1 |
| 4 | — | 5, 7, 10, 12, 14-20 | 1 |
| 5 | 1, 2, 3, 4 | 8, 9, 10, 11 | 1 |
| 6 | 1 | 7, 12, 19, 20 | 1 |
| 7 | 1, 4, 6 | 12, 19, 20 | 1 |
| 8 | 2, 5 | 12, 13 | 2 |
| 9 | 2 | 18 | 2 |
| 10 | 3, 4, 5 | 19, 20 | 2 |
| 11 | 3, 5 | 19 | 2 |
| 12 | 4, 6, 7, 8 | 13 | 2 |
| 13 | 8, 12 | 19, 20 | 2 |
| 14 | 2, 4 | 18 | 3 |
| 15 | 2, 4 | 18 | 3 |
| 16 | 4, 10 | 18 | 3 |
| 17 | 4, 10, 14 | 18 | 3 |
| 18 | 2, 4, 9, 14, 15, 16, 17 | — | 3 |
| 19 | 4, 7, 10, 11, 13 | — | 4 |
| 20 | 4, 7, 10, 13 | — | 4 |
| 21 | — | — | 4 |
| 22 | — | — | 4 |

### Agent Dispatch Summary

- **Wave 1**: 7 — T1-T5, T7 → `quick`, T6 → `quick`
- **Wave 2**: 6 — T8-T9 → `quick`, T10 → `deep`, T11 → `quick`, T12 → `visual-engineering`, T13 → `quick`
- **Wave 3**: 5 — T14-T18 → `deep`
- **Wave 4**: 4 — T19-T20 → `visual-engineering`, T21-T22 → `writing`
- **FINAL**: 4 — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. **Project Scaffold & Package Configuration**

  **What to do**:
  - Initialize Next.js project with `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias`
  - Install required dependencies: `npm install @supabase/supabase-js @supabase/ssr`
  - Install dev dependencies: `npm install -D @types/node`
  - Configure `next.config.ts` with `serverExternalPackages: ['@supabase/supabase-js']` and set `experimental.serverActions.bodySizeLimit: '5mb'`
  - Verify `tsconfig.json` has `strict: true`, `paths: { "@/*": ["./src/*"] }`
  - Create directory structure: `src/lib/supabase/`, `src/lib/gemini/`, `src/lib/auth/`, `src/components/`, `src/app/(dashboard)/login/`, `src/app/(dashboard)/dashboard/`, `src/app/(dashboard)/keys/`, `src/app/api/v1/chat/completions/`, `supabase/`
  - Initialize git repo with `git init` and create `.gitignore` (node_modules, .env*, .next)

  **Must NOT do**:
  - Do NOT install `@supabase/auth-helpers-nextjs` (deprecated)
  - Do NOT create pages router files (only App Router)
  - Do NOT use `src/` directory without confirming it exists in scaffold

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard project initialization — mechanical steps, no complex logic
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 with Tasks 2, 3)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 5, 6, 7
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):
  - Official Next.js create-next-app docs: `https://nextjs.org/docs/app/api-reference/create-next-app` — CLI flags and options
  - Supabase SSR setup: `https://supabase.com/docs/guides/auth/server-side/creating-a-client` — package requirements
  - Pattern reference: Next.js project structure with App Router — `src/app/` layout, `src/lib/` utilities

  **Acceptance Criteria**:
  - [ ] `npm run dev` starts without errors on localhost:3000
  - [ ] `ls src/app/layout.tsx` exists (root layout)
  - [ ] `ls src/app/page.tsx` exists (home page)
  - [ ] `ls src/lib/supabase/` directory exists (empty, ready for Task 5)
  - [ ] `ls supabase/` directory exists (empty, ready for Task 3)
  - [ ] `.gitignore` includes `.env*`, `node_modules`, `.next`

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Project builds and starts successfully
    Tool: Bash
    Steps:
      1. Run: cd /Users/dokun/Documents/VIBECODING/gemihub && npm run dev &
      2. Wait 10 seconds for dev server to start
      3. Run: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
    Expected Result: HTTP 200 from localhost:3000
    Failure Indicators: Non-200 status, port conflict, build errors in terminal
    Evidence: .sisyphus/evidence/task-1-dev-start.txt (save curl output + terminal logs)

  Scenario: Verify project structure matches plan
    Tool: Bash
    Steps:
      1. Run: ls -la src/app/
      2. Run: ls -la src/lib/
      3. Run: ls -la supabase/
      4. Run: cat .gitignore | grep -E "\.env|node_modules|\.next"
    Expected Result: All directories exist, .gitignore has required entries
    Failure Indicators: Missing directories, wrong .gitignore contents
    Evidence: .sisyphus/evidence/task-1-structure.txt
  ```

  **Commit**: YES (Wave 1 group commit)
  - Message: `feat(scaffold): initialize Next.js project with config and types`
  - Files: All scaffolded files + new directories

- [x] 2. **Environment Configuration & .env.example**

  **What to do**:
  - Create `.env.example` at project root with all required variables and placeholder values:
    ```
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_anon_key_here

    # Admin Dashboard
    ADMIN_PASSCODE=change-me-to-a-secure-passcode

    # API Security
    MASTER_AUTH_TOKEN=change-me-to-a-secure-master-token
    ```
  - Create `.env.local` (gitignored) for local development with placeholder values
  - Create `src/lib/env.ts` with a type-safe environment variable accessor that validates all required vars at startup:
    ```typescript
    // Use a simple validation pattern:
    const required = (name: string) => { const v = process.env[name]; if (!v) throw new Error(`Missing ${name}`); return v }
    export const env = { SUPABASE_URL: required('NEXT_PUBLIC_SUPABASE_URL'), ... }
    ```

  **Must NOT do**:
  - Do NOT commit `.env.local` (must be in .gitignore)
  - Do NOT expose `MASTER_AUTH_TOKEN` or `ADMIN_PASSCODE` as `NEXT_PUBLIC_` (they must stay server-only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple file creation, straightforward validation logic
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 with Tasks 1, 3)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 5, 8, 9, 14-18 (any task that reads env vars)
  - **Blocked By**: None

  **References**:
  - Next.js env vars docs: `https://nextjs.org/docs/app/building-your-application/configuring/environment-variables` — `NEXT_PUBLIC_` prefix rules
  - Draft: `.sisyphus/drafts/gemihub.md` — confirmed env var names

  **Acceptance Criteria**:
  - [ ] `.env.example` exists with all 4 variables and description comments
  - [ ] `.env.local` exists (gitignored)
  - [ ] `src/lib/env.ts` exports validated `env` object
  - [ ] `MASTER_AUTH_TOKEN` and `ADMIN_PASSCODE` are NOT prefixed with `NEXT_PUBLIC_`
  - [ ] Running `node -e "require('./src/lib/env.ts')"` validates vars (or throws descriptive error)

  **QA Scenarios**:

  ```
  Scenario: Env validation catches missing variables
    Tool: Bash
    Steps:
      1. Comment out MASTER_AUTH_TOKEN in .env.local
      2. Run: npx tsx -e "import {env} from './src/lib/env'; console.log(env.SUPABASE_URL)"
    Expected Result: Process exits with error containing "Missing" and "MASTER_AUTH_TOKEN"
    Failure Indicators: No error thrown, wrong variable name in error
    Evidence: .sisyphus/evidence/task-2-env-validation.txt

  Scenario: .env.example has all required variables
    Tool: Bash
    Steps:
      1. Run: cat .env.example
      2. Run: grep -c "NEXT_PUBLIC_SUPABASE_URL\|NEXT_PUBLIC_SUPABASE_ANON_KEY\|ADMIN_PASSCODE\|MASTER_AUTH_TOKEN" .env.example
    Expected Result: All 4 variables present with placeholder values. Count = 4 (not counting comments/descriptions).
    Failure Indicators: Missing variable, NEXT_PUBLIC_ on server-only vars
    Evidence: .sisyphus/evidence/task-2-env-example.txt
  ```

  **Commit**: YES (Wave 1 group commit)
  - Files: `.env.example`, `src/lib/env.ts`

- [x] 3. **Supabase SQL Schema**

  **What to do**:
  - Create `supabase/schema.sql` with DDL for both tables:
  - Table `api_keys`: id (BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY), key_string (TEXT NOT NULL UNIQUE), name (TEXT NOT NULL), is_active (BOOLEAN DEFAULT true NOT NULL), error_count (INTEGER DEFAULT 0 NOT NULL), created_at (TIMESTAMPTZ DEFAULT NOW() NOT NULL), last_used_at (TIMESTAMPTZ)
  - Table `request_logs`: id (BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY), api_key_id (BIGINT REFERENCES api_keys(id) ON DELETE SET NULL), timestamp (TIMESTAMPTZ DEFAULT NOW() NOT NULL), model (TEXT), status_code (INTEGER), tokens_used (INTEGER), latency_ms (INTEGER), error_message (TEXT), request_ip (TEXT)
  - Add performance indexes: `CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;`, `CREATE INDEX idx_request_logs_timestamp ON request_logs(timestamp DESC);`, `CREATE INDEX idx_request_logs_key_id ON request_logs(api_key_id);`
  - Add comment header with instructions: "Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql"

  **Must NOT do**:
  - Do NOT add RLS policies (tables are accessed via service_role key, not client-side)
  - Do NOT add Supabase Auth triggers or `auth.users` references
  - Do NOT use SERIAL (use GENERATED ALWAYS AS IDENTITY for Postgres best practice)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure SQL DDL — straightforward table definitions
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 with Tasks 1, 2)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 5, 10, 11
  - **Blocked By**: None

  **References**:
  - Supabase SQL Editor docs: `https://supabase.com/docs/guides/database/overview` — how to run SQL
  - Postgres IDENTITY columns: `https://www.postgresql.org/docs/current/sql-createtable.html` — GENERATED ALWAYS AS IDENTITY syntax
  - Draft: `.sisyphus/drafts/gemihub.md` — confirmed column specifications

  **Acceptance Criteria**:
  - [ ] `supabase/schema.sql` exists
  - [ ] Contains `CREATE TABLE IF NOT EXISTS public.api_keys` with all 8 columns
  - [ ] Contains `CREATE TABLE IF NOT EXISTS public.request_logs` with all 9 columns
  - [ ] Contains 3 `CREATE INDEX IF NOT EXISTS` statements
  - [ ] `key_string` has UNIQUE constraint
  - [ ] `api_key_id` has FOREIGN KEY reference with ON DELETE SET NULL
  - [ ] SQL syntax is valid PostgreSQL (can be verified by reading)

  **QA Scenarios**:

  ```
  Scenario: SQL syntax is valid PostgreSQL
    Tool: Bash
    Steps:
      1. Run: cat supabase/schema.sql
      2. Check for: CREATE TABLE IF NOT EXISTS, GENERATED ALWAYS AS IDENTITY, DEFAULT values, REFERENCES, CREATE INDEX
    Expected Result: All statements use standard PostgreSQL syntax, no MySQL/SQLite-specific syntax
    Failure Indicators: AUTO_INCREMENT (MySQL), INTEGER PRIMARY KEY AUTOINCREMENT (SQLite), missing IF NOT EXISTS
    Evidence: .sisyphus/evidence/task-3-schema-review.txt

  Scenario: Column count matches spec
    Tool: Bash
    Steps:
      1. Run: grep -c "," supabase/schema.sql (approximate column count check)
      2. Manually verify: api_keys has 8 columns, request_logs has 9 columns
    Expected Result: Column counts match specification
    Failure Indicators: Missing columns, extra columns not in spec
    Evidence: .sisyphus/evidence/task-3-column-count.txt
  ```

  **Commit**: YES (Wave 1 group commit)
  - Files: `supabase/schema.sql`

- [x] 4. **TypeScript Types & Interfaces**

  **What to do**:
  - Create `src/lib/types.ts` with all shared TypeScript types:
  - `ApiKey` interface: id, key_string, name, is_active, error_count, created_at, last_used_at
  - `RequestLog` interface: id, api_key_id, timestamp, model, status_code, tokens_used, latency_ms, error_message, request_ip
  - `GeminiRequest` interface: model (string), messages (array of {role, content}), stream (boolean), plus optional: temperature, maxOutputTokens, topP, topK
  - `GeminiResponse` interface: candidates array with content.parts[].text, usageMetadata
  - `GatewayConfig` interface: roundRobinIndex (number), keys (ApiKey[])
  - `DashboardStats` interface: activeKeys, rateLimitedKeys, totalRequests
  - Create `src/lib/supabase/database.types.ts` with Supabase-generated Database type (manually define Tables interface matching schema.sql)

  **Must NOT do**:
  - Do NOT use `any` type — all interfaces must be fully typed
  - Do NOT import from `@supabase/supabase-js` for types (manual definitions only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure type definitions — no runtime logic
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 with Tasks 1, 2, 3)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 5, 7, 10, 12, 14-20 (most tasks consume these types)
  - **Blocked By**: None

  **References**:
  - Draft: `.sisyphus/drafts/gemihub.md` — confirmed schema and field names
  - Gemini API reference: `https://ai.google.dev/api/generate-content` — request/response shapes
  - Pattern: `supabase/schema.sql` — column names must match exactly

  **Acceptance Criteria**:
  - [ ] `src/lib/types.ts` exists with all 6 interfaces
  - [ ] `src/lib/supabase/database.types.ts` exists with Tables type
  - [ ] `npx tsc --noEmit` passes (no type errors from these files)
  - [ ] All interfaces use specific types (no `any`)

  **QA Scenarios**:

  ```
  Scenario: Types compile without errors
    Tool: Bash
    Steps:
      1. Run: npx tsc --noEmit 2>&1 | head -20
    Expected Result: No type errors related to types.ts or database.types.ts
    Failure Indicators: "Cannot find name", "implicit any", "Property does not exist"
    Evidence: .sisyphus/evidence/task-4-typecheck.txt

  Scenario: Types match SQL schema column names
    Tool: Bash
    Steps:
      1. Compare ApiKey fields with supabase/schema.sql api_keys columns
      2. Compare RequestLog fields with request_logs columns
      3. Run: grep "interface ApiKey" src/lib/types.ts -A 10
    Expected Result: All column names match exactly (snake_case in DB, snake_case in TS)
    Failure Indicators: camelCase in TS but snake_case in SQL (or vice versa)
    Evidence: .sisyphus/evidence/task-4-type-schema-match.txt
  ```

  **Commit**: YES (Wave 1 group commit)
  - Files: `src/lib/types.ts`, `src/lib/supabase/database.types.ts`

- [x] 5. **Supabase Client Factories**

  **What to do**:
  - Create `src/lib/supabase/client.ts` — browser client using `createBrowserClient` from `@supabase/ssr`
  - Create `src/lib/supabase/server.ts` — server client using `createServerClient` from `@supabase/ssr` with `cookies()` store, using `getAll`/`setAll`
  - Create `src/lib/supabase/admin.ts` — admin client using `createClient` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY`, guarded by `import 'server-only'`
  - Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.example` and `src/lib/env.ts`

  **Must NOT do**:
  - Do NOT use `@supabase/auth-helpers-nextjs` (deprecated)
  - Do NOT use `get`/`set`/`remove` cookie methods — ONLY `getAll`/`setAll`
  - Do NOT export admin client without `'server-only'` guard

  **Recommended Agent Profile**:
  - **Category**: `quick` — Reason: Standard Supabase SSR boilerplate, well-documented
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 with Tasks 6, 7)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 8, 9, 10, 11
  - **Blocked By**: 1, 2, 3, 4

  **References**:
  - Supabase SSR docs: `https://supabase.com/docs/guides/auth/server-side/creating-a-client`
  - `server-only` package: built into Next.js
  - OSS pattern: Acontext `createAdminClient`, api-key-vault factory functions

  **Acceptance Criteria**:
  - [ ] `src/lib/supabase/client.ts` exists — `createClient` via `createBrowserClient`
  - [ ] `src/lib/supabase/server.ts` exists — `createClient` via `createServerClient` with cookies
  - [ ] `src/lib/supabase/admin.ts` exists — `createAdminClient` via `createClient` with service_role, server-only guarded
  - [ ] All use `getAll`/`setAll` cookie methods

  **QA Scenarios**:
  ```
  Scenario: Client factory creates without runtime errors
    Tool: Bash
    Steps:
      1. Set env: export NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"
      2. Set env: export NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_test"
      3. Run: npx tsx -e "import {createClient} from './src/lib/supabase/client'; console.log('OK')"
    Expected Result: "OK" printed, no errors
    Failure Indicators: TypeError, import errors
    Evidence: .sisyphus/evidence/task-5-client-init.txt

  Scenario: Admin client has server-only guard
    Tool: Bash
    Steps:
      1. Run: head -5 src/lib/supabase/admin.ts
    Expected Result: Line contains "import 'server-only'"
    Failure Indicators: Missing guard
    Evidence: .sisyphus/evidence/task-5-admin-guard.txt
  ```

  **Commit**: YES (Wave 1 group)
  - Files: `src/lib/supabase/client.ts`, `server.ts`, `admin.ts`, updated `.env.example`, `src/lib/env.ts`

- [x] 6. **Tailwind Dark Mode & Global Styles**

  **What to do**:
  - Update `tailwind.config.ts`: `darkMode: 'class'`
  - Create `src/app/globals.css` with `@tailwind` directives and dark CSS custom properties (`--bg: #0a0a0b`, `--card: #111115`, `--border: #1e1e24`, `--text: #e4e4e7`, `--muted: #71717a`, `--accent: #8b5cf6`)
  - Import `globals.css` in root `src/app/layout.tsx`

  **Must NOT do**:
  - Do NOT add shadcn/ui or Radix — pure Tailwind only
  - Do NOT use `@layer` incorrectly

  **Recommended Agent Profile**:
  - **Category**: `quick` — Reason: Mechanical Tailwind config update
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 with Tasks 5, 7)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 7, 12, 19, 20
  - **Blocked By**: 1

  **References**:
  - Tailwind dark mode: `https://tailwindcss.com/docs/dark-mode`

  **Acceptance Criteria**:
  - [ ] `tailwind.config.ts` has `darkMode: 'class'`
  - [ ] `src/app/globals.css` has `@tailwind base/components/utilities` and CSS variables
  - [ ] Root layout imports `globals.css`

  **QA Scenarios**:
  ```
  Scenario: Tailwind dark mode config verified
    Tool: Bash
    Steps:
      1. Run: grep "darkMode" tailwind.config.ts
      2. Run: grep "@tailwind" src/app/globals.css
    Expected Result: darkMode: 'class', three @tailwind directives present
    Evidence: .sisyphus/evidence/task-6-config.txt
  ```

  **Commit**: YES (Wave 1 group)
  - Files: `tailwind.config.ts`, `src/app/globals.css`, updated `src/app/layout.tsx`

- [x] 7. **Dashboard Layout Shell & Navigation**

  **What to do**:
  - Create `src/app/(dashboard)/layout.tsx` — dashboard shell with sidebar + content area
  - Create `src/components/NavSidebar.tsx` — sidebar with links: Dashboard (`/dashboard`), API Keys (`/keys`), active state via `usePathname()`, purple accent for active
  - Dark background, responsive: sidebar collapses to icons on `< lg`
  - Top bar with "GemiHub" branding

  **Must NOT do**:
  - Do NOT add auth check in layout (that's Task 13 middleware)
  - Do NOT use any component library

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` — Reason: UI layout with responsive design, dark mode visual polish
  - **Skills**: `['impeccable']`
    - `impeccable`: Dark mode dashboard layout quality review

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 with Tasks 5, 6)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 12, 19, 20
  - **Blocked By**: 1, 4, 6

  **References**:
  - Next.js layouts: `https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts`
  - `usePathname`: `https://nextjs.org/docs/app/api-reference/functions/use-pathname`
  - Tailwind responsive: `https://tailwindcss.com/docs/responsive-design`

  **Acceptance Criteria**:
  - [ ] Dashboard layout renders with sidebar and content area
  - [ ] Sidebar has "Dashboard" and "API Keys" links
  - [ ] Active route highlighted with purple accent
  - [ ] Mobile: sidebar collapses to icons

  **QA Scenarios**:
  ```
  Scenario: Dashboard layout renders correctly
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/dashboard
      2. Wait 5s for page load
      3. Assert: "GemiHub" text visible
      4. Assert: "Dashboard" nav link exists
      5. Assert: "API Keys" nav link exists
      6. Assert: body has dark background class
    Expected Result: Full dark dashboard shell with navigation
    Evidence: .sisyphus/evidence/task-7-layout.png

  Scenario: Active nav link updates on navigation
    Tool: Playwright
    Steps:
      1. On /dashboard — verify "Dashboard" link has active styling
      2. Click "API Keys" link
      3. Verify "API Keys" link now has active styling
    Expected Result: Active state follows current route
    Evidence: .sisyphus/evidence/task-7-active-nav.png
  ```

  **Commit**: YES (Wave 1 group)
  - Files: `src/app/(dashboard)/layout.tsx`, `src/components/NavSidebar.tsx`

- [x] 8. **Dashboard Auth — Cookie Session**

  **What to do**:
  - Create `src/lib/auth/dashboard-auth.ts` with functions:
    `validatePasscode(passcode: string): boolean` — compares against `ADMIN_PASSCODE` env var
    `createSessionToken(): string` — generates a random token (use `crypto.randomUUID()`)
    `setAuthCookie(token: string): void` — sets httpOnly, secure, sameSite=strict, path=/ cookie named `admin_token`
    `verifyAuthCookie(): boolean` — reads and validates the `admin_token` cookie
    `clearAuthCookie(): void` — removes the cookie
  - Create `src/app/api/auth/login/route.ts` — POST handler: receives `{ passcode }`, validates against `ADMIN_PASSCODE`, sets cookie on success (200), returns 401 on failure
  - Create `src/app/api/auth/logout/route.ts` — POST handler: clears the auth cookie, returns 200

  **Must NOT do**:
  - Do NOT use JWT or Supabase Auth — simple string comparison only
  - Do NOT expose ADMIN_PASSCODE to client — comparison must be server-side
  - Do NOT make cookie accessible via JavaScript (`httpOnly: true`)

  **Recommended Agent Profile**:
  - **Category**: `quick` — Reason: Simple passcode comparison, standard cookie manipulation
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2 with Tasks 9, 10)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 12, 13
  - **Blocked By**: 2, 5

  **References**:
  - Next.js Route Handlers: `https://nextjs.org/docs/app/building-your-application/routing/route-handlers`
  - Next.js cookies API: `https://nextjs.org/docs/app/api-reference/functions/cookies`
  - `crypto.randomUUID()`: Standard Web Crypto API

  **Acceptance Criteria**:
  - [ ] `POST /api/auth/login` with correct passcode → 200 + `Set-Cookie: admin_token` header
  - [ ] `POST /api/auth/login` with wrong passcode → 401
  - [ ] `POST /api/auth/logout` → 200 + cookie cleared
  - [ ] Cookie has `httpOnly`, `secure`, `sameSite=strict`, `path=/`

  **QA Scenarios**:
  ```
  Scenario: Successful login sets auth cookie
    Tool: Bash (curl)
    Steps:
      1. Run: curl -v -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"passcode":"test123"}'
      2. Check response status code
      3. Check response headers for Set-Cookie
    Expected Result: HTTP 200, Set-Cookie header present with admin_token, httpOnly flag
    Failure Indicators: 401 on correct passcode, missing Set-Cookie, cookie not httpOnly
    Evidence: .sisyphus/evidence/task-8-login-success.txt

  Scenario: Failed login returns 401
    Tool: Bash (curl)
    Steps:
      1. Run: curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"passcode":"wrong"}'
    Expected Result: HTTP 401
    Evidence: .sisyphus/evidence/task-8-login-fail.txt
  ```

  **Commit**: YES (Wave 2 group)
  - Files: `src/lib/auth/dashboard-auth.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`

- [x] 9. **API Bearer Token Middleware**

  **What to do**:
  - Create `src/lib/auth/api-auth.ts` with:
    `validateBearerToken(request: Request): boolean` — extracts `Authorization` header, checks format `Bearer <token>`, compares against `MASTER_AUTH_TOKEN` env var
    `unauthorizedResponse(): Response` — returns 401 JSON: `{"error":{"message":"Missing or invalid authorization token","code":"UNAUTHORIZED"}}`
  - The middleware should be a simple function callable from route handlers, not Next.js middleware (to keep Edge Runtime lightweight)
  - Add timing-safe comparison to prevent timing attacks: use `crypto.timingSafeEqual` or byte-by-byte comparison

  **Must NOT do**:
  - Do NOT log the actual token value in errors
  - Do NOT use regex for token extraction (use `String.startsWith('Bearer ')` then slice)

  **Recommended Agent Profile**:
  - **Category**: `quick` — Reason: Simple header extraction + string comparison
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2 with Tasks 8, 10)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 18
  - **Blocked By**: 2

  **References**:
  - Web Crypto timingSafeEqual: Standard API available in Edge Runtime
  - Next.js Request object: standard Web API `Request`

  **Acceptance Criteria**:
  - [ ] `validateBearerToken` returns true for valid `Authorization: Bearer <MASTER_AUTH_TOKEN>`
  - [ ] `validateBearerToken` returns false for missing Authorization header
  - [ ] `validateBearerToken` returns false for wrong token
  - [ ] `validateBearerToken` returns false for `Authorization: Basic xxx` (wrong scheme)
  - [ ] `unauthorizedResponse()` returns 401 with JSON body in OpenAI error format

  **QA Scenarios**:
  ```
  Scenario: Valid token passes validation
    Tool: Bash (Node REPL)
    Steps:
      1. Set env: export MASTER_AUTH_TOKEN="test-secret-token"
      2. Run: npx tsx -e "import {validateBearerToken} from './src/lib/auth/api-auth'; const req = new Request('http://localhost', {headers: {Authorization: 'Bearer test-secret-token'}}); console.log(validateBearerToken(req))"
    Expected Result: "true"
    Evidence: .sisyphus/evidence/task-9-valid-token.txt

  Scenario: Missing token fails validation
    Tool: Bash (Node REPL)
    Steps:
      1. Run: npx tsx -e "import {validateBearerToken} from './src/lib/auth/api-auth'; const req = new Request('http://localhost'); console.log(validateBearerToken(req))"
    Expected Result: "false"
    Evidence: .sisyphus/evidence/task-9-missing-token.txt
  ```

  **Commit**: YES (Wave 2 group)
  - Files: `src/lib/auth/api-auth.ts`

- [x] 10. **API Keys CRUD Server Actions**

  **What to do**:
  - Create `src/lib/supabase/operations/api-keys.ts` with `'use server'` directive and these exported functions:
    `getAllKeys(): Promise<ApiKey[]>` — `SELECT * FROM api_keys ORDER BY created_at DESC`
    `createApiKey(name: string, keyString: string): Promise<ApiKey>` — `INSERT INTO api_keys (name, key_string) VALUES (...)` returning *
    `toggleApiKey(id: number): Promise<void>` — `UPDATE api_keys SET is_active = NOT is_active, error_count = 0 WHERE id = ...`
    `deleteApiKey(id: number): Promise<void>` — `DELETE FROM api_keys WHERE id = ...`
    `getActiveKeys(): Promise<ApiKey[]>` — `SELECT * FROM api_keys WHERE is_active = true ORDER BY id` (used by load balancer)
    `incrementErrorCount(id: number): Promise<void>` — `UPDATE api_keys SET error_count = error_count + 1, last_used_at = NOW() WHERE id = ...`
    `updateLastUsed(id: number): Promise<void>` — `UPDATE api_keys SET last_used_at = NOW() WHERE id = ...`
  - Use `createAdminClient()` from Task 5 for all operations (service_role bypasses RLS on internal tables)
  - Add proper error handling: wrap each function, return meaningful errors

  **Must NOT do**:
  - Do NOT expose `key_string` in client-side responses selectively (return full object from server actions — they're server-only, safe)
  - Do NOT forget `'use server'` directive

  **Recommended Agent Profile**:
  - **Category**: `deep` — Reason: Full CRUD implementation with proper error handling, multiple query patterns
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2 with Tasks 8, 9)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 16, 19, 20
  - **Blocked By**: 3, 4, 5

  **References**:
  - Supabase JS select/insert docs: `https://supabase.com/docs/reference/javascript/select`
  - `'use server'` directive: `https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations`
  - OSS pattern: api-key-vault `lib/db.ts` — full CRUD with error handling
  - Types: `src/lib/types.ts` — `ApiKey` interface

  **Acceptance Criteria**:
  - [ ] `getAllKeys()` returns array (empty if no keys)
  - [ ] `createApiKey()` inserts and returns the new row with all fields
  - [ ] `toggleApiKey()` flips `is_active` and resets `error_count`
  - [ ] `deleteApiKey()` removes the row
  - [ ] `getActiveKeys()` returns only `is_active = true` keys
  - [ ] `incrementErrorCount()` increments by 1 and updates `last_used_at`
  - [ ] All functions have `'use server'` at top of file

  **QA Scenarios**:
  ```
  Scenario: CRUD cycle — create, read, toggle, delete
    Tool: Bash (Node REPL via tsx)
    Steps:
      1. Import functions from the module
      2. Call createApiKey("test-key", "gemini-api-key-123")
      3. Call getAllKeys() — assert returned array includes the new key
      4. Call toggleApiKey(newKey.id) — assert is_active flipped
      5. Call deleteApiKey(newKey.id)
      6. Call getAllKeys() — assert key is gone
    Expected Result: Full CRUD lifecycle works without errors
    Failure Indicators: Supabase connection errors, missing fields, toggle not flipping
    Evidence: .sisyphus/evidence/task-10-crud-cycle.txt
  ```

  **Commit**: YES (Wave 2 group)
  - Files: `src/lib/supabase/operations/api-keys.ts`

- [x] 11. **Request Logs Query Functions**

  **What to do**:
  - Create `src/lib/supabase/operations/request-logs.ts` with `'use server'` directive and functions: `logRequest()`, `getRequestStats()`, `getRecentLogs()`
  - `logRequest` inserts into request_logs table; `getRequestStats` returns active key count, rate-limited count, total request count using Supabase `.select('*', { count: 'exact', head: true })`
  - Use `createAdminClient()` for all operations

  **Must NOT do**:
  - Do NOT include actual API key strings in log responses

  **Recommended Agent Profile**: `quick` — simple INSERT + aggregate queries
  **Category**: `quick` | **Skills**: `[]`

  **Parallelization**: Wave 2 with Tasks 12, 13 | **Blocks**: Task 19 | **Blocked By**: 3, 5

  **References**: Supabase count: `https://supabase.com/docs/reference/javascript/count`

  **Acceptance Criteria**:
  - [ ] `logRequest()` inserts a row into request_logs
  - [ ] `getRequestStats()` returns `{ activeKeys, rateLimitedKeys, totalRequests }` with correct numbers
  - [ ] `getRecentLogs(10)` returns up to 10 recent entries

  **QA Scenarios**:
  ```
  Scenario: Log and retrieve request
    Tool: Bash (Node REPL)
    Steps:
      1. Call logRequest({ apiKeyId: 1, model: "gemini-2.0-flash", statusCode: 200, tokensUsed: 42, latencyMs: 350 })
      2. Call getRecentLogs(1) and verify data matches
    Expected Result: Log entry retrievable with correct values
    Evidence: .sisyphus/evidence/task-11-log-roundtrip.txt
  ```

  **Commit**: YES (Wave 2 group)
  - Files: `src/lib/supabase/operations/request-logs.ts`

- [x] 12. **Login Page UI**

  **What to do**:
  - Create `src/app/(dashboard)/login/page.tsx` — client component with dark-themed centered card, password input, submit button with purple accent + loading spinner, error display
  - Create `src/components/LoginForm.tsx` — reusable form that posts to `/api/auth/login`, on success redirects to `/dashboard`
  - "GemiHub" branding + "API Gateway" subtitle

  **Must NOT do**: Do NOT expose ADMIN_PASSCODE client-side

  **Recommended Agent Profile**: `visual-engineering` | **Skills**: `['impeccable']`

  **Parallelization**: Wave 2 with Tasks 10, 11, 13 | **Blocks**: Task 13 | **Blocked By**: 4, 6, 7, 8

  **Acceptance Criteria**:
  - [ ] Login page renders at `/login` with dark background
  - [ ] Correct passcode → redirect to `/dashboard`; Wrong passcode → error shown
  - [ ] Loading spinner during submission

  **QA Scenarios**:
  ```
  Scenario: Correct passcode redirects to dashboard
    Tool: Playwright
    Steps:
      1. Navigate to /login, fill passcode input, click submit
      2. Wait 5s for navigation
      3. Assert URL is /dashboard
    Expected Result: Redirected after login
    Evidence: .sisyphus/evidence/task-12-login-success.png

  Scenario: Wrong passcode shows error
    Tool: Playwright
    Steps:
      1. Navigate to /login, fill wrong passcode, click submit
      2. Assert red error text visible, still on /login
    Expected Result: Error shown, not redirected
    Evidence: .sisyphus/evidence/task-12-login-fail.png
  ```

  **Commit**: YES (Wave 2 group) | Files: `src/app/(dashboard)/login/page.tsx`, `src/components/LoginForm.tsx`

- [x] 13. **Dashboard Middleware — Route Protection**

  **What to do**:
  - Create `src/middleware.ts` at project root, checking `/dashboard/*` routes
  - Read `admin_token` cookie, validate via Task 8's `verifyAuthCookie()`. Valid → proceed. Invalid → redirect to `/login`
  - `/login` route: if already authenticated → redirect to `/dashboard`
  - Matcher: only run on `/dashboard/:path*` and `/login`

  **Must NOT do**: Do NOT run middleware on `/api/*` or static assets

  **Recommended Agent Profile**: `quick` | **Skills**: `[]`

  **Parallelization**: Wave 2 after Tasks 8, 12 | **Blocks**: 19, 20 | **Blocked By**: 8, 12

  **Acceptance Criteria**:
  - [ ] Unauthenticated → `/dashboard` redirects to `/login`
  - [ ] Authenticated → `/dashboard` loads normally
  - [ ] Authenticated → `/login` redirects to `/dashboard`
  - [ ] API routes unaffected

  **QA Scenarios**:
  ```
  Scenario: Unauthenticated user redirected
    Tool: Playwright
    Steps: Clear cookies, navigate to /dashboard, wait 3s. Assert URL is /login.
    Expected Result: Redirect to login
    Evidence: .sisyphus/evidence/task-13-unauth-redirect.png
  ```

  **Commit**: YES (Wave 2 group) | Files: `src/middleware.ts`

- [x] 14. **Gemini API Proxy — Non-Streaming**

  **What to do**:
  - Create `src/lib/gemini/proxy.ts` with `callGeminiNonStreaming(request: GeminiRequest, apiKey: string): Promise<GeminiResponse>`
  - Translates OpenAI `messages[{role, content}]` → Gemini `contents[{role, parts:[{text}]}]` format, `system` role → `systemInstruction.parts[{text}]`
  - POST to `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` with `x-goog-api-key` header
  - Parse JSON response: extract `candidates[0].content.parts[0].text`, include `usageMetadata`
  - Handle errors: throw typed error with HTTP status from Gemini

  **Must NOT do**: Do NOT modify original request object. Do NOT swallow Gemini error status codes.

  **Recommended Agent Profile**: `deep` | **Skills**: `[]`
  **Parallelization**: Wave 3 with Task 15 | **Blocks**: Task 18 | **Blocked By**: 2, 4

  **Acceptance Criteria**:
  - [ ] OpenAI messages correctly mapped to Gemini contents format
  - [ ] `system` role mapped to `systemInstruction`
  - [ ] Response parsed: text extracted from `candidates[0].content.parts[0].text`
  - [ ] Gemini errors throw with correct HTTP status code

  **QA Scenarios**:
  ```
  Scenario: Non-streaming request returns parsed response
    Tool: Bash (Node REPL with valid Gemini key)
    Steps:
      1. Import callGeminiNonStreaming
      2. Call with { model: "gemini-2.0-flash", messages: [{role:"user",content:"Say hello in one word"}], stream: false }
      3. Assert response has text content
    Expected Result: JSON object with text from Gemini
    Evidence: .sisyphus/evidence/task-14-nonstreaming.txt
  ```

  **Commit**: YES (Wave 3 group) | Files: `src/lib/gemini/proxy.ts`

- [x] 15. **Gemini API Proxy — Streaming SSE**

  **What to do**:
  - Add `callGeminiStreaming(request: GeminiRequest, apiKey: string): Promise<ReadableStream>` to `src/lib/gemini/proxy.ts`
  - POST to `{model}:streamGenerateContent?alt=sse`, return `ReadableStream` that:
    - Reads Gemini SSE chunks (`\n\n` delimited), parses `data: {...}` as JSON
    - Extracts text from `candidates[0].content.parts[0].text`
    - Re-emits as OpenAI-compatible SSE: `data: {"choices":[{"delta":{"content":"..."}}]}\n\n`
    - Sends `data: [DONE]\n\n` when stream ends
  - Handle stream errors: emit error SSE event before closing

  **Must NOT do**: Do NOT buffer entire response. Do NOT forget to close stream on error.

  **Recommended Agent Profile**: `deep` | **Skills**: `[]`
  **Parallelization**: Wave 3 with Task 14 | **Blocks**: Task 18 | **Blocked By**: 2, 4

  **Acceptance Criteria**:
  - [ ] Returns ReadableStream for streaming
  - [ ] Gemini chunks re-emitted in OpenAI SSE format
  - [ ] `data: [DONE]` sent at stream end
  - [ ] Stream errors handled gracefully

  **QA Scenarios**:
  ```
  Scenario: Streaming SSE returns content chunks
    Tool: Bash (curl)
    Steps:
      1. POST with stream:true, messages:[{role:"user",content:"Count 1 to 5"}]
      2. Read SSE stream line by line
      3. Assert at least 3 "data:" events with content delta
      4. Assert final event is "data: [DONE]"
    Expected Result: Multiple SSE delta events, terminated by [DONE]
    Evidence: .sisyphus/evidence/task-15-streaming.txt
  ```

  **Commit**: YES (Wave 3 group) | Files: `src/lib/gemini/proxy.ts` (updated)

- [ ] 16. **LRU Load Balancer**

  **What to do**:
  - Create `src/lib/gemini/load-balancer.ts` with thread-safe LRU strategy:
    `selectNextKey(): Promise<ApiKey | null>` — queries `getActiveKeys()` (Task 10), returns least-recently-used key (`ORDER BY last_used_at ASC NULLS FIRST LIMIT 1`)
    `markKeyUsed(keyId: number): Promise<void>` — calls `updateLastUsed()` (Task 10)
  - Uses DB for state (no in-memory counter — safe across serverless instances)

  **Must NOT do**: Do NOT use in-memory index. Do NOT select disabled keys.

  **Recommended Agent Profile**: `deep` | **Skills**: `[]`
  **Parallelization**: Wave 3 with 14, 15, 17 | **Blocks**: Task 18 | **Blocked By**: 4, 10

  **Acceptance Criteria**:
  - [ ] `selectNextKey()` returns least recently used active key
  - [ ] Returns null when no active keys
  - [ ] Even distribution across multiple sequential calls

  **QA Scenarios**:
  ```
  Scenario: LRU distributes across 3 keys
    Tool: Bash (Node REPL with 3 keys in DB)
    Steps: Call selectNextKey() 9 times, tally key IDs
    Expected Result: Each key selected ~3 times
    Evidence: .sisyphus/evidence/task-16-lru.txt
  ```

  **Commit**: YES (Wave 3 group) | Files: `src/lib/gemini/load-balancer.ts`

- [ ] 17. **429 Retry & Key Rotation**

  **What to do**:
  - Create `src/lib/gemini/retry.ts` with `executeWithRetry(request: GeminiRequest): Promise<Response>`
  - Loop: get key → attempt Gemini call:
    - 429: mark key rate-limited (`incrementErrorCount` + disable via `toggleApiKey`), try next key
    - 500/503/504: retry same key with exponential backoff (1s→2s→4s, max 3)
    - 400/401/403/404/413: return error immediately (no retry)
    - Success: log request, mark key used
  - All keys exhausted → return 503 `{error:{message:"All API keys exhausted",code:"NO_KEYS_AVAILABLE"}}`

  **Must NOT do**: Do NOT retry on client errors. Do NOT retry 429 on same key.

  **Recommended Agent Profile**: `deep` | **Skills**: `[]`
  **Parallelization**: Wave 3 with 14, 15, 16 | **Blocks**: Task 18 | **Blocked By**: 4, 10, 14

  **Acceptance Criteria**:
  - [ ] 429 triggers key rotation + key disabled
  - [ ] 500/503/504 retries same key with backoff
  - [ ] 400/401/403/404 does NOT retry
  - [ ] All keys exhausted returns 503

  **QA Scenarios**:
  ```
  Scenario: 429 rotates to next key
    Tool: Bash (Node REPL, mock Gemini)
    Preconditions: 3 active keys, mock returns 429 for key 0
    Steps: Call executeWithRetry, verify key 0 disabled, key 1 used
    Expected Result: Request succeeds on alternate key
    Evidence: .sisyphus/evidence/task-17-rotation.txt

  Scenario: All keys exhausted returns 503
    Tool: Bash (Node REPL, all mocks return 429)
    Steps: Call executeWithRetry, verify 503 response
    Expected Result: 503 with "All API keys exhausted"
    Evidence: .sisyphus/evidence/task-17-exhausted.txt
  ```

  **Commit**: YES (Wave 3 group) | Files: `src/lib/gemini/retry.ts`

- [ ] 18. **API Route Handler — /api/v1/chat/completions**

  **What to do**:
  - Create `src/app/api/v1/chat/completions/route.ts` with Edge Runtime
  - POST handler: auth check (Task 9) → parse JSON → call `executeWithRetry` (Task 17) → return streaming SSE or JSON
  - OPTIONS handler: CORS preflight with `Access-Control-Allow-Origin: *`
  - All error responses in OpenAI-compatible JSON format

  **Must NOT do**: Do NOT skip CORS. Do NOT call Gemini directly from route handler.

  **Recommended Agent Profile**: `deep` | **Skills**: `[]`
  **Parallelization**: Wave 3 after all deps | **Blocks**: None | **Blocked By**: 2, 4, 9, 14, 15, 16, 17

  **Acceptance Criteria**:
  - [ ] POST with valid Bearer → 200 + SSE/JSON response
  - [ ] POST without auth → 401
  - [ ] OPTIONS → 200 with CORS headers
  - [ ] stream:true → Content-Type: text/event-stream
  - [ ] stream:false → Content-Type: application/json

  **QA Scenarios**:
  ```
  Scenario: Valid streaming request
    Tool: curl
    Steps: POST with Bearer token, stream:true → assert 200 + SSE headers
    Evidence: .sisyphus/evidence/task-18-streaming.txt

  Scenario: Missing auth → 401
    Tool: curl
    Steps: POST without Authorization → assert 401
    Evidence: .sisyphus/evidence/task-18-unauth.txt

  Scenario: Invalid body → 400
    Tool: curl
    Steps: POST with malformed JSON → assert 400
    Evidence: .sisyphus/evidence/task-18-badrequest.txt
  ```

  **Commit**: YES (Wave 3 group) | Files: `src/app/api/v1/chat/completions/route.ts`

- [ ] 19. **Dashboard Stats Page**

  **What to do**:
  - Create `src/app/(dashboard)/dashboard/page.tsx` (server component) + `src/components/StatsCard.tsx`
  - Query `getRequestStats()` from Task 11
  - Display 4 stat cards: "Active Keys" (purple), "Rate Limited" (amber), "Total Requests" (blue), "Avg Latency" (green)
  - Dark card layout, large numbers, "Refresh" button

  **Must NOT do**: No WebSocket, no charts, no polling.

  **Recommended Agent Profile**: `visual-engineering` | **Skills**: `['impeccable']`
  **Parallelization**: Wave 4 with 20, 21, 22 | **Blocks**: None | **Blocked By**: 4, 7, 10, 11, 13

  **Acceptance Criteria**: [ ] Stat cards with correct values | [ ] Dark themed cards | [ ] Refresh button works

  **QA Scenarios**: `Scenario: Dashboard shows stats` → Playwright: login, navigate /dashboard, assert stat cards visible with numbers → Evidence: `task-19-stats.png`

  **Commit**: YES (Wave 4 group) | Files: `src/app/(dashboard)/dashboard/page.tsx`, `src/components/StatsCard.tsx`

- [ ] 20. **Key Management CRUD Page**

  **What to do**:
  - Create `src/app/(dashboard)/keys/page.tsx` (client component) + `src/components/KeyTable.tsx` + `src/components/KeyForm.tsx`
  - Query keys via `getAllKeys()` (Task 10), display in dark table with masked key strings
  - Add Key modal form, toggle active/inactive, delete with confirmation
  - Client-side pagination (10/page), search by name

  **Must NOT do**: No server-side pagination. No plaintext key display without reveal toggle.

  **Recommended Agent Profile**: `visual-engineering` | **Skills**: `['impeccable']`
  **Parallelization**: Wave 4 with 19, 21, 22 | **Blocks**: None | **Blocked By**: 4, 7, 10, 13

  **Acceptance Criteria**: [ ] Table displays all keys | [ ] Add modal creates key | [ ] Toggle flips is_active | [ ] Delete removes after confirm | [ ] Pagination works | [ ] Key masked by default

  **QA Scenarios**: 
  - `Scenario: Add key` → Playwright: click Add, fill form, submit, verify new row → Evidence: `task-20-add-key.png`
  - `Scenario: Toggle key` → Playwright: click toggle, verify badge change → Evidence: `task-20-toggle.png`
  - `Scenario: Delete key` → Playwright: click delete, confirm, verify row gone → Evidence: `task-20-delete.png`

  **Commit**: YES (Wave 4 group) | Files: `src/app/(dashboard)/keys/page.tsx`, `src/components/KeyTable.tsx`, `src/components/KeyForm.tsx`

- [ ] 21. **Deployment Guide**

  **What to do**:
  - Create `DEPLOYMENT.md` with Supabase setup (7 steps: account → project → keys → SQL Editor → paste schema → run → get service_role key) + Vercel deploy (6 steps: push → import → configure → env vars → deploy → verify)
  - Include env vars checklist, curl verification commands

  **Recommended Agent Profile**: `writing` | **Skills**: `[]`
  **Parallelization**: Wave 4 independent | **Blocks**: None | **Blocked By**: None

  **Acceptance Criteria**: [ ] DEPLOYMENT.md exists | [ ] Supabase section complete | [ ] Vercel section complete | [ ] Env vars checklist | [ ] Curl test commands

  **QA Scenarios**: `Scenario: Guide completeness` → Bash: count sections, verify all steps → Evidence: `task-21-guide.txt`

  **Commit**: YES (Wave 4 group) | Files: `DEPLOYMENT.md`

- [ ] 22. **README.md**

  **What to do**:
  - Create `README.md`: title + tagline, features, quick start, env reference table, API curl examples, architecture ASCII diagram, project structure tree, link to DEPLOYMENT.md, MIT license

  **Recommended Agent Profile**: `writing` | **Skills**: `[]`
  **Parallelization**: Wave 4 independent | **Blocks**: None | **Blocked By**: None

  **Acceptance Criteria**: [ ] README exists | [ ] All sections present | [ ] Curl examples | [ ] Links to DEPLOYMENT.md

  **QA Scenarios**: `Scenario: README sections` → Bash: grep for sections → Evidence: `task-22-readme.txt`

  **Commit**: YES (Wave 4 group) | Files: `README.md`

---

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + `npx next lint`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (login → dashboard → manage keys). Test edge cases: empty key pool, all keys disabled, invalid passcode, missing auth header.
  Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(scaffold): initialize Next.js project with config and types` — all Wave 1 files
- **Wave 2**: `feat(auth): add dashboard auth, API middleware, and key CRUD` — all Wave 2 files
- **Wave 3**: `feat(gateway): implement Gemini proxy with streaming, LB, and retry` — all Wave 3 files
- **Wave 4**: `feat(dashboard): add stats, key management UI, and deployment docs` — all Wave 4 files
- **Final**: `docs: final verification adjustments` — any post-review fixes

---

## Success Criteria

### Verification Commands
```bash
# Project builds without errors
npm run dev          # Expected: starts on localhost:3000 without errors

# API endpoint accepts valid requests
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer test-master-token" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-2.0-flash","messages":[{"role":"user","content":"Hello"}],"stream":false}' \
  # Expected: 200 with JSON response or 503 if no keys configured

# API endpoint rejects unauthorized requests
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-2.0-flash","messages":[{"role":"user","content":"Hello"}]}' \
  # Expected: 401 {"error":{"message":"Missing or invalid authorization token"}}

# Dashboard login works
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"passcode":"test-admin-passcode"}' \
  # Expected: 200 with Set-Cookie header
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All 22 tasks completed with evidence
- [ ] F1-F4 all APPROVE
- [ ] User gives explicit "okay"
