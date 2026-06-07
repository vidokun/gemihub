# GemiHub: Next.js AI API Gateway & Load Balancer

Route chat completion requests to Google Gemini through a managed pool of API keys. Round-robin distribution, automatic 429 retry, streaming SSE, and an admin dashboard to keep tabs on everything.

## Features

- **OpenAI-compatible endpoint.** `/v1/chat/completions` speaks the same JSON as OpenAI's API
- **Streaming (SSE).** Token-by-token streaming with proper `text/event-stream` responses
- **LRU load balancing.** Least-recently-used key selection spreads traffic evenly across your Gemini keys
- **429 retry with rotation.** When a key hits its rate limit, the gateway marks it, switches to the next key, and keeps going
- **Admin dashboard.** See active keys, rate-limited keys, total requests, and average latency at a glance
- **Key management.** Full CRUD for API keys: add, toggle, delete, search, paginate
- **Request logging.** Every proxied request is recorded in Supabase with status, tokens, and timing
- **Passcode auth.** The dashboard is behind a simple passcode (httpOnly cookie, no Supabase Auth)
- **Bearer token protection.** All `/api/v1/*` routes require a `MASTER_AUTH_TOKEN`
- **Dark mode UI.** Tailwind dark theme, card-based stats, responsive sidebar
- **Serverless-ready.** Edge Runtime on the API route, LRU state in the database (no in-memory counters)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-org/gemihub.git
cd gemihub

# Copy the env template
cp .env.example .env.local

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) to reach the dashboard. You'll need to configure your `.env.local` first (see below).

## Architecture

```
                        ┌─────────────────────┐
                        │      Client          │
                        │  (curl, app, SDK)    │
                        └─────────┬───────────┘
                                  │
                          POST /api/v1/chat/completions
                          Authorization: Bearer <token>
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────┐
│                     GemiHub Gateway                      │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ Bearer Auth  │  │  LRU Load    │  │  429 Retry    │ │
│  │  Middleware  │──│  Balancer    │──│  + Rotation   │ │
│  └──────────────┘  └──────────────┘  └───────────────┘ │
│                          │                              │
│               ┌──────────┴──────────┐                   │
│               │   Gemini Proxy      │                   │
│               │  (streaming + JSON) │                   │
│               └──────────┬──────────┘                   │
│                          │                              │
│               ┌──────────┴──────────┐                   │
│               │   Request Logger    │                   │
│               │   (Supabase DB)     │                   │
│               └─────────────────────┘                   │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │        Google Gemini API       │
         │  (generativelanguage.googleapis│
         │   .com)                        │
         └────────────────────────────────┘
```

