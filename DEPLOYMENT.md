# Deployment Guide

Follow these steps to deploy GemiHub to production. You'll set up a Supabase database, then deploy the Next.js app to Vercel.

---

## Prerequisites

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (sign up with GitHub for the easiest flow)

---

## Part 1: Supabase

### 1. Create a Supabase account

Go to [https://supabase.com](https://supabase.com) and sign up (GitHub login works fine).

### 2. Create a new project

- Click **New project**.
- Pick an organization (Supabase creates one for you by default).
- Give the project a name, e.g. `gemihub`.
- Set a secure **Database Password** (save it somewhere safe; you'll need it later).
- Choose the region closest to your users.
- Click **Create project**. This takes about 2 minutes.

### 3. Get your URL and anon key

Once the project is ready:

- Go to **Project Settings** (gear icon in the sidebar).
- Click **API** in the settings menu.
- Copy the **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`).
- Copy the **anon public** key (starts with `sb_publishable_`).

These become `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 4. Run the schema

- In the Supabase dashboard sidebar, click **SQL Editor**.
- Click **New query**.
- Open the file `supabase/schema.sql` from this repository and copy its entire contents.
- Paste it into the SQL Editor.
- Click **Run** (or press Cmd+Enter).

You should see "Success. No rows returned". The tables `api_keys` and `request_logs` are now created.

### 5. Get your service role key

- Go back to **Project Settings** → **API**.
- Copy the **service_role secret** key (starts with `sb_secret_`).

This becomes `SUPABASE_SERVICE_ROLE_KEY`. Keep this key private. It bypasses Row Level Security and should never be exposed to the browser.

---

## Part 2: Vercel

### 6. Push your code to GitHub

If you haven't already, push this repository to a GitHub repo:

```bash
git remote add origin https://github.com/YOUR_USERNAME/gemihub.git
git push -u origin main
```

### 7. Import the repo into Vercel

- Go to [https://vercel.com/new](https://vercel.com/new).
- Click **Import** on your `gemihub` repository.
- If you haven't connected GitHub yet, Vercel will prompt you to do so.

### 8. Configure the project

On the import screen:

- **Framework Preset**: Vercel should auto-detect **Next.js**. If not, select it manually.
- **Root Directory**: Leave as default (usually `.` or `./`).
- **Build Command**: Leave as default (`next build`).
- **Output Directory**: Leave as default.

### 9. Set environment variables

Expand the **Environment Variables** section and add these five variables:

| Name | Value (example) | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxxxxxx.supabase.co` | From Supabase Step 3 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` | From Supabase Step 3 |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | From Supabase Step 5 |
| `ADMIN_PASSCODE` | A secure passcode you choose | Used to log into the admin dashboard |
| `MASTER_AUTH_TOKEN` | A secure random token you choose | Used to authenticate API clients |

All five are required. The app will fail to start if any are missing.

Tips for `ADMIN_PASSCODE` and `MASTER_AUTH_TOKEN`:
- Use long, random strings. You can generate one with `openssl rand -hex 32`.
- Do not use the example values from `.env.example`.
- `MASTER_AUTH_TOKEN` is what clients pass in `Authorization: Bearer <token>`.

### 10. Deploy

- Click **Deploy**.
- Vercel builds and deploys the app. This takes 1-2 minutes.
- Once done, you'll see a **Congratulations** page with your production URL (e.g. `https://gemihub.vercel.app`).

### 11. Verify the deployment

Open your production URL in a browser. You should see the GemiHub homepage.

---

## Part 3: Testing the API

Replace `YOUR_DOMAIN` with your actual Vercel domain and `YOUR_MASTER_TOKEN` with the value you set for `MASTER_AUTH_TOKEN`.

### Non-streaming request

```bash
curl -s https://YOUR_DOMAIN/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_MASTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [
      {"role": "user", "content": "Say hello in exactly 5 words."}
    ],
    "stream": false
  }'
```

Expected response (200 OK):

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "model": "gemini-2.0-flash",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello there, how are you?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": ...,
    "completion_tokens": ...,
    "total_tokens": ...
  }
}
```

### Streaming request

```bash
curl -s https://YOUR_DOMAIN/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_MASTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [
      {"role": "user", "content": "Say hello in exactly 5 words."}
    ],
    "stream": true
  }'
```

You'll see Server-Sent Events (SSE) streaming back, each line prefixed with `data: `:

```
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" there"},"finish_reason":null}]}

...

data: [DONE]
```

### Authentication failure

A request with a missing or wrong token returns 401:

```bash
curl -s -w "\nHTTP %{http_code}\n" https://YOUR_DOMAIN/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

Response (401 Unauthorized):

```json
{
  "error": {
    "message": "Missing or invalid authorization token",
    "code": "UNAUTHORIZED"
  }
}
```

Same response if you use a wrong `Authorization: Bearer wrong-token` header.

---

## Troubleshooting

**Build fails with "Missing required environment variable"**
You forgot to set all five environment variables in Vercel. Go to your project's **Settings** → **Environment Variables** and check all five are present.

**API returns 500 errors**
Check the Vercel deployment logs (**Deployments** tab → click the latest deployment → **Runtime Logs**) for more detail. Common causes: the Supabase URL is wrong, the service role key is invalid, or the schema wasn't run.

**Schema errors in SQL Editor**
Make sure you copied the entire contents of `supabase/schema.sql`. If you get a "relation already exists" error, that's fine. The `IF NOT EXISTS` clauses mean you can safely re-run it.

**Supabase connection issues**
Double-check that `NEXT_PUBLIC_SUPABASE_URL` matches exactly what Supabase shows in Project Settings → API → Project URL (including the `https://` prefix and no trailing slash).
