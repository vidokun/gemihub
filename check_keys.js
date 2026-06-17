const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: keys } = await supabase.from('api_keys').select('id, is_active, error_count, last_used_at, key_string');
  
  console.log(`Total: ${keys.length}`);
  console.log(`Active: ${keys.filter(k => k.is_active).length}`);
  console.log(`Inactive: ${keys.filter(k => !k.is_active).length}`);
  
  const { data: logs } = await supabase
    .from('request_logs')
    .select('status_code, error_message, timestamp, api_keys(id)')
    .order('timestamp', { ascending: false })
    .limit(30);
    
  console.log("\nRecent 30 API Requests:");
  logs.forEach(log => {
    let d = new Date(log.timestamp);
    console.log(`[${d.toISOString()}] Key: ${log.api_keys?.id} | Status: ${log.status_code} | Error: ${log.error_message?.substring(0,80) || 'None'}`);
  });
}
check();