import { getActiveKeysInternal, updateLastUsedInternal } from '@/lib/supabase/operations/internal/api-keys';
import type { ApiKey } from '@/lib/types';

/**
 * Select the least-recently-used active API key.
 * Sorts by last_used_at ascending (nulls first) so keys
 * never used are picked before stale ones. State lives in
 * the DB — safe across serverless instances.
 */
export async function selectNextKey(): Promise<ApiKey | null> {
  const keys = await getActiveKeysInternal();

  if (keys.length === 0) {
    return null;
  }

  keys.sort((a, b) => {
    const aNeverUsed = a.last_used_at === null;
    const bNeverUsed = b.last_used_at === null;

    if (aNeverUsed && bNeverUsed) return 0;
    if (aNeverUsed) return -1;
    if (bNeverUsed) return 1;

    return new Date(a.last_used_at!).getTime() - new Date(b.last_used_at!).getTime();
  });

  return keys[0];
}

export async function markKeyUsed(keyId: number): Promise<void> {
  await updateLastUsedInternal(keyId);
}

export async function getKeyCount(): Promise<number> {
  const keys = await getActiveKeysInternal();
  return keys.length;
}
