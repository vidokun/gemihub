export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: number;
          key_string: string;
          name: string;
          is_active: boolean;
          error_count: number;
          created_at: string;
          last_used_at: string | null;
        };
        Insert: {
          id?: number;
          key_string: string;
          name: string;
          is_active?: boolean;
          error_count?: number;
          created_at?: string;
          last_used_at?: string | null;
        };
        Update: {
          id?: number;
          key_string?: string;
          name?: string;
          is_active?: boolean;
          error_count?: number;
          created_at?: string;
          last_used_at?: string | null;
        };
        Relationships: [];
      };
      request_logs: {
        Row: {
          id: number;
          api_key_id: number | null;
          timestamp: string;
          model: string | null;
          status_code: number | null;
          tokens_used: number | null;
          latency_ms: number | null;
          error_message: string | null;
          request_ip: string | null;
        };
        Insert: {
          id?: number;
          api_key_id?: number | null;
          timestamp?: string;
          model?: string | null;
          status_code?: number | null;
          tokens_used?: number | null;
          latency_ms?: number | null;
          error_message?: string | null;
          request_ip?: string | null;
        };
        Update: {
          id?: number;
          api_key_id?: number | null;
          timestamp?: string;
          model?: string | null;
          status_code?: number | null;
          tokens_used?: number | null;
          latency_ms?: number | null;
          error_message?: string | null;
          request_ip?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'request_logs_api_key_id_fkey';
            columns: ['api_key_id'];
            isOneToOne: false;
            referencedRelation: 'api_keys';
            referencedColumns: ['id'];
          },
        ];
      };
      settings: {
        Row: {
          key: string;
          value: Json;
        };
        Insert: {
          key: string;
          value?: Json;
        };
        Update: {
          key?: string;
          value?: Json;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
