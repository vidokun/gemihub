export const runtime = 'edge';

import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();
  
  const results: Record<string, unknown> = {};
  
  const { data: all, error: err1 } = await supabase.from('api_keys').select('id, name, is_active').limit(3);
  results.all_keys = all;
  results.all_error = err1?.message ?? null;
  
  const { data: active, error: err2 } = await supabase.from('api_keys').select('id, name, is_active').eq('is_active', true).limit(3);
  results.active_keys = active;
  results.active_error = err2?.message ?? null;
  
  const { count, error: err3 } = await supabase.from('api_keys').select('*', { count: 'exact', head: true });
  results.total_count = count;
  results.count_error = err3?.message ?? null;
  
  return Response.json(results);
}
