import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { StorageAdapter } from './storage.js';

// Mock the config module before importing connection
vi.mock('./config.js', () => ({
  getConfig: vi.fn(),
  getConfigPath: vi.fn().mockReturnValue('/mock/.tt/config.json'),
}));

// Must import after mocking
import { getConfig, getConfigPath } from './config.js';

describe('getSupabaseClient (no config)', () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  beforeEach(() => {
    vi.resetModules();
    // Clear env vars to test the "no config" scenario
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restore env vars
    if (originalUrl) process.env.SUPABASE_URL = originalUrl;
    else delete process.env.SUPABASE_URL;
    if (originalKey) process.env.SUPABASE_PUBLISHABLE_KEY = originalKey;
    else delete process.env.SUPABASE_PUBLISHABLE_KEY;
  });

  /** @spec connection.no-config */
  it('should throw error when no configuration exists', async () => {
    // Re-import to reset the cached client
    const { getSupabaseClient, clearSupabaseClient } = await import('./connection.js');
    clearSupabaseClient();

    expect(() => getSupabaseClient()).toThrow('Supabase client not initialized');
  });
});

describe('initSupabaseClient', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a client with provided URL and key', async () => {
    const { initSupabaseClient, clearSupabaseClient } = await import('./connection.js');
    clearSupabaseClient();

    const client = initSupabaseClient(
      'https://test.supabase.co',
      'test-anon-key'
    );

    expect(client).toBeDefined();
  });

  it('should accept a custom storage adapter', async () => {
    const { initSupabaseClient, clearSupabaseClient } = await import('./connection.js');
    clearSupabaseClient();

    const mockStorage: StorageAdapter = {
      getItem: vi.fn().mockResolvedValue(null),
      setItem: vi.fn().mockResolvedValue(undefined),
      removeItem: vi.fn().mockResolvedValue(undefined),
    };

    const client = initSupabaseClient(
      'https://test.supabase.co',
      'test-anon-key',
      { storage: mockStorage }
    );

    expect(client).toBeDefined();
  });

  it('should set the client for subsequent getSupabaseClient calls', async () => {
    const { initSupabaseClient, getSupabaseClient, clearSupabaseClient } = await import('./connection.js');
    clearSupabaseClient();

    const initializedClient = initSupabaseClient(
      'https://test.supabase.co',
      'test-anon-key'
    );

    const retrievedClient = getSupabaseClient();
    expect(retrievedClient).toBe(initializedClient);
  });

  it('should support custom auth options', async () => {
    const { initSupabaseClient, clearSupabaseClient } = await import('./connection.js');
    clearSupabaseClient();

    const client = initSupabaseClient(
      'https://test.supabase.co',
      'test-anon-key',
      {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: true,
      }
    );

    expect(client).toBeDefined();
  });
});
