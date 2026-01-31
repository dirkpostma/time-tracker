/**
 * Auth module for Supabase authentication.
 * Handles login, logout, session management and token persistence.
 */

import { getSupabaseClient, formatSupabaseError } from './connection.js';
import { RepositoryError } from '../types.js';
import type {
  AuthRepository,
  AuthUser,
  AuthSession,
  AuthStateChangeCallback,
  AuthUnsubscribe,
} from '@time-tracker/core';

// Token persistence helpers - these are no-ops on React Native (tokens are stored via Supabase's storage adapter)
// CLI imports these directly from config.js for file-based persistence
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Lazy-loaded config module for CLI token persistence (not available on React Native)
let configModule: { getAuthTokens: () => AuthTokens | null; saveAuthTokens: (tokens: AuthTokens) => void; clearAuthTokens: () => void } | null = null;
let configLoadAttempted = false;

async function loadConfigModule(): Promise<typeof configModule> {
  if (configLoadAttempted) return configModule;
  configLoadAttempted = true;
  try {
    // Dynamic import - will fail on React Native but that's OK
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configModule = await (import('./config.js') as Promise<any>);
  } catch {
    // On React Native, this will fail - that's expected
    configModule = null;
  }
  return configModule;
}

// Synchronous getters for tokens (returns null if config not loaded)
function getAuthTokens(): AuthTokens | null {
  return configModule?.getAuthTokens() ?? null;
}

function saveAuthTokens(tokens: AuthTokens): void {
  configModule?.saveAuthTokens(tokens);
}

function clearAuthTokens(): void {
  configModule?.clearAuthTokens();
}

// Re-export User as alias for backward compatibility with CLI
export type User = AuthUser;

/**
 * Supabase implementation of the AuthRepository interface.
 * Handles all authentication operations against Supabase.
 */
export class SupabaseAuthRepository implements AuthRepository {
  /**
   * Signs in with email and password.
   */
  async signIn(email: string, password: string): Promise<AuthUser> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new RepositoryError(formatSupabaseError(error.message));
    }

    if (!data.session || !data.user) {
      throw new RepositoryError('Login failed');
    }

    // Save tokens to config (for CLI persistence)
    saveAuthTokens({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? 0,
    });

    return {
      id: data.user.id,
      email: data.user.email ?? '',
    };
  }

  /**
   * Signs up with email and password.
   */
  async signUp(email: string, password: string): Promise<AuthUser> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new RepositoryError(formatSupabaseError(error.message));
    }

    if (!data.user) {
      throw new RepositoryError('Sign up failed');
    }

    // Save tokens if session is available (not all sign-up flows return a session)
    if (data.session) {
      saveAuthTokens({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at ?? 0,
      });
    }

    return {
      id: data.user.id,
      email: data.user.email ?? '',
    };
  }

  /**
   * Signs out the current user.
   */
  async signOut(): Promise<void> {
    const supabase = getSupabaseClient();

    // Sign out from Supabase (ignore errors - we're logging out anyway)
    await supabase.auth.signOut();

    // Clear stored tokens
    clearAuthTokens();
  }

  /**
   * Sends a password reset email.
   */
  async resetPassword(email: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new RepositoryError(formatSupabaseError(error.message));
    }
  }

  /**
   * Gets the current session.
   */
  async getSession(): Promise<AuthSession | null> {
    const supabase = getSupabaseClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      throw new RepositoryError(formatSupabaseError(error.message));
    }

    if (!session) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email ?? '',
      },
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
    };
  }

  /**
   * Subscribes to auth state changes.
   */
  onAuthStateChange(callback: AuthStateChangeCallback): AuthUnsubscribe {
    const supabase = getSupabaseClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Map Supabase events to our event types
      let mappedEvent: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_DELETED';
      switch (event) {
        case 'SIGNED_IN':
        case 'INITIAL_SESSION':
          mappedEvent = 'SIGNED_IN';
          break;
        case 'SIGNED_OUT':
          mappedEvent = 'SIGNED_OUT';
          break;
        case 'TOKEN_REFRESHED':
          mappedEvent = 'TOKEN_REFRESHED';
          break;
        default:
          // Ignore other events like PASSWORD_RECOVERY, USER_UPDATED, MFA_CHALLENGE_VERIFIED
          // Note: USER_DELETED is not a Supabase auth event - account deletion is handled
          // via RPC and followed by sign out
          return;
      }

      const mappedSession: AuthSession | null = session
        ? {
            user: {
              id: session.user.id,
              email: session.user.email ?? '',
            },
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          }
        : null;

      callback(mappedEvent, mappedSession);
    });

    return () => subscription.unsubscribe();
  }

  /**
   * Deletes the current user's account.
   * Requires password verification via RPC.
   */
  async deleteAccount(password: string): Promise<void> {
    const supabase = getSupabaseClient();

    // Delete user account via RPC (also verifies password)
    const { error: deleteError } = await supabase.rpc('delete_user_account', {
      password,
    });

    if (deleteError) {
      if (deleteError.message.includes('Incorrect password')) {
        throw new RepositoryError('Incorrect password');
      }
      throw new RepositoryError(formatSupabaseError(deleteError.message));
    }

    // Clear stored tokens
    clearAuthTokens();

    // Sign out to clean up Supabase state
    await supabase.auth.signOut();
  }
}

/**
 * Creates a new SupabaseAuthRepository instance.
 */
export function createAuthRepository(): AuthRepository {
  return new SupabaseAuthRepository();
}

// ============================================================
// Legacy function exports for backward compatibility with CLI
// ============================================================

/**
 * Initializes auth session from stored tokens.
 * Should be called before making authenticated requests.
 * @returns The current user if session is valid, null otherwise
 */
export async function initAuthSession(): Promise<User | null> {
  // Ensure config module is loaded for token persistence
  await loadConfigModule();
  
  const tokens = getAuthTokens();
  if (!tokens) return null;

  const supabase = getSupabaseClient();

  // Set the session from stored tokens
  const { data, error } = await supabase.auth.setSession({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });

  if (error || !data.session) {
    // Invalid/expired tokens - clear them
    clearAuthTokens();
    return null;
  }

  // Save refreshed tokens if they changed
  if (data.session.access_token !== tokens.accessToken) {
    saveAuthTokens({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? 0,
    });
  }

  return {
    id: data.session.user.id,
    email: data.session.user.email ?? '',
  };
}

/**
 * Signs in with email and password.
 * @returns The user on success
 * @throws Error on authentication failure
 */
export async function signIn(email: string, password: string): Promise<User> {
  const repo = new SupabaseAuthRepository();
  return repo.signIn(email, password);
}

/**
 * Signs out the current user.
 * Clears both Supabase session and stored tokens.
 */
export async function signOut(): Promise<void> {
  const repo = new SupabaseAuthRepository();
  return repo.signOut();
}

/**
 * Gets the currently logged-in user.
 * @returns The current user or null if not logged in
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? '',
  };
}
