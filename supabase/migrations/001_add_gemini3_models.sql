-- Migration: Add Gemini 3.x/3.5 models, remove deprecated gemini-2.0-flash
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- For existing installations that already ran settings.sql

UPDATE settings
SET value = '["gemini-2.5-flash","gemini-2.5-pro","gemini-3-flash-preview","gemini-3.5-flash","gemini-3.1-flash-lite"]'::jsonb
WHERE key = 'allowed_models';

-- Default model stays gemini-2.5-flash (no change needed)
