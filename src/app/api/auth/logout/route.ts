import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/dashboard-auth';

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
