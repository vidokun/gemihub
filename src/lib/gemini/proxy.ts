import { GeminiRequest, GeminiResponse } from '@/lib/types';

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

export class GeminiProxyError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'GeminiProxyError';
  }
}

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

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function callGeminiNonStreaming(
  request: GeminiRequest,
  apiKey: string,
): Promise<GeminiResponse> {
  const body = buildGeminiRequestBody(request);
  const url = `${GEMINI_BASE}/${request.model}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    throw new GeminiProxyError(
      `Gemini API error: ${response.status} ${response.statusText}`,
      response.status,
      errorBody,
    );
  }

  return response.json() as Promise<GeminiResponse>;
}

export async function callGeminiStreaming(
  request: GeminiRequest,
  apiKey: string,
): Promise<ReadableStream> {
  const body = buildGeminiRequestBody(request);
  const url = `${GEMINI_BASE}/${request.model}:streamGenerateContent?alt=sse`;

  const encoder = new TextEncoder();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody?.error?.message || errorMessage;
      } catch {
        // keep default message
      }
      return errorStream(errorMessage, response.status, encoder);
    }

    const reader = response.body.getReader();

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

          if (buffer.trim()) {
            const delta = extractDeltaFromSSEEvent(buffer, previousText);
            if (delta !== null) {
              previousText = delta.previous;
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorStream(message, 500, encoder);
  }
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

function errorStream(
  message: string,
  status: number,
  encoder: TextEncoder,
): ReadableStream {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ error: { message, code: status.toString() } })}\n\n`,
        ),
      );
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}
