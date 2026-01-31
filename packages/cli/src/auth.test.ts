import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock @inquirer/prompts before importing the module
vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
  password: vi.fn(),
}));

// Mock the auth repository
vi.mock('@time-tracker/repositories/supabase/auth-cli', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  initAuthSession: vi.fn(),
}));

import { loginCommand, logoutCommand, whoamiCommand, ensureAuth } from './auth.js';
import { input, password } from '@inquirer/prompts';
import { signIn, signOut, getCurrentUser, initAuthSession } from '@time-tracker/repositories/supabase/auth-cli';

describe('loginCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** @spec auth.login.success */
  it('prompts for email and password on successful login', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    vi.mocked(input).mockResolvedValue('test@example.com');
    vi.mocked(password).mockResolvedValue('password123');
    vi.mocked(signIn).mockResolvedValue({ id: 'user-123', email: 'test@example.com' });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await loginCommand();

    expect(input).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email:' }));
    expect(password).toHaveBeenCalledWith(expect.objectContaining({ message: 'Password:' }));
    expect(signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(consoleSpy).toHaveBeenCalledWith('Logged in as test@example.com');

    consoleSpy.mockRestore();
  });

  it('shows error message when login fails', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    vi.mocked(input).mockResolvedValue('test@example.com');
    vi.mocked(password).mockResolvedValue('wrongpassword');
    vi.mocked(signIn).mockRejectedValue(new Error('Invalid login credentials'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    await expect(loginCommand()).rejects.toThrow('process.exit(1)');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Invalid login credentials');

    consoleErrorSpy.mockRestore();
    mockExit.mockRestore();
  });

  it('does not prompt if already logged in', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-123', email: 'existing@example.com' });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await loginCommand();

    expect(input).not.toHaveBeenCalled();
    expect(password).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Already logged in as existing@example.com');
    expect(consoleSpy).toHaveBeenCalledWith('Run `tt logout` to sign out first.');

    consoleSpy.mockRestore();
  });
});

describe('logoutCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** @spec auth.logout.success */
  it('calls signOut and shows success message', async () => {
    vi.mocked(signOut).mockResolvedValue();

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await logoutCommand();

    expect(signOut).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Logged out successfully');

    consoleSpy.mockRestore();
  });

  it('shows error message when logout fails', async () => {
    vi.mocked(signOut).mockRejectedValue(new Error('Logout error'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    await expect(logoutCommand()).rejects.toThrow('process.exit(1)');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Logout error');

    consoleErrorSpy.mockRestore();
    mockExit.mockRestore();
  });
});

describe('whoamiCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** @spec auth.whoami.logged-in */
  it('shows user email when logged in via initAuthSession', async () => {
    vi.mocked(initAuthSession).mockResolvedValue({ id: 'user-123', email: 'test@example.com' });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await whoamiCommand();

    expect(consoleSpy).toHaveBeenCalledWith('Logged in as test@example.com');

    consoleSpy.mockRestore();
  });

  it('falls back to getCurrentUser when initAuthSession returns null', async () => {
    vi.mocked(initAuthSession).mockResolvedValue(null);
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-456', email: 'fallback@example.com' });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await whoamiCommand();

    expect(consoleSpy).toHaveBeenCalledWith('Logged in as fallback@example.com');

    consoleSpy.mockRestore();
  });

  /** @spec auth.whoami.not-logged-in */
  it('shows not logged in message when no user', async () => {
    vi.mocked(initAuthSession).mockResolvedValue(null);
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await whoamiCommand();

    expect(consoleSpy).toHaveBeenCalledWith('Not logged in. Run `tt login` to sign in.');

    consoleSpy.mockRestore();
  });

  it('shows error message on failure', async () => {
    vi.mocked(initAuthSession).mockRejectedValue(new Error('Auth check failed'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    await expect(whoamiCommand()).rejects.toThrow('process.exit(1)');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Auth check failed');

    consoleErrorSpy.mockRestore();
    mockExit.mockRestore();
  });
});

describe('ensureAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns successfully when session is valid', async () => {
    vi.mocked(initAuthSession).mockResolvedValue({ id: 'user-123', email: 'test@example.com' });

    await expect(ensureAuth()).resolves.not.toThrow();
  });

  /** @spec config.auth.not-logged-in */
  it('exits with error when not logged in', async () => {
    vi.mocked(initAuthSession).mockResolvedValue(null);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    await expect(ensureAuth()).rejects.toThrow('process.exit(1)');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Not logged in. Run `tt login` to sign in.');

    consoleErrorSpy.mockRestore();
    mockExit.mockRestore();
  });

  it('exits with error on auth check failure', async () => {
    vi.mocked(initAuthSession).mockRejectedValue(new Error('Session error'));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });

    await expect(ensureAuth()).rejects.toThrow('process.exit(1)');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Session error');

    consoleErrorSpy.mockRestore();
    mockExit.mockRestore();
  });
});

/**
 * Tests for auth-exempt commands behavior.
 * The CLI preAction hook in index.ts skips ensureAuth for these commands:
 * config, login, logout, whoami
 *
 * These tests verify that exempt commands can execute without authentication.
 */
describe('auth-exempt commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** @spec config.auth.exempt-commands */
  it('loginCommand executes normally without prior auth', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    vi.mocked(input).mockResolvedValue('test@example.com');
    vi.mocked(password).mockResolvedValue('password123');
    vi.mocked(signIn).mockResolvedValue({ id: 'user-123', email: 'test@example.com' });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // loginCommand does not call ensureAuth internally - it's exempt in index.ts preAction
    await loginCommand();

    // Verify it executed normally
    expect(signIn).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Logged in as test@example.com');

    consoleSpy.mockRestore();
  });

  /** @spec config.auth.exempt-commands */
  it('logoutCommand executes normally without prior auth', async () => {
    vi.mocked(signOut).mockResolvedValue();

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // logoutCommand does not call ensureAuth internally - it's exempt in index.ts preAction
    await logoutCommand();

    // Verify it executed normally
    expect(signOut).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Logged out successfully');

    consoleSpy.mockRestore();
  });

  /** @spec config.auth.exempt-commands */
  it('whoamiCommand executes normally without prior auth', async () => {
    vi.mocked(initAuthSession).mockResolvedValue(null);
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // whoamiCommand does not call ensureAuth internally - it's exempt in index.ts preAction
    await whoamiCommand();

    // Verify it executed normally (showing "not logged in" is valid behavior)
    expect(consoleSpy).toHaveBeenCalledWith('Not logged in. Run `tt login` to sign in.');

    consoleSpy.mockRestore();
  });
});
