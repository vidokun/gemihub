# Learnings: API Keys CRUD Page

## Design System
- Tailwind v4 with `@theme inline` in globals.css
- CSS variables: `--bg`, `--card`, `--border`, `--text`, `--muted`, `--accent`
- Dark mode only, no light theme
- Fonts: Geist Sans (default), Geist Mono (code)
- Pattern: `bg-[var(--card)]`, `border-[var(--border)]`, `text-[var(--muted)]`
- Transitions: `transition-colors duration-150 ease-out`

## Component Patterns
- Client components use `'use client'` directive
- Inline SVG icons as separate functions (no icon library)
- Forms: h-11 inputs, rounded-lg, var(--bg) background on inputs
- Buttons: rounded-lg, accent color for primary, var(--border) for secondary
- Modals: fixed inset-0 with black/60 backdrop-blur-sm overlay

## API Operations
- Server actions in `@/lib/supabase/operations/api-keys` (marked `'use server'`)
- Can import and call directly from client components
- After mutations, manual refetch + router.refresh() for consistency

## Types
- ApiKey: id (number), key_string, name, is_active, error_count, created_at, last_used_at
