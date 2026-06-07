# Learnings

## Tailwind v4 Dark Mode Setup

- **No tailwind.config.ts**: Tailwind v4 uses CSS-based config via `@import "tailwindcss"` and `@theme inline` block in globals.css
- **PostCSS config**: Already set up with `@tailwindcss/postcss` plugin
- **Dark mode**: Class-based dark mode is the approach — in v4 this is CSS-native, no config file toggle needed
- **CSS variables**: Defined in `:root` with semantic names (`--bg`, `--card`, `--border`, `--text`, `--muted`, `--accent`)
- **Theme mapping**: `@theme inline` maps CSS custom properties to Tailwind's utility tokens (e.g., `--color-background: var(--bg)`)
- **Biome warning**: `@theme inline` syntax triggers a biome parse warning (pre-existing, not introduced by changes)
- **Build**: Passes cleanly with Next.js 16.2.7 + Turbopack

## Files Changed
- `src/app/globals.css`: Dark theme CSS variables + body styles
