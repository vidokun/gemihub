# Learnings - Supabase Schema

- PostgreSQL syntax: `REFERENCES table(col)` is correct; `REFERENCE` (singular) would fail.
- `CREATE INDEX IF NOT EXISTS` is supported in PostgreSQL 9.5+ and prevents errors on re-run.
- Partial indexes (WHERE clause) reduce index size when filtering on a common condition like `is_active = true`.
- Minimal spec had 8 columns listed for api_keys but wrote only 7 — spec was likely off by one; implementation followed the actual column list, not the count.
