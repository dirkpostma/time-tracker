/**
 * Environment configuration with typed values and defaults.
 * Uses Expo's EXPO_PUBLIC_* convention for client-side env vars.
 *
 * Local dev: reads from .env file
 * EAS Build: reads from EAS environment variables
 *
 * @see https://docs.expo.dev/eas/environment-variables/
 */

function getString(value: string | undefined, defaultValue: string): string {
  return value ?? defaultValue;
}

function getNumber(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const env = {
  // Supabase configuration
  supabaseUrl: getString(process.env.EXPO_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54321'),
  supabasePublishableKey: getString(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, ''),

  // API settings
  apiTimeout: getNumber(process.env.EXPO_PUBLIC_API_TIMEOUT, 30000),

  // Runtime checks
  isDev: __DEV__,
} as const;

export type Env = typeof env;

// Validation - warn in dev if required values are missing
if (__DEV__) {
  if (!env.supabasePublishableKey) {
    console.warn(
      '[env] EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set. Copy .env.example to .env and configure your values.'
    );
  }
}
