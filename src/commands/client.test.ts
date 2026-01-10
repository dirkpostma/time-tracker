import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSupabaseClient } from '../db/client.js';
import { addClient, listClients } from './client.js';

describe('client commands', () => {
  const testClientName = `Test Client ${Date.now()}`;

  afterEach(async () => {
    // Clean up test data
    const client = getSupabaseClient();
    await client.from('clients').delete().eq('name', testClientName);
  });

  describe('addClient', () => {
    it('should create a new client', async () => {
      const result = await addClient(testClientName);

      expect(result).toBeDefined();
      expect(result.name).toBe(testClientName);
      expect(result.id).toBeDefined();
    });

    it('should store client in database', async () => {
      await addClient(testClientName);

      const client = getSupabaseClient();
      const { data } = await client
        .from('clients')
        .select('*')
        .eq('name', testClientName)
        .single();

      expect(data).toBeDefined();
      expect(data?.name).toBe(testClientName);
    });
  });

  describe('listClients', () => {
    it('should return empty array when no clients', async () => {
      const clients = await listClients();
      expect(Array.isArray(clients)).toBe(true);
    });

    it('should return created clients', async () => {
      await addClient(testClientName);

      const clients = await listClients();
      const found = clients.find(c => c.name === testClientName);

      expect(found).toBeDefined();
    });
  });
});
