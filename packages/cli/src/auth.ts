/**
 * CLI command handlers for authentication operations.
 * These are thin wrappers that:
 * - Parse CLI input
 * - Call auth repository functions
 * - Format and print output
 * - Handle errors with user-friendly messages
 */

import { input, password } from '@inquirer/prompts';
import { signIn, signOut, getCurrentUser, initAuthSession } from '@time-tracker/repositories/supabase/auth-cli';

/**
 * Login command handler.
 * Prompts for email and password, authenticates with Supabase.
 */
export async function loginCommand(): Promise<void> {
  // Check if already logged in
  const currentUser = await getCurrentUser();
  if (currentUser) {
    console.log(`Already logged in as ${currentUser.email}`);
    console.log('Run `tt logout` to sign out first.');
    return;
  }

  const email = await input({
    message: 'Email:',
  });

  const pwd = await password({
    message: 'Password:',
    mask: '*',
  });

  try {
    const user = await signIn(email, pwd);
    console.log(`Logged in as ${user.email}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

/**
 * Logout command handler.
 * Clears the current session and stored tokens.
 */
export async function logoutCommand(): Promise<void> {
  try {
    await signOut();
    console.log('Logged out successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

/**
 * Whoami command handler.
 * Shows the currently logged-in user.
 */
export async function whoamiCommand(): Promise<void> {
  try {
    // Try to restore session from stored tokens first
    let user = await initAuthSession();

    if (!user) {
      user = await getCurrentUser();
    }

    if (!user) {
      console.log('Not logged in. Run `tt login` to sign in.');
      return;
    }

    console.log(`Logged in as ${user.email}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user info';
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

/**
 * Ensures user is authenticated.
 * Initializes session from stored tokens if available.
 * Exits with error if not logged in.
 */
export async function ensureAuth(): Promise<void> {
  try {
    // Try to restore session from stored tokens
    const user = await initAuthSession();

    if (user) {
      return; // Session restored successfully
    }

    // No valid session
    console.error('Not logged in. Run `tt login` to sign in.');
    process.exit(1);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication check failed';
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}
