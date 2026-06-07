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

interface GeminiModelInfo {
  name: string;
  displayName: string;
  supportedGenerationMethods?: string[];
}

interface GeminiModelsResponse {
  models?: GeminiModelInfo[];
}

export async function fetchGeminiModels(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data: keys, error: keysError } = await supabase
    .from('api_keys')
    .select('key_string')
    .eq('is_active', true)
    .limit(1);

  if (keysError || !keys || keys.length === 0) {
    throw new Error('No active API keys available to fetch Gemini models');
  }

  const apiKey = keys[0].key_string;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data: GeminiModelsResponse = await response.json();
  if (!data.models) return [];

  return data.models
    .filter((m) =>
      m.supportedGenerationMethods?.includes('generateContent')
    )
    .map((m) => m.name.replace(/^models\//, ''))
    .sort();
}
