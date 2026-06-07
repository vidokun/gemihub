import { NextResponse } from 'next/server';
import { validatePasscode, createSessionToken, setAuthCookie } from '@/lib/auth/dashboard-auth';

export async function POST(request: Request) {
  const { passcode } = await request.json();

  if (!validatePasscode(passcode)) {
    return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
  }

  const token = createSessionToken();
  await setAuthCookie(token);

  return NextResponse.json({ success: true });
}
