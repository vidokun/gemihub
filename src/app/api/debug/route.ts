export const runtime = 'edge';

import { createAdminClient } from '@/lib/supabase/admin';
import { getActiveKeysInternal } from '@/lib/supabase/operations/internal/api-keys';
import { selectNextKey } from '@/lib/gemini/load-balancer';

export async function GET() {
  const supabase = createAdminClient();
  
  const results: Record<string, unknown> = {};
  
  const { data: all, error: err1 } = await supabase.from('api_keys').select('id, name, is_active').limit(3);
  results.direct_query = all;
  results.direct_error = err1?.message ?? null;

  try {
    const keys = await getActiveKeysInternal();
    results.internal_count = keys.length;
    results.internal_first = keys[0]?.name ?? null;
  } catch (e) {
    results.internal_error = e instanceof Error ? e.message : String(e);
  }

  try {
    const key = await selectNextKey();
    results.selected_key = key?.name ?? null;
  } catch (e) {
    results.select_error = e instanceof Error ? e.message : String(e);
  }
  
  return Response.json(results);
}
