import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config'; // Load .env if present (for local dev/testing)
import { getConfig, getConfigPath } from '../config.js';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const config = getConfig();

  if (!config) {
    throw new Error(
      `Missing configuration. Run 'tt config' to set up your credentials.\n` +
      `Or create ${getConfigPath()} with:\n` +
      `  {"supabaseUrl": "your-url", "supabaseKey": "your-key"}`
    );
  }

  client = createClient(config.supabaseUrl, config.supabaseKey);
  return client;
}
