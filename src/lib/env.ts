function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  SUPABASE_URL: required('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  ADMIN_PASSCODE: required('ADMIN_PASSCODE'),
  MASTER_AUTH_TOKEN: required('MASTER_AUTH_TOKEN'),
};
