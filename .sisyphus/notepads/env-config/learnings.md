## Learnings
- `.env*` in `.gitignore` covers `.env.local`, `.env.production`, etc. — no additional gitignore config needed
- `src/lib/env.ts` uses `process.env` directly; the `required()` helper is the standard pattern for fail-fast env validation in Next.js
- `ADMIN_PASSCODE` and `MASTER_AUTH_TOKEN` are server-only (no `NEXT_PUBLIC_` prefix). `NEXT_PUBLIC_SUPABASE_*` are client-safe. `SUPABASE_SERVICE_ROLE_KEY` is server-only for admin operations.
