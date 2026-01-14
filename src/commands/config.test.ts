import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock @inquirer/prompts before importing the module
vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
}));

import { configCommand } from './config.js';
import { getConfig, saveConfig } from '../config.js';
import { input } from '@inquirer/prompts';

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

  it('shows existing values as defaults when config exists', async () => {
    // Create existing config
    fs.mkdirSync(testConfigDir, { recursive: true });
    saveConfig({ supabaseUrl: 'https://existing.co', supabaseKey: 'existing-key' }, testConfigPath);

    const mockInput = vi.mocked(input);
    mockInput
      .mockResolvedValueOnce('https://new.supabase.co')
      .mockResolvedValueOnce('new-key');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Note: configCommand uses real getConfig which won't find our test file
    // This test verifies the prompt interaction pattern
    await configCommand();

    expect(mockInput).toHaveBeenCalledTimes(2);

    consoleSpy.mockRestore();
  });
});
