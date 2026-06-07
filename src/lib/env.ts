function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Use getters so validation happens at runtime, not build time.
// Vercel env vars are not available during the build step.
export const env = {
  get SUPABASE_URL() { return required('NEXT_PUBLIC_SUPABASE_URL'); },
  get SUPABASE_ANON_KEY() { return required('NEXT_PUBLIC_SUPABASE_ANON_KEY'); },
  get SUPABASE_SERVICE_ROLE_KEY() { return required('SUPABASE_SERVICE_ROLE_KEY'); },
  get ADMIN_PASSCODE() { return required('ADMIN_PASSCODE'); },
  get MASTER_AUTH_TOKEN() { return required('MASTER_AUTH_TOKEN'); },
};
