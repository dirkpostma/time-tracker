import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock @inquirer/prompts before importing the module
vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
}));

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

import { configCommand, validateCredentials } from './config.js';
import { getConfig, saveConfig } from '../config.js';
import { input } from '@inquirer/prompts';
import { createClient } from '@supabase/supabase-js';

describe('validateCredentials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error for invalid URL format', async () => {
    const result = await validateCredentials('http://invalid-url.com', 'some-key');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid Supabase URL format');
  });

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
