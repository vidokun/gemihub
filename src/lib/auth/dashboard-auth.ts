import { cookies } from 'next/headers';
import { env } from '@/lib/env';

/**
 * @deprecated Use `authenticateUser()` from `@/lib/auth/users` instead.
 * Kept for backward compatibility — some imports may still reference this.
 */
export function validatePasscode(passcode: string): boolean {
  return passcode === env.ADMIN_PASSCODE;
}

export function createSessionToken(): string {
  return crypto.randomUUID();
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}

export async function verifyAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return !!token?.value;
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });
}
