import { selectNextKey, markKeyUsed } from './load-balancer';
import { GeminiProxyError, callGeminiNonStreaming } from './proxy';
import { incrementErrorCountInternal, toggleApiKeyInternal } from '@/lib/supabase/operations/internal/api-keys';
import { logRequest } from '@/lib/supabase/operations/request-logs';
import type { GeminiRequest, GeminiResponse } from '@/lib/types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_RETRIES_PER_KEY = 3;
const MAX_TOTAL_ATTEMPTS = 20;

interface GeminiErrorBody {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

type TryResult =
  | { type: 'success'; geminiResponse: GeminiResponse; latencyMs: number }
  | { type: 'stream_success'; stream: ReadableStream; latencyMs: number }
  | { type: 'rate_limited'; keyId: number; latencyMs: number }
  | { type: 'server_error'; status: number; message: string; latencyMs: number }
  | { type: 'client_error'; status: number; message: string; latencyMs: number }
  | { type: 'network_error'; message: string; latencyMs: number };

interface GeminiContent {
  role: string;
  parts: Array<{ text: string }>;
}

interface GeminiRequestBody {
  contents: GeminiContent[];
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
}

// Mirrors the private function in proxy.ts — duplicated here so the retry
// layer controls error detection for streaming requests.
function buildGeminiRequestBody(request: GeminiRequest): GeminiRequestBody {
  const contents: GeminiContent[] = [];
  let systemInstruction: GeminiRequestBody['systemInstruction'] | undefined;

  for (const msg of request.messages) {
    if (msg.role === 'system') {
      systemInstruction = {
        parts: [{ text: msg.content }],
      };
    } else {
      const role = msg.role === 'assistant' ? 'model' : msg.role;
      contents.push({
        role,
        parts: [{ text: msg.content }],
      });
    }
  }

  const hasGenerationConfig =
    request.temperature !== undefined ||
    request.maxOutputTokens !== undefined ||
    request.topP !== undefined ||
    request.topK !== undefined;

  const generationConfig = hasGenerationConfig
    ? {
        ...(request.temperature !== undefined && { temperature: request.temperature }),
        ...(request.maxOutputTokens !== undefined && { maxOutputTokens: request.maxOutputTokens }),
        ...(request.topP !== undefined && { topP: request.topP }),
        ...(request.topK !== undefined && { topK: request.topK }),
      }
    : undefined;

  return {
    contents,
    ...(systemInstruction && { systemInstruction }),
    ...(generationConfig && { generationConfig }),
  };
}

function convertToOpenAIFormat(response: GeminiResponse, model: string) {
  const candidate = response.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text ?? '';
  const finishReason = candidate?.finishReason ?? 'STOP';
  const metadata = response.usageMetadata;

  return {
    id: `chatcmpl-${crypto.randomUUID()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: candidate?.content?.role === 'model' ? 'assistant' : candidate?.content?.role ?? 'assistant',
          content: text,
        },
        finish_reason: finishReason,
      },
    ],
    usage: {
      prompt_tokens: metadata?.promptTokenCount ?? 0,
      completion_tokens: metadata?.candidatesTokenCount ?? 0,
      total_tokens: metadata?.totalTokenCount ?? 0,
    },
  };
}

function isRetryableServerError(status: number): boolean {
  return status === 500 || status === 503 || status === 504;
}

function isHardClientError(status: number): boolean {
  return (
    (status >= 400 && status < 500 && status !== 429) ||
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    status === 413
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function processSSEStream(responseBody: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const reader = responseBody.getReader();

  return new ReadableStream({
    async start(controller) {
      try {
        const decoder = new TextDecoder();
        let buffer = '';
        let previousText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const event of events) {
            const delta = extractDeltaFromSSEEvent(event, previousText);
            if (delta !== null) {
              previousText = delta.previous;
              const sseChunk = `data: ${JSON.stringify({
                choices: [{ delta: { content: delta.text }, index: 0 }],
              })}\n\n`;
              controller.enqueue(encoder.encode(sseChunk));
            }
          }
        }

        // Flush remaining buffer
        if (buffer.trim()) {
          const delta = extractDeltaFromSSEEvent(buffer, previousText);
          if (delta !== null) {
            const sseChunk = `data: ${JSON.stringify({
              choices: [{ delta: { content: delta.text }, index: 0 }],
            })}\n\n`;
            controller.enqueue(encoder.encode(sseChunk));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown streaming error';
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: { message, code: 'STREAM_ERROR' } })}\n\n`,
          ),
        );
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });
}

function extractDeltaFromSSEEvent(
  rawEvent: string,
  previousText: string,
): { text: string; previous: string } | null {
  const lines = rawEvent.split('\n');
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;

    const jsonStr = line.slice(6);
    try {
      const parsed = JSON.parse(jsonStr);
      const text: string =
        parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      const delta = text.slice(previousText.length);
      if (delta.length > 0) {
        return { text: delta, previous: text };
      }
    } catch {
      // skip malformed JSON lines
    }
  }
  return null;
}

