import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase/admin';
import type { PublicUser } from '@/lib/types';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserByEmail(email: string): Promise<{
  id: number; email: string; display_name: string; password_hash: string; role: string; created_at: string;
} | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error) return null;
  return data as any;
}

export async function getUserById(userId: number): Promise<{
  id: number; email: string; display_name: string; password_hash: string; role: string; created_at: string;
} | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as any;
}

export async function createSession(userId: number): Promise<string> {
  const supabase = createAdminClient();
  const token = crypto.randomUUID();

  const { error } = await supabase.from('user_sessions').insert({
    user_id: userId,
    token,
  });

  if (error) throw new Error('Failed to create session');
  return token;
}

export async function validateSessionToken(
  token: string,
): Promise<{ user: PublicUser } | null> {
  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from('user_sessions')
    .select('user_id')
    .eq('token', token)
    .single();

  if (!session) return null;

  const { data: user } = await supabase
    .from('users')
    .select('id, email, display_name, role, created_at')
    .eq('id', session.user_id)
    .single();

  if (!user) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.role as PublicUser['role'],
      created_at: user.created_at,
    },
  };
}

export async function deleteSession(token: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from('user_sessions').delete().eq('token', token);
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<{ user: PublicUser; token: string } | null> {
  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (!user) return null;

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return null;

  const token = await createSession(user.id);
  return {
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.role as PublicUser['role'],
      created_at: user.created_at,
    },
    token,
  };
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
