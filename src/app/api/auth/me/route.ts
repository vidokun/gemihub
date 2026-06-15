import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSessionToken } from '@/lib/auth/users';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const session = await validateSessionToken(token);
  if (!session) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  return NextResponse.json({ user: session.user });
}
