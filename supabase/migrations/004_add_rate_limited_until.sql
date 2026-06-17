-- Migration: Add cooldown capability to avoid hitting Google 429 repeatedly
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS rate_limited_until TIMESTAMP WITH TIME ZONE;
