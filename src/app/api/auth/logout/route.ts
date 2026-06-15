import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth/users';
import { clearAuthCookie } from '@/lib/auth/dashboard-auth';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (token) {
    await deleteSession(token).catch(() => {
      // Session may already be expired/deleted — that's fine.
    });
  }

  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