async function tryWithKey(
  request: GeminiRequest,
  apiKey: string,
  keyId: number,
): Promise<TryResult> {
  const startTime = Date.now();

  if (!request.stream) {
    try {
      const geminiResponse = await callGeminiNonStreaming(request, apiKey);
      return {
        type: 'success',
        geminiResponse,
        latencyMs: Date.now() - startTime,
      };
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      if (err instanceof GeminiProxyError) {
        const status = err.status;
        const errorBody = err.body as GeminiErrorBody | undefined;
        const message =
          errorBody?.error?.message ??
          `Gemini API error: ${status}`;

        if (status === 429) {
          return { type: 'rate_limited', keyId, latencyMs };
        }

        if (isHardClientError(status)) {
          return { type: 'client_error', status, message, latencyMs };
        }

        if (isRetryableServerError(status)) {
          return { type: 'server_error', status, message, latencyMs };
        }

        // Any other non-2xx: treat as server error
        return { type: 'server_error', status, message, latencyMs };
      }

      return {
        type: 'network_error',
        message: err instanceof Error ? err.message : 'Unknown error',
        latencyMs,
      };
    }
  }

  try {
    const body = buildGeminiRequestBody(request);
    const url = `${GEMINI_BASE}/${request.model}:streamGenerateContent?alt=sse`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok || !response.body) {
      let errorBody: GeminiErrorBody | undefined;
      try {
        errorBody = await response.json();
      } catch {
        // body is not JSON
      }

      const status = response.status;
      const message =
        errorBody?.error?.message ??
        `Gemini API error: ${status} ${response.statusText}`;

      if (status === 429 || errorBody?.error?.status === 'RESOURCE_EXHAUSTED') {
        return { type: 'rate_limited', keyId, latencyMs };
      }

      if (isHardClientError(status)) {
        return { type: 'client_error', status, message, latencyMs };
      }

      return { type: 'server_error', status, message, latencyMs };
    }

    const stream = processSSEStream(response.body);
    return { type: 'stream_success', stream, latencyMs };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      type: 'network_error',
      message: err instanceof Error ? err.message : 'Unknown network error',
      latencyMs,
    };
  }
}

/**
 * Execute a Gemini request with automatic retry and key rotation.
 *
 * - 429 (RESOURCE_EXHAUSTED): disables the offending key, tries the next.
 * - 500/503/504: retries the SAME key with exponential backoff (1s→2s→4s),
 *   max 3 retries per key.  Jitter is applied to each delay.
 * - 400/401/403/404/413: returned immediately without retry.
 * - All keys exhausted: returns 503 with `NO_KEYS_AVAILABLE`.
 *
 * @param request   The translated Gemini request (model + messages).
 * @param maxRetries Optional override for total key-attempt cap (default 20).
 * @returns A Web `Response` suitable for the Edge Runtime route handler.
 */
export async function executeWithRetry(
  request: GeminiRequest,
  maxRetries?: number,
): Promise<Response> {
  const exhaustedKeys = new Set<number>();
  const totalAttempts = maxRetries ?? MAX_TOTAL_ATTEMPTS;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    const key = await selectNextKey();

    if (!key) {
      return noKeysAvailableResponse();
    }

    // Safety net: if the DB still thinks this key is active but we
    // already exhausted it this request cycle, skip it.
    if (exhaustedKeys.has(key.id)) {
      await sleep(50);
      continue;
    }

    const result = await attemptWithBackoff(request, key.key_string, key.id);

    switch (result.type) {
      case 'success': {
        const openAI = convertToOpenAIFormat(result.geminiResponse, request.model);
        const tokensUsed = result.geminiResponse.usageMetadata?.totalTokenCount ?? 0;

        // Fire-and-forget: log + mark (don't block the response)
        void markKeyUsed(key.id).catch(() => {});
        void logRequest({
          apiKeyId: key.id,
          model: request.model,
          statusCode: 200,
          tokensUsed,
          latencyMs: result.latencyMs,
        }).catch(() => {});

        return new Response(JSON.stringify(openAI), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      case 'stream_success': {
        void markKeyUsed(key.id).catch(() => {});
        void logRequest({
          apiKeyId: key.id,
          model: request.model,
          statusCode: 200,
          tokensUsed: 0, // tokens are not available mid-stream
          latencyMs: result.latencyMs,
        }).catch(() => {});

        return new Response(result.stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        });
      }

      case 'rate_limited': {
        exhaustedKeys.add(key.id);
        void incrementErrorCountInternal(key.id).catch(() => {});
        void toggleApiKeyInternal(key.id).catch(() => {});
        continue;
      }

      case 'client_error':
        return new Response(
          JSON.stringify({
            error: { message: result.message, code: String(result.status) },
          }),
          {
            status: result.status,
            headers: { 'Content-Type': 'application/json' },
          },
        );

      case 'server_error':
      case 'network_error': {
        exhaustedKeys.add(key.id);
        void logRequest({
          apiKeyId: key.id,
          model: request.model,
          statusCode: result.type === 'server_error' ? result.status : 502,
          tokensUsed: 0,
          latencyMs: result.latencyMs,
          errorMessage: result.message,
        }).catch(() => {});
        continue;
      }
    }
  }

  return noKeysAvailableResponse();
}

async function attemptWithBackoff(
  request: GeminiRequest,
  apiKey: string,
  keyId: number,
): Promise<TryResult> {
  let lastResult: TryResult | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES_PER_KEY; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 1s, 2s, 4s with jitter
      const baseDelay = Math.pow(2, attempt - 1) * 1000;
      const jittered = baseDelay * (0.8 + Math.random() * 0.4);
      await sleep(jittered);
    }

    const result = await tryWithKey(request, apiKey, keyId);

    if (result.type === 'server_error' || result.type === 'network_error') {
      lastResult = result;
      continue;
    }

    return result;
  }

  return lastResult!;
}

function noKeysAvailableResponse(): Response {
  return new Response(
    JSON.stringify({
      error: {
        message: 'All API keys exhausted',
        code: 'NO_KEYS_AVAILABLE',
      },
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
