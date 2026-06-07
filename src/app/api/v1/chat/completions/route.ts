export const runtime = 'edge';

import { validateBearerToken, unauthorizedResponse } from '@/lib/auth/api-auth';
import { executeWithRetry } from '@/lib/gemini/retry';
import { getAllowedModels } from '@/lib/supabase/operations/settings';
import type { GeminiRequest } from '@/lib/types';

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (!validateBearerToken(request)) {
    const response = unauthorizedResponse();
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  }

  let body: GeminiRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: {
          message: 'Invalid JSON in request body',
          code: 'INVALID_REQUEST',
        },
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }

  const allowedModels = await getAllowedModels();
  if (allowedModels.length > 0 && !allowedModels.includes(body.model)) {
    return new Response(
      JSON.stringify({
        error: {
          message: `Model '${body.model}' is not allowed. Allowed models: ${allowedModels.join(', ')}`,
          code: 'INVALID_MODEL',
        },
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }

  const response = await executeWithRetry(body);
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}
