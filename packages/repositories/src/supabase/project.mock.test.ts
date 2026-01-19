import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseProjectRepository, createProjectRepository } from './project.js';
import { RepositoryError } from '../types.js';
import type { Project } from '@time-tracker/core';

// Mock the Supabase client module
vi.mock('./connection.js', () => ({
  getSupabaseClient: vi.fn(),
}));

import { getSupabaseClient } from './connection.js';

describe('SupabaseProjectRepository (mocked)', () => {
  let repository: SupabaseProjectRepository;
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  function createMockSupabase() {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
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
    repository = new SupabaseProjectRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findById', () => {
    /** @spec repo.project.find-by-id-error */
    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database connection lost' },
      });

      await expect(repository.findById('project-123')).rejects.toThrow(RepositoryError);
      await expect(repository.findById('project-123')).rejects.toThrow('Failed to find project');
    });
  });

  describe('findByName', () => {
    /** @spec repo.project.find-by-name-error */
    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Query timeout' },
      });

      await expect(repository.findByName('Test Project', 'client-123')).rejects.toThrow(RepositoryError);
      await expect(repository.findByName('Test Project', 'client-123')).rejects.toThrow('Failed to find project by name');
    });
  });

  describe('findByClientId', () => {
    /** @spec repo.project.find-by-client-error */
    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      await expect(repository.findByClientId('client-123')).rejects.toThrow(RepositoryError);
      await expect(repository.findByClientId('client-123')).rejects.toThrow('Failed to find projects by client');
    });
  });

  describe('findAll', () => {
    /** @spec repo.project.find-all-error */
    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: null,
        error: { message: 'Database unavailable' },
      });

      await expect(repository.findAll()).rejects.toThrow(RepositoryError);
      await expect(repository.findAll()).rejects.toThrow('Failed to list projects');
    });
  });

  describe('createProjectRepository factory', () => {
    it('should return a SupabaseProjectRepository instance', () => {
      const repo = createProjectRepository();
      expect(repo).toBeInstanceOf(SupabaseProjectRepository);
    });
  });
});
