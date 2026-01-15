import { describe, it, expect, afterEach } from 'vitest';
import { getSupabaseClient } from './connection.js';
import { SupabaseClientRepository } from './client.js';
import { RepositoryError } from '../types.js';

describe('SupabaseClientRepository', () => {
  const testClientName = `Test Client ${Date.now()}`;
  let createdClientIds: string[] = [];

  afterEach(async () => {
    // Clean up test data
    const client = getSupabaseClient();
    for (const id of createdClientIds) {
      await client.from('clients').delete().eq('id', id);
    }
    createdClientIds = [];
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const repo = new SupabaseClientRepository();
      const result = await repo.create({ name: testClientName });

      createdClientIds.push(result.id);

      expect(result).toBeDefined();
      expect(result.name).toBe(testClientName);
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should store client in database', async () => {
      const repo = new SupabaseClientRepository();
      const result = await repo.create({ name: testClientName });

      createdClientIds.push(result.id);

      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('id', result.id)
        .single();

      expect(data).toBeDefined();
      expect(data?.name).toBe(testClientName);
    });
  });

  describe('findById', () => {
    it('should return client when found', async () => {
      const repo = new SupabaseClientRepository();
      const created = await repo.create({ name: testClientName });
      createdClientIds.push(created.id);

      const found = await repo.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(testClientName);
    });

    it('should return null when not found', async () => {
      const repo = new SupabaseClientRepository();
      const found = await repo.findById('00000000-0000-0000-0000-000000000000');

      expect(found).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return client when found by name', async () => {
      const repo = new SupabaseClientRepository();
      const created = await repo.create({ name: testClientName });
      createdClientIds.push(created.id);

      const found = await repo.findByName(testClientName);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(testClientName);
    });

    it('should return null when not found', async () => {
      const repo = new SupabaseClientRepository();
      const found = await repo.findByName('Non Existent Client Name 12345');

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return array of clients', async () => {
      const repo = new SupabaseClientRepository();
      const clients = await repo.findAll();

      expect(Array.isArray(clients)).toBe(true);
    });

    it('should include created client in results', async () => {
      const repo = new SupabaseClientRepository();
      const created = await repo.create({ name: testClientName });
      createdClientIds.push(created.id);

      const clients = await repo.findAll();
      const found = clients.find((c) => c.id === created.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe(testClientName);
    });

    it('should return clients ordered by name', async () => {
      const repo = new SupabaseClientRepository();
      const clients = await repo.findAll();

      // Verify ordering if there are multiple clients
      if (clients.length >= 2) {
        const names = clients.map((c) => c.name);
        const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
        expect(names).toEqual(sortedNames);
      }
    });
  });
});
