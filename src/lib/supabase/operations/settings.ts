'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { selectNextKey } from '@/lib/gemini/load-balancer';
import { callGeminiNonStreaming } from '@/lib/gemini/proxy';
import type { GeminiRequest } from '@/lib/types';

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

export async function testModelConnection(
  model: string,
): Promise<{ success: boolean; model?: string; response?: string; error?: string }> {
  const key = await selectNextKey();
  if (!key) {
    return { success: false, error: 'No active API keys' };
  }

  const request: GeminiRequest = {
    model,
    messages: [
      {
        role: 'user',
        content: 'Halo! Perkenalkan dirimu secara singkat. Model apa kamu?',
      },
    ],
  };

  try {
    const response = await callGeminiNonStreaming(request, key.key_string);
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return { success: false, error: 'Model returned an empty response' };
    }
    return { success: true, model, response: text };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error testing model connection';
    return { success: false, error: message };
  }
}

