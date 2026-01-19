import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseTaskRepository, createTaskRepository } from './task.js';
import { RepositoryError } from '../types.js';
import type { Task } from '@time-tracker/core';

// Mock the Supabase client module
vi.mock('./connection.js', () => ({
  getSupabaseClient: vi.fn(),
}));

import { getSupabaseClient } from './connection.js';

describe('SupabaseTaskRepository (mocked)', () => {
  let repository: SupabaseTaskRepository;
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
    repository = new SupabaseTaskRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findById', () => {
    /** @spec repo.task.find-by-id-error */
    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database connection lost' },
      });

      await expect(repository.findById('task-123')).rejects.toThrow(RepositoryError);
      await expect(repository.findById('task-123')).rejects.toThrow('Failed to find task');
    });
  });

  describe('findByName', () => {
    /** @spec repo.task.find-by-name-error */
    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Query timeout' },
      });

      await expect(repository.findByName('Test Task', 'project-123')).rejects.toThrow(RepositoryError);
      await expect(repository.findByName('Test Task', 'project-123')).rejects.toThrow('Failed to find task by name');
    });
  });

  describe('findByProjectId', () => {
    /** @spec repo.task.find-by-project-error */
    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      await expect(repository.findByProjectId('project-123')).rejects.toThrow(RepositoryError);
      await expect(repository.findByProjectId('project-123')).rejects.toThrow('Failed to find tasks by project');
    });
  });

  describe('findAll', () => {
    /** @spec repo.task.find-all-error */
    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: null,
        error: { message: 'Database unavailable' },
      });

      await expect(repository.findAll()).rejects.toThrow(RepositoryError);
      await expect(repository.findAll()).rejects.toThrow('Failed to find all tasks');
    });
  });

  describe('createTaskRepository factory', () => {
    it('should return a SupabaseTaskRepository instance', () => {
      const repo = createTaskRepository();
      expect(repo).toBeInstanceOf(SupabaseTaskRepository);
    });
  });
});
