import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseClientRepository } from './client.js';
import { RepositoryError } from '../types.js';
import type { Client } from '@time-tracker/core';

// Mock the Supabase client module
vi.mock('./connection.js', () => ({
  getSupabaseClient: vi.fn(),
}));

import { getSupabaseClient } from './connection.js';

describe('SupabaseClientRepository', () => {
  let repository: SupabaseClientRepository;
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  function createMockSupabase() {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
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
    it('should create a new client', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: mockClient,
        error: null,
      });

      const result = await repository.create({ name: 'Test Client' });

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Client');
      expect(result.id).toBe('client-123');
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('clients');
    });

    it('should store client in database', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: mockClient,
        error: null,
      });

      const result = await repository.create({ name: 'Test Client' });

      expect(mockSupabase._chain.insert).toHaveBeenCalledWith({ name: 'Test Client' });
      expect(mockSupabase._chain.select).toHaveBeenCalled();
      expect(result.name).toBe('Test Client');
    });

    it('should throw RepositoryError on failure', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: null,
        error: { message: 'Database constraint violation' },
      });

      await expect(repository.create({ name: 'Test' })).rejects.toThrow(RepositoryError);
      await expect(repository.create({ name: 'Test' })).rejects.toThrow('Failed to create client');
    });
  });

  describe('findById', () => {
    it('should return client when found', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: mockClient,
        error: null,
      });

      const found = await repository.findById('client-123');

      expect(found).toBeDefined();
      expect(found?.id).toBe('client-123');
      expect(found?.name).toBe('Test Client');
    });

    it('should return null when not found', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const found = await repository.findById('00000000-0000-0000-0000-000000000000');

      expect(found).toBeNull();
    });

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
    it('should return client when found by name', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: mockClient,
        error: null,
      });

      const found = await repository.findByName('Test Client');

      expect(found).toBeDefined();
      expect(found?.id).toBe('client-123');
      expect(found?.name).toBe('Test Client');
    });

    it('should return null when not found', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const found = await repository.findByName('Non Existent Client Name 12345');

      expect(found).toBeNull();
    });

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
    it('should return array of clients', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: [mockClient],
        error: null,
      });

      const clients = await repository.findAll();

      expect(Array.isArray(clients)).toBe(true);
    });

    it('should include created client in results', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: [mockClient],
        error: null,
      });

      const clients = await repository.findAll();
      const found = clients.find((c) => c.id === 'client-123');

      expect(found).toBeDefined();
      expect(found?.name).toBe('Test Client');
    });

    it('should return clients ordered by name', async () => {
      const clients = [
        { ...mockClient, id: '1', name: 'Alpha' },
        { ...mockClient, id: '2', name: 'Beta' },
        { ...mockClient, id: '3', name: 'Charlie' },
      ];
      mockSupabase._chain.order.mockResolvedValue({
        data: clients,
        error: null,
      });

      const result = await repository.findAll();

      expect(mockSupabase._chain.order).toHaveBeenCalledWith('name');
      expect(result.length).toBe(3);
    });

    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      await expect(repository.findAll()).rejects.toThrow(RepositoryError);
      await expect(repository.findAll()).rejects.toThrow('Failed to list clients');
    });
  });
});
