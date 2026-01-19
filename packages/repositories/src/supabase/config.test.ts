import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getConfig, saveConfig, getConfigPath, getAuthTokens, saveAuthTokens, clearAuthTokens, AuthTokens } from './config.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('config', () => {
  const testConfigDir = path.join(os.tmpdir(), `.tt-config-test-${Date.now()}`);
  const testConfigPath = path.join(testConfigDir, 'config.json');

  // Store original env values
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  beforeEach(() => {
    // Clear relevant env vars before each test
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

  describe('getConfigPath', () => {
    it('returns path in .tt directory in home folder', () => {
      const configPath = getConfigPath();
      expect(configPath).toContain('.tt');
      expect(configPath).toContain('config.json');
      expect(configPath).toContain(os.homedir());
    });
  });

  describe('getConfig', () => {
    it('returns config from environment variables when set', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_PUBLISHABLE_KEY = 'test-key';

      const config = getConfig(testConfigPath);

      expect(config).toEqual({
        supabaseUrl: 'https://test.supabase.co',
        supabaseKey: 'test-key',
      });
    });

    it('returns null when no env vars and no config file', () => {
      const config = getConfig(testConfigPath);
      expect(config).toBeNull();
    });

    it('returns config from file when env vars not set', () => {
      fs.mkdirSync(testConfigDir, { recursive: true });
      fs.writeFileSync(testConfigPath, JSON.stringify({
        supabaseUrl: 'https://file.supabase.co',
        supabaseKey: 'file-key',
      }));

      const config = getConfig(testConfigPath);

      expect(config).toEqual({
        supabaseUrl: 'https://file.supabase.co',
        supabaseKey: 'file-key',
      });
    });

    it('prioritizes environment variables over config file', () => {
      // Create config file
      fs.mkdirSync(testConfigDir, { recursive: true });
      fs.writeFileSync(testConfigPath, JSON.stringify({
        supabaseUrl: 'https://file.supabase.co',
        supabaseKey: 'file-key',
      }));

      // Set env vars
      process.env.SUPABASE_URL = 'https://env.supabase.co';
      process.env.SUPABASE_PUBLISHABLE_KEY = 'env-key';

      const config = getConfig(testConfigPath);

      expect(config).toEqual({
        supabaseUrl: 'https://env.supabase.co',
        supabaseKey: 'env-key',
      });
    });

    it('returns null when config file has invalid JSON', () => {
      fs.mkdirSync(testConfigDir, { recursive: true });
      fs.writeFileSync(testConfigPath, 'not valid json');

      const config = getConfig(testConfigPath);
      expect(config).toBeNull();
    });

    it('returns null when config file is missing required fields', () => {
      fs.mkdirSync(testConfigDir, { recursive: true });
      fs.writeFileSync(testConfigPath, JSON.stringify({
        supabaseUrl: 'https://test.co',
        // missing supabaseKey
      }));

      const config = getConfig(testConfigPath);
      expect(config).toBeNull();
    });
  });

  describe('saveConfig', () => {
    it('creates config directory if it does not exist', () => {
      const config = { supabaseUrl: 'https://test.co', supabaseKey: 'key' };

      saveConfig(config, testConfigPath);

      expect(fs.existsSync(testConfigDir)).toBe(true);
      expect(fs.existsSync(testConfigPath)).toBe(true);
    });

    it('saves config as JSON', () => {
      const config = { supabaseUrl: 'https://save.co', supabaseKey: 'save-key' };

      saveConfig(config, testConfigPath);

      const savedContent = fs.readFileSync(testConfigPath, 'utf-8');
      expect(JSON.parse(savedContent)).toEqual(config);
    });

    it('overwrites existing config file', () => {
      const initial = { supabaseUrl: 'https://old.co', supabaseKey: 'old-key' };
      const updated = { supabaseUrl: 'https://new.co', supabaseKey: 'new-key' };

      saveConfig(initial, testConfigPath);
      saveConfig(updated, testConfigPath);

      const savedContent = fs.readFileSync(testConfigPath, 'utf-8');
      expect(JSON.parse(savedContent)).toEqual(updated);
    });

    it('formats JSON with indentation', () => {
      const config = { supabaseUrl: 'https://test.co', supabaseKey: 'key' };

      saveConfig(config, testConfigPath);

      const savedContent = fs.readFileSync(testConfigPath, 'utf-8');
      expect(savedContent).toContain('\n'); // Has newlines (formatted)
    });

    it('sets file permissions to 0600 (user read/write only)', () => {
      const config = { supabaseUrl: 'https://test.co', supabaseKey: 'key' };

      saveConfig(config, testConfigPath);

      const stats = fs.statSync(testConfigPath);
      // 0o600 = 384 in decimal, but mode includes file type bits
      // We mask with 0o777 to get just the permission bits
      const permissions = stats.mode & 0o777;
      expect(permissions).toBe(0o600);
    });
  });

  describe('getAuthTokens', () => {
    it('returns null when no config file exists', () => {
      const tokens = getAuthTokens(testConfigPath);
      expect(tokens).toBeNull();
    });

    /** @spec config.auth-tokens.parse-error */
    it('returns null when config file contains invalid JSON', () => {
      fs.mkdirSync(testConfigDir, { recursive: true });
      fs.writeFileSync(testConfigPath, 'not valid json');

      const tokens = getAuthTokens(testConfigPath);
      expect(tokens).toBeNull();
    });

    it('returns null when config exists but has no auth tokens', () => {
      fs.mkdirSync(testConfigDir, { recursive: true });
      fs.writeFileSync(testConfigPath, JSON.stringify({
        supabaseUrl: 'https://test.co',
        supabaseKey: 'key',
      }));

      const tokens = getAuthTokens(testConfigPath);
      expect(tokens).toBeNull();
    });

    it('returns auth tokens when they exist in config', () => {
      const authTokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresAt: 1700000000,
      };
      fs.mkdirSync(testConfigDir, { recursive: true });
      fs.writeFileSync(testConfigPath, JSON.stringify({
        supabaseUrl: 'https://test.co',
        supabaseKey: 'key',
        auth: authTokens,
      }));

      const tokens = getAuthTokens(testConfigPath);

      expect(tokens).toEqual(authTokens);
    });
  });

  describe('saveAuthTokens', () => {
    it('saves auth tokens to existing config file', () => {
      fs.mkdirSync(testConfigDir, { recursive: true });
      fs.writeFileSync(testConfigPath, JSON.stringify({
        supabaseUrl: 'https://test.co',
        supabaseKey: 'key',
      }));

      const authTokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresAt: 1700000000,
      };

      saveAuthTokens(authTokens, testConfigPath);

      const savedContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf-8'));
      expect(savedContent.auth).toEqual(authTokens);
      expect(savedContent.supabaseUrl).toBe('https://test.co');
      expect(savedContent.supabaseKey).toBe('key');
    });

    it('overwrites existing auth tokens', () => {
      const oldTokens: AuthTokens = {
        accessToken: 'old-access',
        refreshToken: 'old-refresh',
        expiresAt: 1600000000,
      };
      fs.mkdirSync(testConfigDir, { recursive: true });
      fs.writeFileSync(testConfigPath, JSON.stringify({
        supabaseUrl: 'https://test.co',
        supabaseKey: 'key',
        auth: oldTokens,
      }));

      const newTokens: AuthTokens = {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        expiresAt: 1700000000,
      };

      saveAuthTokens(newTokens, testConfigPath);

      const savedContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf-8'));
      expect(savedContent.auth).toEqual(newTokens);
    });

    it('throws error when config file does not exist', () => {
      const authTokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresAt: 1700000000,
      };

      expect(() => saveAuthTokens(authTokens, testConfigPath)).toThrow('Config file not found');
    });
  });

  describe('clearAuthTokens', () => {
    it('removes auth tokens from config file', () => {
      const authTokens: AuthTokens = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresAt: 1700000000,
      };
      fs.mkdirSync(testConfigDir, { recursive: true });
      fs.writeFileSync(testConfigPath, JSON.stringify({
        supabaseUrl: 'https://test.co',
        supabaseKey: 'key',
        auth: authTokens,
      }));

      clearAuthTokens(testConfigPath);

      const savedContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf-8'));
      expect(savedContent.auth).toBeUndefined();
      expect(savedContent.supabaseUrl).toBe('https://test.co');
      expect(savedContent.supabaseKey).toBe('key');
    });

    it('does nothing when no auth tokens exist', () => {
      fs.mkdirSync(testConfigDir, { recursive: true });
      fs.writeFileSync(testConfigPath, JSON.stringify({
        supabaseUrl: 'https://test.co',
        supabaseKey: 'key',
      }));

      clearAuthTokens(testConfigPath);

      const savedContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf-8'));
      expect(savedContent.auth).toBeUndefined();
      expect(savedContent.supabaseUrl).toBe('https://test.co');
    });

    it('does nothing when config file does not exist', () => {
      // Should not throw
      expect(() => clearAuthTokens(testConfigPath)).not.toThrow();
    });
  });
});
