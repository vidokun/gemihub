'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/auth/users';
import type { PublicUser } from '@/lib/types';

export async function getAllUsers(): Promise<PublicUser[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, display_name, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return (data as any[]).map((u) => ({
    id: u.id,
    email: u.email,
    display_name: u.display_name,
    role: u.role as PublicUser['role'],
    created_at: u.created_at,
  }));
}

export async function createUser(
  email: string,
  displayName: string,
  password: string,
  role: 'admin' | 'user' = 'user',
): Promise<PublicUser> {
  const supabase = createAdminClient();
  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase().trim(),
      display_name: displayName.trim(),
      password_hash: passwordHash,
      role,
    })
    .select('id, email, display_name, role, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A user with that email already exists');
    }
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return {
    id: data.id,
    email: data.email,
    display_name: data.display_name,
    role: data.role as PublicUser['role'],
    created_at: data.created_at,
  };
}

export async function deleteUser(id: number): Promise<void> {
  const supabase = createAdminClient();

  await supabase.from('user_sessions').delete().eq('user_id', id);

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}
