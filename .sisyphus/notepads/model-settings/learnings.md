# Learnings

## Patterns used
- Server actions: `'use server'` directive at top of file, exported async functions
- Supabase admin client: `createAdminClient()` for all DB operations (service_role key, bypasses RLS)
- Settings table: key-value store with JSONB values, `ON CONFLICT DO NOTHING` for idempotent inserts
- Client components: `'use client'` directive, useState/useEffect for interactive dashboard pages
- API route validation: edge runtime compatible, imports server actions directly
- Nav items: icon + label pattern in NavSidebar, pathname.startsWith for active state

## CSS Variables used
- `--bg`: page background (#0a0a0b)
- `--card`: card/surface background (#111115)
- `--border`: borders (#1e1e24)
- `--text`: primary text (#e4e4e7)
- `--muted`: secondary text (#71717a)
- `--accent`: accent color (#8b5cf6)

## Gemini models API
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models?key=API_KEY`
- Response includes `models[].name` with `models/` prefix (stripped in code)
- Filter on `supportedGenerationMethods.includes('generateContent')` to get chat-capable models
