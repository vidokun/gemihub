-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

CREATE TABLE IF NOT EXISTS api_keys (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key_string TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  error_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS request_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  api_key_id BIGINT REFERENCES api_keys(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  model TEXT,
  status_code INTEGER,
  tokens_used INTEGER,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  latency_ms INTEGER,
  error_message TEXT,
  request_ip TEXT
);

CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp ON request_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_request_logs_key_id ON request_logs(api_key_id);
