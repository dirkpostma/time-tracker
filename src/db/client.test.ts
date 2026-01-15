import { describe, it, expect } from 'vitest';
import { getSupabaseClient, formatSupabaseError } from './client.js';

describe('Supabase client', () => {
  it('should create a client', () => {
    const client = getSupabaseClient();
    expect(client).toBeDefined();
  });

  it('should connect to database', async () => {
    const client = getSupabaseClient();
    const { error } = await client.from('clients').select('id').limit(1);
    expect(error).toBeNull();
  });
});

describe('formatSupabaseError', () => {
  it('formats fetch failed error with helpful message', () => {
    const result = formatSupabaseError('TypeError: fetch failed');
    expect(result).toContain('Could not connect to Supabase');
    expect(result).toContain('tt config');
  });

  it('formats ENOTFOUND error with helpful message', () => {
    const result = formatSupabaseError('getaddrinfo ENOTFOUND invalid.supabase.co');
    expect(result).toContain('Could not connect to Supabase');
  });

  it('formats invalid API key error with auth message', () => {
    const result = formatSupabaseError('Invalid API key');
    expect(result).toContain('authentication failed');
    expect(result).toContain('tt config');
  });

  it('formats 401 error with auth message', () => {
    const result = formatSupabaseError('Request failed with status 401');
    expect(result).toContain('authentication failed');
  });

  it('formats 403 error with auth message', () => {
    const result = formatSupabaseError('Request failed with status 403');
    expect(result).toContain('authentication failed');
  });

  it('passes through other errors unchanged', () => {
    const result = formatSupabaseError('Some other error');
    expect(result).toBe('Some other error');
  });

  it('handles Error objects', () => {
    const result = formatSupabaseError(new Error('fetch failed'));
    expect(result).toContain('Could not connect to Supabase');
  });
});
