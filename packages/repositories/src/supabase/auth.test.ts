import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock the connection module before importing auth
vi.mock('./connection.js', () => ({
  getSupabaseClient: vi.fn(),
}));

// Mock the config module for token management tests
vi.mock('./config.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('./config.js')>();
  return {
    ...original,
    getAuthTokens: vi.fn(),
    saveAuthTokens: vi.fn(),
    clearAuthTokens: vi.fn(),
  };
});

// Import after mocking
import { initAuthSession, signIn, signOut, getCurrentUser } from './auth.js';
import { getSupabaseClient } from './connection.js';
import { saveConfig, getAuthTokens, saveAuthTokens, clearAuthTokens, AuthTokens } from './config.js';

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
      vi.mocked(getAuthTokens).mockReturnValue(null);

      const result = await initAuthSession();

      expect(result).toBeNull();
      expect(mockSetSession).not.toHaveBeenCalled();
    });

    /** @spec config.auth.token-refresh */
    it('refreshes token and saves to config when token changed', async () => {
      const oldTokens: AuthTokens = {
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
        expiresAt: 1700000000,
      };
      vi.mocked(getAuthTokens).mockReturnValue(oldTokens);

      mockSetSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            expires_at: 1700001000,
            user: { id: 'user-123', email: 'test@example.com' },
          },
        },
        error: null,
      });

      const result = await initAuthSession();

      expect(result).toEqual({ id: 'user-123', email: 'test@example.com' });
      expect(mockSetSession).toHaveBeenCalledWith({
        access_token: 'old-access-token',
        refresh_token: 'old-refresh-token',
      });
      expect(saveAuthTokens).toHaveBeenCalledWith({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: 1700001000,
      });
    });

    /** @spec config.auth.token-refresh */
    it('does not save tokens when access token unchanged', async () => {
      const tokens: AuthTokens = {
        accessToken: 'same-access-token',
        refreshToken: 'same-refresh-token',
        expiresAt: 1700000000,
      };
      vi.mocked(getAuthTokens).mockReturnValue(tokens);

      mockSetSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'same-access-token',
            refresh_token: 'same-refresh-token',
            expires_at: 1700000000,
            user: { id: 'user-123', email: 'test@example.com' },
          },
        },
        error: null,
      });

      const result = await initAuthSession();

      expect(result).toEqual({ id: 'user-123', email: 'test@example.com' });
      expect(saveAuthTokens).not.toHaveBeenCalled();
    });

    /** @spec config.auth.token-expired */
    it('clears tokens and returns null when session cannot be restored', async () => {
      const expiredTokens: AuthTokens = {
        accessToken: 'expired-access-token',
        refreshToken: 'expired-refresh-token',
        expiresAt: 1600000000, // expired
      };
      vi.mocked(getAuthTokens).mockReturnValue(expiredTokens);

      mockSetSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid Refresh Token: Refresh Token Not Found' },
      });

      const result = await initAuthSession();

      expect(result).toBeNull();
      expect(clearAuthTokens).toHaveBeenCalled();
    });

    /** @spec config.auth.token-expired */
    it('clears tokens when setSession returns no session', async () => {
      const tokens: AuthTokens = {
        accessToken: 'some-token',
        refreshToken: 'some-refresh',
        expiresAt: 1700000000,
      };
      vi.mocked(getAuthTokens).mockReturnValue(tokens);

      mockSetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await initAuthSession();

      expect(result).toBeNull();
      expect(clearAuthTokens).toHaveBeenCalled();
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
