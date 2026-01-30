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
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /** @spec connection.no-config */
  it('should throw error when no configuration exists', async () => {
    vi.mocked(getConfig).mockReturnValue(null);

    // Re-import to reset the cached client
    const { getSupabaseClient } = await import('./connection.js');

    expect(() => getSupabaseClient()).toThrow("Missing configuration. Run 'tt config' to set up your credentials.");
    expect(() => getSupabaseClient()).toThrow('/mock/.tt/config.json');
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
