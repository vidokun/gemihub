import { createAdminClient } from '@/lib/supabase/admin';
import type { ApiKey } from '@/lib/types';

export async function getActiveKeysInternal(): Promise<ApiKey[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('is_active', true)
    .order('id');

  if (error) {
    throw new Error(`Failed to fetch active API keys: ${error.message}`);
  }

  return data as ApiKey[];
}

export async function updateLastUsedInternal(keyId: number): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyId);

  if (error) {
    throw new Error(`Failed to update last_used_at: ${error.message}`);
  }
}

export async function incrementErrorCountInternal(keyId: number): Promise<void> {
  const supabase = createAdminClient();
  const { data: key, error: fetchErr } = await supabase
    .from('api_keys')
    .select('error_count')
    .eq('id', keyId)
    .single();

  if (fetchErr) {
    throw new Error(`Failed to fetch key for error increment: ${fetchErr.message}`);
  }

  const newCount = (key?.error_count ?? 0) + 1;
  const { error } = await supabase
    .from('api_keys')
    .update({ error_count: newCount, last_used_at: new Date().toISOString() })
    .eq('id', keyId);

  if (error) {
    throw new Error(`Failed to increment error count: ${error.message}`);
  }
}

export async function toggleApiKeyInternal(keyId: number): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false, error_count: 0 })
    .eq('id', keyId);

  if (error) {
    throw new Error(`Failed to toggle API key: ${error.message}`);
  }
}
