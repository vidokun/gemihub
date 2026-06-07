import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
