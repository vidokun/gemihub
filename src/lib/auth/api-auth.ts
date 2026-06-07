import { env } from '@/lib/env';

/**
 * Validates the Authorization header from an incoming request.
 * Only accepts Bearer tokens matching MASTER_AUTH_TOKEN.
 *
 * @returns true if the token is valid, false otherwise.
 */
export function validateBearerToken(request: Request): boolean {
  const header = request.headers.get('Authorization');

  if (!header) {
    return false;
  }

  if (!header.startsWith('Bearer ')) {
    return false;
  }

  const token = header.slice(7);

  return token === env.MASTER_AUTH_TOKEN;
}

/**
 * Returns an OpenAI-compatible 401 Unauthorized JSON response.
 */
export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({
      error: {
        message: 'Missing or invalid authorization token',
        code: 'UNAUTHORIZED',
      },
    }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
