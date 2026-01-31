import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Client } from '@time-tracker/core';

// Mock the repository
vi.mock('@time-tracker/repositories/supabase/client', () => ({
  createClientRepository: vi.fn(),
}));

import { createClientRepository } from '@time-tracker/repositories/supabase/client';
import { addClient, listClients } from './client.js';

describe('client commands', () => {
  const mockClient: Client = {
    id: 'client-123',
    name: 'Test Client',
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  let mockRepository: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
    };
    vi.mocked(createClientRepository).mockReturnValue(mockRepository as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('addClient', () => {
    /** @spec client.add.success */
    it('should create a new client', async () => {
      mockRepository.create.mockResolvedValue(mockClient);

      const result = await addClient('Test Client');

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Client');
      expect(result.id).toBeDefined();
    });

    it('should store client in database', async () => {
      mockRepository.create.mockResolvedValue(mockClient);

      await addClient('Test Client');

      expect(mockRepository.create).toHaveBeenCalledWith({ name: 'Test Client' });
    });

    it('should throw when repository fails', async () => {
      mockRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(addClient('Test Client')).rejects.toThrow('Database error');
    });
  });

  describe('listClients', () => {
    /** @spec client.list.success */
    it('should return empty array when no clients', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const clients = await listClients();
      expect(Array.isArray(clients)).toBe(true);
      expect(clients.length).toBe(0);
    });

    it('should return created clients', async () => {
      mockRepository.findAll.mockResolvedValue([mockClient]);

      const clients = await listClients();
      const found = clients.find(c => c.name === 'Test Client');

      expect(found).toBeDefined();
    });

    it('should return multiple clients', async () => {
      const clients = [
        mockClient,
        { ...mockClient, id: 'client-456', name: 'Another Client' },
      ];
      mockRepository.findAll.mockResolvedValue(clients);

      const result = await listClients();

      expect(result.length).toBe(2);
    });
  });
});
