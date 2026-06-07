# Decisions

## Settings table as key-value with JSONB
Using a `settings` table with TEXT primary key and JSONB value. This is simpler than
adding columns to existing tables and allows arbitrary settings without schema changes.

## Default model fallback
When no `default_model` setting exists, fallback to `'gemini-2.5-flash'`.
Same fallback in both server-side `getDefaultModel()` and the migration seed data.

## Known models vs Gemini-fetched models
Hardcoded `KNOWN_MODELS` array provides a curated set of common Gemini models.
The "Load from Gemini" button augments this with live data from the API.
Both lists are merged/unique in the settings page.

## API route: empty list = allow all
If `allowed_models` is empty or not set, the API route allows any model through.
This ensures backwards compatibility when the settings table has no data yet.

## Middleware matcher
Added `/settings/:path*` to the existing middleware matcher so the settings page
is protected by the admin passcode cookie, same as dashboard and keys.
