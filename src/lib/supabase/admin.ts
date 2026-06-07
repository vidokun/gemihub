import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import type { Database } from './database.types';

export function createAdminClient() {
  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );
}
