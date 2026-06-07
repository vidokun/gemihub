'use server';

import { createAdminClient } from '@/lib/supabase/admin';

const ALLOWED_MODELS_KEY = 'allowed_models';
const DEFAULT_MODEL_KEY = 'default_model';

export async function getAllowedModels(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', ALLOWED_MODELS_KEY)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return [];
    throw new Error(`Failed to fetch allowed models: ${error.message}`);
  }

  if (!data || !Array.isArray(data.value)) return [];
  return data.value as string[];
}

export async function setAllowedModels(models: string[]): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('settings')
    .upsert({
      key: ALLOWED_MODELS_KEY,
      value: models,
    }, {
      onConflict: 'key',
    });

  if (error) {
    throw new Error(`Failed to save allowed models: ${error.message}`);
  }
}

export async function getDefaultModel(): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', DEFAULT_MODEL_KEY)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return 'gemini-2.5-flash';
    throw new Error(`Failed to fetch default model: ${error.message}`);
  }

  if (!data || typeof data.value !== 'string') return 'gemini-2.5-flash';
  return data.value as string;
}

export async function setDefaultModel(model: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('settings')
    .upsert({
      key: DEFAULT_MODEL_KEY,
      value: model,
    }, {
      onConflict: 'key',
    });

  if (error) {
    throw new Error(`Failed to save default model: ${error.message}`);
  }
}


