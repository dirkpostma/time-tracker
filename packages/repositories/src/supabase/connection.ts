import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { StorageAdapter } from './storage.js';

let client: SupabaseClient | null = null;

/**
 * Options for initializing the Supabase client.
 */
export interface InitSupabaseClientOptions {
  /**
   * Custom storage adapter for auth session persistence.
   * Use this to provide platform-specific storage (e.g., expo-secure-store for React Native).
   */
  storage?: StorageAdapter
  /**
   * Whether to auto-refresh the auth token. Defaults to true.
   */
  autoRefreshToken?: boolean
  /**
   * Whether to persist the session. Defaults to true.
   */
  persistSession?: boolean
  /**
   * Whether to detect session from URL (for OAuth callbacks). Defaults to false.
   */
  detectSessionInUrl?: boolean
}

/**
 * Initializes the Supabase client with the provided credentials and options.
 * This is the preferred way to set up the client for platforms that need custom storage
 * (e.g., React Native with expo-secure-store).
 *
 * @param url - The Supabase project URL
 * @param anonKey - The Supabase anonymous/public key
 * @param options - Optional configuration including custom storage adapter
 * @returns The initialized Supabase client
 *
 * @example
 * // React Native with expo-secure-store
 * const expoStorage: StorageAdapter = {
 *   getItem: (key) => SecureStore.getItemAsync(key),
 *   setItem: (key, value) => SecureStore.setItemAsync(key, value),
 *   removeItem: (key) => SecureStore.deleteItemAsync(key),
 * }
 * initSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, { storage: expoStorage })
 */
export function initSupabaseClient(
  url: string,
  anonKey: string,
  options?: InitSupabaseClientOptions
): SupabaseClient {
  const authOptions: Record<string, unknown> = {
    autoRefreshToken: options?.autoRefreshToken ?? true,
    persistSession: options?.persistSession ?? true,
    detectSessionInUrl: options?.detectSessionInUrl ?? false,
  };

  // Only add storage option if provided
  if (options?.storage) {
    authOptions.storage = options.storage;
  }

  client = createClient(url, anonKey, {
    auth: authOptions,
  });

  return client;
}

/**
 * Sets a custom Supabase client (for mobile/testing).
 * Must be called before any repository operations.
 */
export function setSupabaseClient(customClient: SupabaseClient): void {
  client = customClient;
}

/**
 * Clears the Supabase client (for testing).
 */
export function clearSupabaseClient(): void {
  client = null;
}

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  // For CLI/Node.js: auto-initialize from environment variables if available
  // This allows tests and CLI to work without explicit initialization
  const envUrl = process.env.SUPABASE_URL;
  const envKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (envUrl && envKey) {
    client = createClient(envUrl, envKey);
    return client;
  }

  // For React Native/mobile: client must be initialized via initSupabaseClient first
  throw new Error(
    'Supabase client not initialized. Call initSupabaseClient() first, ' +
    'or for CLI usage, ensure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY environment variables are set.'
  );
}

/**
 * Initializes the Supabase client from config file or environment variables.
 * This is for CLI usage only - mobile should use initSupabaseClient() directly.
 * Note: This function dynamically imports the config module which uses Node.js fs,
 * so it will fail on React Native. Mobile apps should never call this.
 */
export async function initSupabaseClientFromConfig(): Promise<SupabaseClient> {
  if (client) return client;

  // Dynamic import to avoid bundling Node.js modules in React Native
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const configModule = await (import('./config.js') as Promise<any>);
  const config = configModule.getConfig();

  if (!config) {
    throw new Error(
      `Missing configuration. Run 'tt config' to set up your credentials.\n` +
      `Or create ${configModule.getConfigPath()} with:\n` +
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