1. Request arrives with `Authorization: Bearer <MASTER_AUTH_TOKEN>`
2. Gateway validates the token (401 if missing or wrong)
3. LRU load balancer picks the least-recently-used active key from Supabase
4. Gemini proxy translates the OpenAI-format body to Gemini's native format, sends the request
5. If Gemini returns 429: key is auto-disabled, error count incremented, next key tried
6. Response is streamed back as SSE (`stream: true`) or returned as JSON (`stream: false`)
7. Every request is logged to `request_logs` with model, status, tokens, and latency

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL (`https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase publishable anon key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service_role key (server-only, bypasses RLS) |
| `ADMIN_PASSCODE` | Yes | Passcode for dashboard login (kept server-side) |
| `MASTER_AUTH_TOKEN` | Yes | Bearer token required on all `/api/v1/*` requests |

Copy `.env.example` to `.env.local` and fill in real values. The `NEXT_PUBLIC_` prefix makes those two available to the browser; the other three stay server-only.

## Database Setup

Run the SQL in `supabase/schema.sql` in your Supabase project's SQL Editor. It creates two tables:

- `api_keys`: stores your Gemini API keys with metadata
- `request_logs`: records every proxied request

Then add your Gemini keys via the dashboard at `/keys`.

## API Usage

The gateway exposes a single endpoint that mimics OpenAI's chat completions API.

### Base URL

```
http://localhost:3000/api/v1/chat/completions
```

### Non-streaming Request

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer ghub_master_abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [
      {"role": "user", "content": "Explain quantum computing in one sentence."}
    ],
    "stream": false,
    "temperature": 0.7,
    "maxOutputTokens": 256
  }'
```

Response:

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1717200000,
  "model": "gemini-2.0-flash",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Quantum computing uses qubits that can exist in multiple states simultaneously, enabling certain calculations to be performed exponentially faster than classical computers."
      },
      "finish_reason": "STOP"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 28,
    "total_tokens": 40
  }
}
```

### Streaming Request

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer ghub_master_abc123def456" \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [
      {"role": "user", "content": "Count from 1 to 5 slowly."}
    ],
    "stream": true
  }'
```

Response (SSE):

```
data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1717200000,"model":"gemini-2.0-flash","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1717200000,"model":"gemini-2.0-flash","choices":[{"index":0,"delta":{"content":"1"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1717200000,"model":"gemini-2.0-flash","choices":[{"index":0,"delta":{"content":", 2"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1717200000,"model":"gemini-2.0-flash","choices":[{"index":0,"delta":{"content":", 3"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1717200000,"model":"gemini-2.0-flash","choices":[{"index":0,"delta":{"content":", 4"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1717200000,"model":"gemini-2.0-flash","choices":[{"index":0,"delta":{"content":", 5"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1717200000,"model":"gemini-2.0-flash","choices":[{"index":0,"delta":{},"finish_reason":"STOP"}]}

data: [DONE]
```

### Error Responses

All errors follow OpenAI's error shape:

```json
{
  "error": {
    "message": "Missing or invalid authorization token",
    "code": "UNAUTHORIZED"
  }
}
```

| Status | Code | Meaning |
|---|---|---|
| 400 | `INVALID_REQUEST` | Malformed JSON or missing required fields |
| 401 | `UNAUTHORIZED` | Missing or wrong Bearer token |
| 503 | `NO_KEYS_AVAILABLE` | All API keys are exhausted or disabled |

## Dashboard

| Route | Description |
|---|---|
| `/login` | Passcode login page |
| `/dashboard` | Stats overview: active keys, rate-limited count, total requests, avg latency |
| `/keys` | CRUD table: add, toggle, delete, search API keys |

The dashboard is protected by middleware. Unauthenticated visitors get redirected to `/login`.

## Project Structure

```
gemihub/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/          # Stats page (server component)
│   │   │   ├── keys/               # Key management page (client component)
│   │   │   ├── login/              # Passcode login page
│   │   │   └── layout.tsx          # Dashboard shell + sidebar
│   │   ├── api/
│   │   │   ├── v1/chat/completions/ # Gateway endpoint (Edge Runtime)
│   │   │   └── auth/
│   │   │       ├── login/route.ts   # POST passcode → set cookie
│   │   │       └── logout/route.ts  # POST → clear cookie
│   │   ├── globals.css             # Tailwind + dark CSS vars
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Landing page
│   ├── components/
│   │   ├── LoginForm.tsx           # Passcode form with spinner + errors
│   │   └── NavSidebar.tsx          # Dashboard navigation sidebar
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── api-auth.ts         # Bearer token validation
│   │   │   └── dashboard-auth.ts   # Cookie session utilities
│   │   ├── gemini/
│   │   │   ├── proxy.ts            # Gemini API call (streaming + non-streaming)
│   │   │   ├── load-balancer.ts    # LRU key selection
│   │   │   └── retry.ts            # 429 rotation + exponential backoff
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser client (publishable key)
│   │   │   ├── server.ts           # Server client (cookie store)
│   │   │   ├── admin.ts            # Admin client (service_role, server-only)
│   │   │   ├── database.types.ts   # Supabase type definitions
│   │   │   └── operations/
│   │   │       ├── api-keys.ts     # Key CRUD server actions
│   │   │       └── request-logs.ts # Logging + stats queries
│   │   ├── env.ts                  # Type-safe env accessor
│   │   └── types.ts                # Shared TypeScript interfaces
│   └── middleware.ts               # Dashboard route protection
├── supabase/
│   └── schema.sql                  # DDL for api_keys + request_logs
├── public/                         # Static assets
├── .env.example                    # Environment variable template
├── next.config.ts                  # Next.js config
├── package.json
├── tsconfig.json
├── DEPLOYMENT.md                   # Supabase + Vercel deployment guide
└── README.md
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions:

- **Part 1**: Set up Supabase (project, tables, API keys)
- **Part 2**: Deploy to Vercel (push, configure env vars, go live)
- **Part 3**: Post-deployment verification with curl

## License

MIT License

Copyright (c) 2025 GemiHub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
