import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseTaskRepository } from './task.js';
import { RepositoryError } from '../types.js';
import type { Task } from '@time-tracker/core';

// Mock the Supabase client module
vi.mock('./connection.js', () => ({
  getSupabaseClient: vi.fn(),
}));

import { getSupabaseClient } from './connection.js';

describe('SupabaseTaskRepository', () => {
  let repository: SupabaseTaskRepository;
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  const mockProjectId = 'project-123';

  function createMockSupabase() {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
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

  const mockTask: Task = {
    id: 'task-123',
    name: 'Test Task',
    project_id: mockProjectId,
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  describe('create', () => {
    it('should create a new task', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: mockTask,
        error: null,
      });

      const result = await repository.create({
        name: 'Test Task',
        project_id: mockProjectId,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Task');
      expect(result.project_id).toBe(mockProjectId);
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should throw RepositoryError on failure', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: null,
        error: { message: 'Foreign key constraint violation' },
      });

      await expect(
        repository.create({
          name: 'Test Task',
          project_id: 'invalid-uuid',
        })
      ).rejects.toThrow(RepositoryError);
    });
  });

  describe('findById', () => {
    it('should find task by id', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: mockTask,
        error: null,
      });

      const found = await repository.findById('task-123');

      expect(found).toBeDefined();
      expect(found?.id).toBe('task-123');
      expect(found?.name).toBe('Test Task');
    });

    it('should return null for non-existent id', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findById('00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });

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
    it('should find task by name and project', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: mockTask,
        error: null,
      });

      const found = await repository.findByName('Test Task', mockProjectId);

      expect(found).toBeDefined();
      expect(found?.name).toBe('Test Task');
      expect(found?.project_id).toBe(mockProjectId);
    });

    it('should return null for non-existent name', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findByName('Non Existent Task', mockProjectId);
      expect(result).toBeNull();
    });

    it('should return null if name exists in different project', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findByName('Test Task', '00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });

    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Query timeout' },
      });

      await expect(repository.findByName('Test Task', mockProjectId)).rejects.toThrow(RepositoryError);
      await expect(repository.findByName('Test Task', mockProjectId)).rejects.toThrow('Failed to find task by name');
    });
  });

  describe('findByProjectId', () => {
    it('should find all tasks for a project', async () => {
      const tasksInProject = [
        mockTask,
        { ...mockTask, id: 'task-456', name: 'Task 2' },
      ];
      mockSupabase._chain.order.mockResolvedValue({
        data: tasksInProject,
        error: null,
      });

      const tasks = await repository.findByProjectId(mockProjectId);

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThanOrEqual(2);
      expect(tasks.some(t => t.name === 'Test Task')).toBe(true);
      expect(tasks.some(t => t.name === 'Task 2')).toBe(true);
    });

    it('should return empty array for project with no tasks', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const tasks = await repository.findByProjectId('00000000-0000-0000-0000-000000000000');
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBe(0);
    });

    it('should order tasks by name', async () => {
      const tasks = [
        { ...mockTask, name: 'Alpha' },
        { ...mockTask, name: 'Beta' },
      ];
      mockSupabase._chain.order.mockResolvedValue({
        data: tasks,
        error: null,
      });

      await repository.findByProjectId(mockProjectId);

      expect(mockSupabase._chain.order).toHaveBeenCalledWith('name');
    });

    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      await expect(repository.findByProjectId(mockProjectId)).rejects.toThrow(RepositoryError);
      await expect(repository.findByProjectId(mockProjectId)).rejects.toThrow('Failed to find tasks by project');
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: [mockTask, { ...mockTask, id: 'task-456', name: 'Task 2' }],
        error: null,
      });

      const tasks = await repository.findAll();

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThanOrEqual(2);
    });

    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: null,
        error: { message: 'Database unavailable' },
      });

      await expect(repository.findAll()).rejects.toThrow(RepositoryError);
      await expect(repository.findAll()).rejects.toThrow('Failed to find all tasks');
    });
  });
});
