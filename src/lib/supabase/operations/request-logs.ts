'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import type { RequestLog, DashboardStats } from '@/lib/types';

export async function logRequest(data: {
  apiKeyId: number;
  model: string;
  statusCode: number;
  tokensUsed: number;
  latencyMs: number;
  errorMessage?: string;
  requestIp?: string;
}): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('request_logs')
    .insert({
      api_key_id: data.apiKeyId,
      model: data.model,
      status_code: data.statusCode,
      tokens_used: data.tokensUsed,
      latency_ms: data.latencyMs,
      error_message: data.errorMessage ?? null,
      request_ip: data.requestIp ?? null,
      timestamp: new Date().toISOString(),
    });

  if (error) {
    console.error('Error logging request:', error);
    throw new Error('Failed to log request');
  }
}

export async function getRequestStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();

  const [
    activeKeysResult,
    rateLimitedKeysResult,
    totalRequestsResult,
  ] = await Promise.all([
    supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .gt('error_count', 0),
    supabase
      .from('request_logs')
      .select('*', { count: 'exact', head: true }),
  ]);

  const activeKeys = activeKeysResult.count ?? 0;
  const rateLimitedKeys = rateLimitedKeysResult.count ?? 0;
  const totalRequests = totalRequestsResult.count ?? 0;

  return {
    activeKeys,
    rateLimitedKeys,
    totalRequests,
  };
}

export async function getRecentLogs(limit: number = 50): Promise<RequestLog[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('request_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent logs:', error);
    throw new Error('Failed to fetch recent logs');
  }

  return (data ?? []) as RequestLog[];
}
