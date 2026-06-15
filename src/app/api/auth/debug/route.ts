import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const results: Record<string, unknown> = {};
  const supabase = createAdminClient();

  // 1. Check if users table exists
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('count')
    .limit(1);
  results.users_table = usersError
    ? { ok: false, message: usersError.message, code: usersError.code, hint: usersError.hint }
    : { ok: true, count: (usersData as unknown as [{count:number}])?.[0]?.count ?? 0 };

  // 2. Check if user_sessions table exists
  const { error: sessionsError } = await supabase
    .from('user_sessions')
    .select('count')
    .limit(1);
  results.sessions_table = sessionsError
    ? { ok: false, message: sessionsError.message, code: sessionsError.code, hint: sessionsError.hint }
    : { ok: true };

  // 3. Try to find admin user
  const { data: adminUser, error: adminError } = await supabase
    .from('users')
    .select('id, email, display_name, role, created_at')
    .eq('email', 'vi@dokundigital.com')
    .single();
  results.admin_user = adminError
    ? { ok: false, message: adminError.message, code: adminError.code }
    : adminUser
      ? { ok: true, found: true, email: adminUser.email, role: adminUser.role }
      : { ok: true, found: false };

  // 4. Try password verification if user exists
  if (adminUser) {
    const { data: fullUser } = await supabase
      .from('users')
      .select('password_hash')
      .eq('email', 'vi@dokundigital.com')
      .single();
    if (fullUser) {
      const match = await bcrypt.compare('admin123', fullUser.password_hash);
      results.password_check = { ok: true, match };
    }
  }

  // 5. Check if session cookie exists in request
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  results.current_session = token ? { hasToken: true, tokenPreview: token.slice(0, 8) + '...' } : { hasToken: false };

  return NextResponse.json(results);
}
