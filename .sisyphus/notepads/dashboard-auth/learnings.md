# Learnings: Dashboard Auth

## Patterns
- Next.js 16 `cookies()` is async — always `await cookies()` before .get()/.set()
- Cookie clearing uses `expires: new Date(0)` + `maxAge: 0` for reliable browser behavior
- Route handlers: `export async function POST(request: Request)` — must be `async`

## Files Created
- `src/lib/auth/dashboard-auth.ts` — 4 exported functions: validatePasscode, createSessionToken, setAuthCookie, verifyAuthCookie, clearAuthCookie
- `src/app/api/auth/login/route.ts` — POST handler, validates passcode, sets cookie
- `src/app/api/auth/logout/route.ts` — POST handler, clears cookie

## Verification
- lsp_diagnostics: clean on all 3 files
- Build: passes, routes detected as dynamic (ƒ)
