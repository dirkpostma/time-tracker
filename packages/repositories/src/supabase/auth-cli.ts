/**
 * CLI-specific auth functions with file-based token persistence.
 * This module imports config.js which uses Node.js fs module,
 * so it should only be used by CLI - never import this from mobile/web.
 */

import { getSupabaseClient } from './connection.js';
import { getAuthTokens, saveAuthTokens, clearAuthTokens } from './config.js';
import type { AuthUser } from '@time-tracker/core';

// Re-export User type alias for backward compatibility
export type User = AuthUser;

/**
 * Initializes auth session from stored tokens.
 * Should be called before making authenticated requests.
 * @returns The current user if session is valid, null otherwise
 */
export async function initAuthSession(): Promise<User | null> {
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
 * Saves auth tokens to config file for CLI persistence.
 * @returns The user on success
 * @throws Error on authentication failure
 */
export async function signIn(email: string, password: string): Promise<User> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session || !data.user) {
    throw new Error('Login failed');
  }

  // Save tokens to config file
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
 * Signs out the current user.
 * Clears both Supabase session and stored tokens.
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();

  // Sign out from Supabase (ignore errors - we're logging out anyway)
  await supabase.auth.signOut();

  // Clear stored tokens from config file
  clearAuthTokens();
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
