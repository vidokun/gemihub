# Learnings — API Route Handler

## Route Conventions
- Next.js App Router route handlers export named async functions (`POST`, `OPTIONS`) taking `Request` and returning `Response`.
- Edge Runtime: `export const runtime = 'edge'` at module top-level.
- CORS headers must be applied to ALL responses (including preflight OPTIONS, 401, 400, and the proxied Gemini response).

## Auth Flow
- `validateBearerToken(request)` reads `Authorization: Bearer <token>` header, compares against `MASTER_AUTH_TOKEN` env var.
- `unauthorizedResponse()` returns `{ error: { message, code } }` with status 401 — OpenAI-compatible shape.

## Retry Module (executeWithRetry)
- `executeWithRetry(request: GeminiRequest)` handles all Gemini proxying, retry, key rotation, and logging internally.
- Returns a standard `Response` object (already has Content-Type set).
- Does NOT set CORS headers — the route handler must inject those onto the returned response.

## CORS Strategy
- Apply CORS headers to every response path: OPTIONS, POST success, POST error (401, 400, 503 from retry).
- OPTIONS returns 204 with CORS headers only (no body).
- Use `response.headers.set()` to add CORS headers to `unauthorizedResponse()` and `executeWithRetry()` results (which are already Response objects).
