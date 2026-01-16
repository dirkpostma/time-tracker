import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config'; // Load .env if present (for local dev/testing)
import { getConfig, getConfigPath } from './config.js';

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

/**
 * Wraps Supabase operations with better error messages.
 * Use this to provide user-friendly errors for auth/connection issues.
 */
export function formatSupabaseError(error: Error | string): string {
  const message = error instanceof Error ? error.message : error;

  if (message.includes('fetch failed') || message.includes('ENOTFOUND')) {
    return `Could not connect to Supabase. Check your network connection or run 'tt config' to verify your settings.`;
  }

  if (message.includes('Invalid API key') || message.includes('401') || message.includes('403')) {
    return `Supabase authentication failed. Run 'tt config' to update your credentials.`;
  }

  return message;
}
