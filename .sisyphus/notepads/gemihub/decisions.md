# Decisions

## Task 7: Dashboard Layout Shell & Navigation

### Sidebar width
- **Desktop**: `w-56` (224px) — enough for "Dashboard" and "API Keys" labels with comfortable padding
- **Mobile**: `w-16` (64px) — icons only, 20px icon + 16px padding each side + gaps
- Smooth transition with `ease-out-quint` curve on width change

### Active route detection
- Uses `pathname.startsWith(item.href)` — matches both exact and child routes
- Active state: `bg-[var(--accent)]/10 text-[var(--accent)]` — tinted background with full accent color text
- Hover state: `hover:bg-[var(--border)] hover:text-[var(--text)]` — subtle border highlight, text fades from muted to white

### Icon approach
- Inline SVG components (no icon library) — keeps zero dependencies
- `stroke="currentColor"` inherits text color for active/hover states
- Consistent 20px size with 1.75 stroke width for visual weight

### Layout structure
- `flex h-screen overflow-hidden` on root container — prevents body scroll, sidebar and content share viewport
- `overflow-y-auto` on main content — enables independent content scrolling
- `bg-[var(--card)]` on sidebar, `bg-[var(--bg)]` on content — two-tone separation without harsh contrast

### Top bar
- Minimal header: just "GemiHub" in muted uppercase tracking-wider
- `h-14` matches sidebar header height for visual alignment
- `border-b border-[var(--border)]` consistent with sidebar border
- No auth controls (Task 13 adds middleware, Task 12 adds login page)
