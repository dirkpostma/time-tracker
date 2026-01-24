import Constants from 'expo-constants';

/**
 * Environment configuration with typed values and defaults.
 * Values are loaded from app.config.js which reads from .env files.
 */

interface ExtraConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  apiTimeout?: string;
  enableOfflineMode?: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

function getString(value: string | undefined, defaultValue: string): string {
  return value ?? defaultValue;
}

function getNumber(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

export const env = {
  // Supabase configuration
  supabaseUrl: getString(extra.supabaseUrl, 'http://127.0.0.1:54321'),
  supabaseAnonKey: getString(extra.supabaseAnonKey, ''),

  // API settings
  apiTimeout: getNumber(extra.apiTimeout, 30000),

  // Feature flags
  enableOfflineMode: getBoolean(extra.enableOfflineMode, true),

  // Runtime checks
  isDev: __DEV__,
} as const;

export type Env = typeof env;

// Validation - warn in dev if required values are missing
if (__DEV__) {
  if (!env.supabaseAnonKey) {
    console.warn(
      '[env] SUPABASE_ANON_KEY is not set. Copy .env.example to .env and configure your values.'
    );
  }
}
