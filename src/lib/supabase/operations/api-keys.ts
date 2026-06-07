'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import type { ApiKey } from '@/lib/types';

export async function getAllKeys(): Promise<ApiKey[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch API keys: ${error.message}`);
  }

  return data as ApiKey[];
}

export async function getActiveKeys(): Promise<ApiKey[]> {
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

export async function createApiKey(
  name: string,
  keyString: string
): Promise<ApiKey> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('api_keys')
    .insert({ name, key_string: keyString })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create API key: ${error.message}`);
  }

  return data as ApiKey;
}

export async function toggleApiKey(id: number): Promise<void> {
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from('api_keys')
    .select('is_active')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to find API key: ${fetchError.message}`);
  }

  const { error } = await supabase
    .from('api_keys')
    .update({
      is_active: !existing.is_active,
      error_count: 0,
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to toggle API key: ${error.message}`);
  }
}

export async function deleteApiKey(id: number): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete API key: ${error.message}`);
  }
}

export async function incrementErrorCount(id: number): Promise<void> {
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from('api_keys')
    .select('error_count')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to find API key: ${fetchError.message}`);
  }

  const { error } = await supabase
    .from('api_keys')
    .update({
      error_count: (existing.error_count ?? 0) + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to increment error count: ${error.message}`);
  }
}

export async function updateLastUsed(id: number): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update last used timestamp: ${error.message}`);
  }
}

export async function getKeyUsageCounts(): Promise<Record<number, number>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('request_logs')
    .select('api_key_id');

  if (error) {
    throw new Error(`Failed to fetch key usage counts: ${error.message}`);
  }

  const counts: Record<number, number> = {};
  for (const row of data ?? []) {
    if (row.api_key_id != null) {
      counts[row.api_key_id] = (counts[row.api_key_id] ?? 0) + 1;
    }
  }
  return counts;
}
