import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/users';
import { setAuthCookie } from '@/lib/auth/dashboard-auth';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  const result = await authenticateUser(email, password);

  if (!result) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  await setAuthCookie(result.token);

  return NextResponse.json({
    success: true,
    user: {
      display_name: result.user.display_name,
      email: result.user.email,
      role: result.user.role,
    },
  });
}
