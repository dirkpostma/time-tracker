import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
