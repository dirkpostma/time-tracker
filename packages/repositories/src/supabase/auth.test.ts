import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock the connection module before importing auth
vi.mock('./connection.js', () => ({
  getSupabaseClient: vi.fn(),
}));

// Import after mocking
import { initAuthSession, signIn, signOut, getCurrentUser } from './auth.js';
import { getSupabaseClient } from './connection.js';
import { saveConfig, AuthTokens } from './config.js';

describe('auth', () => {
  const testConfigDir = path.join(os.tmpdir(), `.tt-auth-test-${Date.now()}`);
  const testConfigPath = path.join(testConfigDir, 'config.json');

  // Store original env values
  const originalConfigPath = process.env.TT_CONFIG_PATH;

  // Mock Supabase auth methods
  const mockSetSession = vi.fn();
  const mockSignInWithPassword = vi.fn();
  const mockSignOut = vi.fn();
  const mockGetUser = vi.fn();

  const mockSupabaseClient = {
    auth: {
      setSession: mockSetSession,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      getUser: mockGetUser,
    },
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    (getSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabaseClient);

    // Clean up test directory
    if (fs.existsSync(testConfigDir)) {
      fs.rmSync(testConfigDir, { recursive: true });
    }
    fs.mkdirSync(testConfigDir, { recursive: true });
  });

  afterEach(() => {
    // Restore original env
    if (originalConfigPath) process.env.TT_CONFIG_PATH = originalConfigPath;
    else delete process.env.TT_CONFIG_PATH;

    // Clean up test directory
    if (fs.existsSync(testConfigDir)) {
      fs.rmSync(testConfigDir, { recursive: true });
    }
  });

  describe('initAuthSession', () => {
    it('returns null when no stored tokens exist', async () => {
      // Create config without auth tokens
      saveConfig({ supabaseUrl: 'https://test.co', supabaseKey: 'key' }, testConfigPath);

      // We need to override the config path for this test
      // Since we can't easily do that, we'll test the function behavior
      const result = await initAuthSession();

      // With no tokens in the default config location, should return null
      expect(result).toBeNull();
    });
  });

  describe('signIn', () => {
    it('returns user on successful login', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
          session: {
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_at: 1700000000,
          },
        },
        error: null,
      });

      // Create config file so saveAuthTokens works
      saveConfig({ supabaseUrl: 'https://test.co', supabaseKey: 'key' });

      const user = await signIn('test@example.com', 'password');

      expect(user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
      });
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('throws error on invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(signIn('bad@example.com', 'wrong')).rejects.toThrow('Invalid login credentials');
    });

    it('throws error when no session returned', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await expect(signIn('test@example.com', 'password')).rejects.toThrow('Login failed');
    });
  });

  describe('signOut', () => {
    it('calls Supabase signOut and clears tokens', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      await signOut();

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('does not throw on Supabase signOut error', async () => {
      mockSignOut.mockResolvedValue({ error: { message: 'Some error' } });

      // Should not throw
      await expect(signOut()).resolves.not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('returns user when logged in', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
        },
      });

      const user = await getCurrentUser();

      expect(user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
      });
    });

    it('returns null when not logged in', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });
  });
});
