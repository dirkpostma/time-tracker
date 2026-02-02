import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

import { configCommand, validateCredentials, ensureConfig } from './config.js';
import { getConfig } from '@time-tracker/repositories/supabase/config';
import { createClient } from '@supabase/supabase-js';

// Mock config.js for ensureConfig tests
vi.mock('@time-tracker/repositories/supabase/config', async (importOriginal) => {
  const original = await importOriginal<typeof import('@time-tracker/repositories/supabase/config')>();
  return {
    ...original,
    getConfig: vi.fn(original.getConfig),
  };
});

describe('validateCredentials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** @spec config.validation.invalid-url */
  it('returns error for invalid URL format', async () => {
    const result = await validateCredentials('http://invalid-url.com', 'some-key');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid Supabase URL format');
  });

  /** @spec config.validation.invalid-url */
  it('returns error for URL without https', async () => {
    const result = await validateCredentials('http://myproject.supabase.co', 'some-key');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid Supabase URL format');
  });

  it('returns valid:true when connection succeeds', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    const result = await validateCredentials('https://myproject.supabase.co', 'valid-key');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  /** @spec config.validation.invalid-key */
  it('returns error when API key is invalid', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Invalid API key', code: 'PGRST301' },
        }),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    const result = await validateCredentials('https://myproject.supabase.co', 'invalid-key');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid Supabase credentials');
  });

  /** @spec config.validation.network-error */
  it('returns connection error when fetch fails', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockRejectedValue(new TypeError('fetch failed')),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    const result = await validateCredentials('https://myproject.supabase.co', 'some-key');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Could not connect to Supabase');
  });

  /** @spec config.validation.api-error */
  it('returns error with details for other API errors', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection pool exhausted', code: '500' },
        }),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    const result = await validateCredentials('https://myproject.supabase.co', 'some-key');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Supabase connection failed: Database connection pool exhausted');
  });

  /** @spec config.validation.api-error */
  it('returns error with details when exception is thrown (non-network)', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockRejectedValue(new Error('Unexpected server error')),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    const result = await validateCredentials('https://myproject.supabase.co', 'some-key');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Supabase connection failed: Unexpected server error');
  });
});

describe('showConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows config with masked key when config exists', async () => {
    const { showConfig } = await import('./config.js');
    vi.mocked(getConfig).mockReturnValue({
      supabaseUrl: 'https://myproject.supabase.co',
      supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secret',
    });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await showConfig();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('https://myproject.supabase.co'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('****'));
    // Should NOT show the full key
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('secret'));

    consoleSpy.mockRestore();
  });

  it('shows message when no config exists', async () => {
    const { showConfig } = await import('./config.js');
    vi.mocked(getConfig).mockReturnValue(null);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await showConfig();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No configuration found'));

    consoleSpy.mockRestore();
  });
});

describe('configCommand', () => {
  const testConfigDir = path.join(os.tmpdir(), `.tt-config-cmd-test-${Date.now()}`);

  // Store original env values
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  beforeEach(() => {
    vi.clearAllMocks();

    // Clear env vars so we test file-based config
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;

    // Clean up test directory
    if (fs.existsSync(testConfigDir)) {
      fs.rmSync(testConfigDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Restore original env
    if (originalUrl) process.env.SUPABASE_URL = originalUrl;
    else delete process.env.SUPABASE_URL;
    if (originalKey) process.env.SUPABASE_PUBLISHABLE_KEY = originalKey;
    else delete process.env.SUPABASE_PUBLISHABLE_KEY;

    // Clean up test directory
    if (fs.existsSync(testConfigDir)) {
      fs.rmSync(testConfigDir, { recursive: true });
    }
  });

  /** @spec config.flags */
  it('configures with --url and --key flags', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await configCommand({ url: 'https://test.supabase.co', key: 'test-key' });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('saved'));

    consoleSpy.mockRestore();
  });

  /** @spec config.env-vars */
  it('reads credentials from env vars when flags not provided', async () => {
    process.env.SUPABASE_URL = 'https://env.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'env-key';

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await configCommand({});

    expect(createClient).toHaveBeenCalledWith('https://env.supabase.co', 'env-key');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('saved'));

    consoleSpy.mockRestore();
  });

  /** @spec config.missing-credentials */
  it('exits with error when credentials not provided', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    await expect(configCommand({})).rejects.toThrow('process.exit(1)');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: URL and key required. Use --url and --key flags or set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY env vars.');

    consoleErrorSpy.mockRestore();
    mockExit.mockRestore();
  });

  /** @spec config.missing-url */
  it('exits with error when only key provided', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    await expect(configCommand({ key: 'test-key' })).rejects.toThrow('process.exit(1)');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: URL and key required. Use --url and --key flags or set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY env vars.');

    consoleErrorSpy.mockRestore();
    mockExit.mockRestore();
  });

  it('does not save credentials when validation fails', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Invalid API key', code: 'PGRST301' },
        }),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await configCommand({ url: 'https://invalid.supabase.co', key: 'invalid-key' });

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid Supabase credentials'));
    expect(consoleSpy).toHaveBeenCalledWith('Credentials not saved.');

    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('shows connection error when network fails', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockRejectedValue(new TypeError('fetch failed')),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await configCommand({ url: 'https://test.supabase.co', key: 'test-key' });

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Could not connect'));

    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  /** @spec config.auth.exempt-commands */
  it('configCommand executes normally without prior auth', async () => {
    // configCommand does not require auth - it's exempt in index.ts preAction
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // configCommand should execute without requiring auth
    await configCommand({ url: 'https://test.supabase.co', key: 'test-key' });

    // Verify it executed normally
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('saved'));

    consoleSpy.mockRestore();
  });
});

describe('ensureConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns config when it exists', async () => {
    const existingConfig = { supabaseUrl: 'https://test.supabase.co', supabaseKey: 'test-key' };
    vi.mocked(getConfig).mockReturnValue(existingConfig);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await ensureConfig();

    expect(result).toEqual(existingConfig);
    consoleSpy.mockRestore();
  });

  /** @spec config.firstrun.no-config */
  it('exits with error when no config exists', async () => {
    vi.mocked(getConfig).mockReturnValue(null);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    await expect(ensureConfig()).rejects.toThrow('process.exit(1)');

    expect(consoleErrorSpy).toHaveBeenCalledWith("No configuration found. Run 'tt config --url <url> --key <key>' to set up.");

    consoleErrorSpy.mockRestore();
    mockExit.mockRestore();
  });
});
