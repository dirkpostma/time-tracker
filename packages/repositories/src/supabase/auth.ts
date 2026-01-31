/**
 * Auth module for Supabase authentication.
 * Handles login, logout, session management.
 *
 * Note: For CLI usage with file-based token persistence, use auth-cli.ts instead.
 * This module is mobile/web-safe and does not import Node.js modules.
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

// Re-export User as alias for backward compatibility
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

// Note: Legacy CLI functions (initAuthSession, signIn, signOut, getCurrentUser)
// are now in auth-cli.ts for CLI usage with file-based token persistence.
