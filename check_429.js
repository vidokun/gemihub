const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: logs } = await supabase
    .from('request_logs')
    .select('status_code, error_message, api_key_id, timestamp')
    .ilike('error_message', '%exhausted%')
    .order('timestamp', { ascending: false })
    .limit(10);
    
  console.log("Recent Exhausted Errors:");
  logs.forEach(log => console.log(`[${log.status_code}] Key: ${log.api_key_id} | ${log.error_message}`));
}
check();
