export interface ApiKey {
  id: number;
  key_string: string;
  name: string;
  is_active: boolean;
  error_count: number;
  created_at: string;
  last_used_at: string | null;
}

export interface RequestLog {
  id: number;
  api_key_id: number | null;
  timestamp: string;
  model: string | null;
  status_code: number | null;
  tokens_used: number | null;
  latency_ms: number | null;
  error_message: string | null;
  request_ip: string | null;
}

export interface GeminiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GeminiRequest {
  model: string;
  messages: GeminiMessage[];
  stream?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason?: string;
    index?: number;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface DashboardStats {
  activeKeys: number;
  rateLimitedKeys: number;
  totalRequests: number;
  avgLatency?: number;
}
