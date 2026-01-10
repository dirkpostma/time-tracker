import { describe, it, expect } from 'vitest';
import { getSupabaseClient } from './client.js';

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
