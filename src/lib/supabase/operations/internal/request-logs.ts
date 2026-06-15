import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Internal logRequest — NO 'use server' directive.
 * Used from Edge Runtime (retry.ts) where server actions fail silently.
 * Never throws — fire-and-forget safe.
 */
export async function logRequestInternal(data: {
  apiKeyId: number;
  model: string;
  statusCode: number;
  tokensUsed: number;
  promptTokens?: number;
  completionTokens?: number;
  latencyMs: number;
  errorMessage?: string;
  requestIp?: string;
}): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('request_logs').insert({
      api_key_id: data.apiKeyId,
      model: data.model,
      status_code: data.statusCode,
      tokens_used: data.tokensUsed,
      prompt_tokens: data.promptTokens ?? 0,
      completion_tokens: data.completionTokens ?? 0,
      latency_ms: data.latencyMs,
      error_message: data.errorMessage ?? null,
      request_ip: data.requestIp ?? null,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error(
        `[request-logs] Supabase insert failed for key ${data.apiKeyId}: ${error.message}`,
        error,
      );
    }
  } catch (err) {
    console.error(
      `[request-logs] Exception for key ${data.apiKeyId}:`,
      err instanceof Error ? err.message : err,
    );
  }
}
