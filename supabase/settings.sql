-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- Adds the settings key-value store used by the Model Settings dashboard.

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'
);

INSERT INTO settings (key, value)
VALUES ('allowed_models', '["gemini-2.5-flash","gemini-2.5-pro","gemini-3-flash-preview","gemini-3.5-flash","gemini-3.1-flash-lite"]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value)
VALUES ('default_model', '"gemini-2.5-flash"'::jsonb)
ON CONFLICT (key) DO NOTHING;
