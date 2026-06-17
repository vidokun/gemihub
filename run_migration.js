const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function migrate() {
  console.log("Since Supabase JS doesn't support raw DDL, please execute this query in your Supabase SQL Editor:");
  console.log("\nALTER TABLE api_keys ADD COLUMN IF NOT EXISTS rate_limited_until TIMESTAMP WITH TIME ZONE;\n");
}
migrate();
