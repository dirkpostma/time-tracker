/**
 * Auth integration tests.
 *
 * These tests require real Supabase credentials and a test user.
 * Set the following environment variables:
 *   TEST_USER_EMAIL - Email of test user
 *   TEST_USER_PASSWORD - Password of test user
 *
 * To create a test user in Supabase:
 * 1. Go to Supabase Dashboard > Authentication > Users
 * 2. Click "Add user" > "Create new user"
 * 3. Enter email and password
 * 4. IMPORTANT: Disable "Confirm email" in Auth settings, or confirm the email
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { signIn, signOut, getCurrentUser, initAuthSession } from '@time-tracker/repositories/supabase/auth';
import { getAuthTokens, clearAuthTokens } from '@time-tracker/repositories/supabase/config';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

describe('auth integration', () => {
  beforeAll(() => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      throw new Error(
        'Missing test credentials. Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables.'
      );
    }
  });

  beforeEach(async () => {
    // Clear any existing auth tokens before each test
    clearAuthTokens();
    // Also sign out from Supabase to reset state
    await signOut();
  });

  afterAll(async () => {
    // Clean up - sign out after all tests
    await signOut();
  });

  it('signs in with valid credentials', async () => {
    const user = await signIn(TEST_EMAIL!, TEST_PASSWORD!);

    expect(user).toBeDefined();
    expect(user.email).toBe(TEST_EMAIL);
    expect(user.id).toBeDefined();
  });

  it('saves auth tokens after sign in', async () => {
    await signIn(TEST_EMAIL!, TEST_PASSWORD!);

    const tokens = getAuthTokens();
    expect(tokens).not.toBeNull();
    expect(tokens?.accessToken).toBeDefined();
    expect(tokens?.refreshToken).toBeDefined();
    expect(tokens?.expiresAt).toBeGreaterThan(0);
  });

  it('getCurrentUser returns user after sign in', async () => {
    await signIn(TEST_EMAIL!, TEST_PASSWORD!);

    const user = await getCurrentUser();
    expect(user).not.toBeNull();
    expect(user?.email).toBe(TEST_EMAIL);
  });

  it('initAuthSession restores session from stored tokens', async () => {
    // First sign in to get tokens
    await signIn(TEST_EMAIL!, TEST_PASSWORD!);
    const tokens = getAuthTokens();
    expect(tokens).not.toBeNull();

    // Verify initAuthSession works with valid stored tokens
    // (tokens are still valid, just testing the restore mechanism)
    const user = await initAuthSession();
    expect(user).not.toBeNull();
    expect(user?.email).toBe(TEST_EMAIL);
  });

  it('signOut clears tokens and session', async () => {
    await signIn(TEST_EMAIL!, TEST_PASSWORD!);
    expect(getAuthTokens()).not.toBeNull();

    await signOut();

    expect(getAuthTokens()).toBeNull();
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('throws error for invalid credentials', async () => {
    await expect(signIn(TEST_EMAIL!, 'wrongpassword')).rejects.toThrow();
  });

  it('throws error for non-existent user', async () => {
    await expect(signIn('nonexistent@example.com', 'anypassword')).rejects.toThrow();
  });
});
