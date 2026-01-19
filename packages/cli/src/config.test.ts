import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock @inquirer/prompts before importing the module
vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
  confirm: vi.fn(),
}));

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

import { configCommand, validateCredentials, ensureConfig } from './config.js';
import { getConfig, saveConfig } from '@time-tracker/repositories/supabase/config';
import { input, confirm } from '@inquirer/prompts';
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
  const testConfigPath = path.join(testConfigDir, 'config.json');

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

  /** @spec config.auth.exempt-commands */
  it('configCommand executes normally without prior auth', async () => {
    // configCommand does not require auth - it's exempt in index.ts preAction
    const mockInput = vi.mocked(input);
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    mockInput
      .mockResolvedValueOnce('https://test.supabase.co')
      .mockResolvedValueOnce('test-key');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // configCommand should execute without requiring auth
    await configCommand();

    // Verify it executed normally
    expect(mockInput).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('saved'));

    consoleSpy.mockRestore();
  });

  it('prompts for URL and key', async () => {
    const mockInput = vi.mocked(input);
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    mockInput
      .mockResolvedValueOnce('https://prompted.supabase.co')
      .mockResolvedValueOnce('prompted-key');

    // Capture console output
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await configCommand();

    // Verify prompts were called
    expect(mockInput).toHaveBeenCalledTimes(2);
    expect(mockInput).toHaveBeenNthCalledWith(1, expect.objectContaining({
      message: 'Supabase URL:',
    }));
    expect(mockInput).toHaveBeenNthCalledWith(2, expect.objectContaining({
      message: 'Supabase Publishable Key:',
    }));

    consoleSpy.mockRestore();
  });

  it('saves credentials when validation succeeds', async () => {
    const mockInput = vi.mocked(input);
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    mockInput
      .mockResolvedValueOnce('https://test.supabase.co')
      .mockResolvedValueOnce('test-key');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await configCommand();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('saved'));

    consoleSpy.mockRestore();
  });

  it('does not save credentials when validation fails', async () => {
    const mockInput = vi.mocked(input);
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Invalid API key', code: 'PGRST301' },
        }),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    mockInput
      .mockResolvedValueOnce('https://invalid.supabase.co')
      .mockResolvedValueOnce('invalid-key');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await configCommand();

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid Supabase credentials'));
    expect(consoleSpy).toHaveBeenCalledWith('Credentials not saved.');

    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('shows connection error when network fails', async () => {
    const mockInput = vi.mocked(input);
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockRejectedValue(new TypeError('fetch failed')),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    mockInput
      .mockResolvedValueOnce('https://test.supabase.co')
      .mockResolvedValueOnce('test-key');

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await configCommand();

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Could not connect'));

    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
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
    expect(confirm).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  /** @spec config.firstrun.no-config */
  it('prompts with exact message when no config exists', async () => {
    vi.mocked(getConfig).mockReturnValue(null);
    vi.mocked(confirm).mockResolvedValue(false);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    await expect(ensureConfig()).rejects.toThrow('process.exit(0)');

    expect(confirm).toHaveBeenCalledWith({
      message: 'No configuration found. Set up now?',
      default: true,
    });

    consoleSpy.mockRestore();
    mockExit.mockRestore();
  });

  /** @spec config.firstrun.user-confirms */
  it('prompts to set up when no config exists and user accepts', async () => {
    vi.mocked(getConfig)
      .mockReturnValueOnce(null) // First call: no config
      .mockReturnValue({ supabaseUrl: 'https://new.supabase.co', supabaseKey: 'new-key' }); // After setup

    vi.mocked(confirm).mockResolvedValue(true);
    vi.mocked(input)
      .mockResolvedValueOnce('https://new.supabase.co')
      .mockResolvedValueOnce('new-key');

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    vi.mocked(createClient).mockReturnValue({ from: mockFrom } as any);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await ensureConfig();

    expect(confirm).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('No configuration found'),
    }));
    expect(result).toEqual({ supabaseUrl: 'https://new.supabase.co', supabaseKey: 'new-key' });

    consoleSpy.mockRestore();
  });

  /** @spec config.firstrun.user-declines */
  it('exits when no config and user declines setup', async () => {
    vi.mocked(getConfig).mockReturnValue(null);
    vi.mocked(confirm).mockResolvedValue(false);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    await expect(ensureConfig()).rejects.toThrow('process.exit(0)');

    expect(consoleSpy).toHaveBeenCalledWith("Run 'tt config' when ready.");

    consoleSpy.mockRestore();
    mockExit.mockRestore();
  });

  /** @spec config.firstrun.validation-fails */
  it('exits with error when user confirms but validation fails', async () => {
    // getConfig always returns null - config never saved due to validation failure
    vi.mocked(getConfig).mockReturnValue(null);
    vi.mocked(confirm).mockResolvedValue(true);
    vi.mocked(input)
      .mockResolvedValueOnce('https://test.supabase.co')
      .mockResolvedValueOnce('invalid-key');

    // Mock validation failure (invalid key)
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
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    await expect(ensureConfig()).rejects.toThrow('process.exit(1)');

    expect(consoleSpy).toHaveBeenCalledWith("Configuration not saved. Run 'tt config' when ready.");

    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    mockExit.mockRestore();
  });
});
