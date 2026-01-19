import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseClientRepository, createClientRepository } from './client.js';
import { RepositoryError } from '../types.js';
import type { Client } from '@time-tracker/core';

// Mock the Supabase client module
vi.mock('./connection.js', () => ({
  getSupabaseClient: vi.fn(),
}));

import { getSupabaseClient } from './connection.js';

describe('SupabaseClientRepository (mocked)', () => {
  let repository: SupabaseClientRepository;
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  function createMockSupabase() {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn(),
    };

    return {
      from: vi.fn().mockReturnValue(mockChain),
      _chain: mockChain,
    };
  }

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof getSupabaseClient>);
    repository = new SupabaseClientRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockClient: Client = {
    id: 'client-123',
    name: 'Test Client',
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  describe('create', () => {
    /** @spec repo.client.create-error */
    it('should throw RepositoryError when creation fails', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: null,
        error: { message: 'Database constraint violation' },
      });

      await expect(repository.create({ name: 'Test' })).rejects.toThrow(RepositoryError);
      await expect(repository.create({ name: 'Test' })).rejects.toThrow('Failed to create client');
    });
  });

  describe('findById', () => {
    /** @spec repo.client.find-by-id-error */
    it('should throw RepositoryError when query fails with non-PGRST116 error', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Database connection lost' },
      });

      await expect(repository.findById('client-123')).rejects.toThrow(RepositoryError);
      await expect(repository.findById('client-123')).rejects.toThrow('Failed to find client by ID');
    });
  });

  describe('findByName', () => {
    /** @spec repo.client.find-by-name-error */
    it('should throw RepositoryError when query fails with non-PGRST116 error', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Query timeout' },
      });

      await expect(repository.findByName('Test Client')).rejects.toThrow(RepositoryError);
      await expect(repository.findByName('Test Client')).rejects.toThrow('Failed to find client by name');
    });
  });

  describe('findAll', () => {
    /** @spec repo.client.find-all-error */
    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      await expect(repository.findAll()).rejects.toThrow(RepositoryError);
      await expect(repository.findAll()).rejects.toThrow('Failed to list clients');
    });
  });

  describe('createClientRepository factory', () => {
    it('should return a SupabaseClientRepository instance', () => {
      const repo = createClientRepository();
      expect(repo).toBeInstanceOf(SupabaseClientRepository);
    });
  });
});
