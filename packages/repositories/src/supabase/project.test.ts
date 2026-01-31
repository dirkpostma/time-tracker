import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseProjectRepository } from './project.js';
import { RepositoryError } from '../types.js';
import type { Project } from '@time-tracker/core';

// Mock the Supabase client module
vi.mock('./connection.js', () => ({
  getSupabaseClient: vi.fn(),
}));

import { getSupabaseClient } from './connection.js';

describe('SupabaseProjectRepository', () => {
  let repository: SupabaseProjectRepository;
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  const mockClientId = 'client-123';

  function createMockSupabase() {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
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
    repository = new SupabaseProjectRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockProject: Project = {
    id: 'project-123',
    name: 'Test Project',
    client_id: mockClientId,
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  describe('create', () => {
    it('should create a new project', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: mockProject,
        error: null,
      });

      const result = await repository.create({
        name: 'Test Project',
        client_id: mockClientId,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Project');
      expect(result.client_id).toBe(mockClientId);
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should throw RepositoryError on invalid client_id', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: null,
        error: { message: 'Foreign key constraint violation' },
      });

      await expect(
        repository.create({
          name: 'Invalid Project',
          client_id: '00000000-0000-0000-0000-000000000000',
        })
      ).rejects.toThrow(RepositoryError);
    });
  });

  describe('findById', () => {
    it('should find project by id', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: mockProject,
        error: null,
      });

      const result = await repository.findById('project-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('project-123');
      expect(result?.name).toBe('Test Project');
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

      await expect(repository.findById('project-123')).rejects.toThrow(RepositoryError);
      await expect(repository.findById('project-123')).rejects.toThrow('Failed to find project');
    });
  });

  describe('findByName', () => {
    it('should find project by name and client_id', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: mockProject,
        error: null,
      });

      const result = await repository.findByName('Test Project', mockClientId);

      expect(result).toBeDefined();
      expect(result?.id).toBe('project-123');
      expect(result?.name).toBe('Test Project');
    });

    it('should return null for non-existent name', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findByName('Non Existent Project', mockClientId);
      expect(result).toBeNull();
    });

    it('should return null when name exists but in different client', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findByName(
        mockProject.name,
        '00000000-0000-0000-0000-000000000000'
      );
      expect(result).toBeNull();
    });

    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Query timeout' },
      });

      await expect(repository.findByName('Test Project', mockClientId)).rejects.toThrow(RepositoryError);
      await expect(repository.findByName('Test Project', mockClientId)).rejects.toThrow('Failed to find project by name');
    });
  });

  describe('findByClientId', () => {
    it('should find all projects by client_id', async () => {
      const projectsInClient = [
        mockProject,
        { ...mockProject, id: 'project-456', name: 'Project 2' },
      ];
      mockSupabase._chain.order.mockResolvedValue({
        data: projectsInClient,
        error: null,
      });

      const result = await repository.findByClientId(mockClientId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('should return empty array for client with no projects', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByClientId('00000000-0000-0000-0000-000000000000');
      expect(result).toEqual([]);
    });

    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      await expect(repository.findByClientId(mockClientId)).rejects.toThrow(RepositoryError);
      await expect(repository.findByClientId(mockClientId)).rejects.toThrow('Failed to find projects by client');
    });
  });

  describe('findAll', () => {
    it('should return all projects', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: [mockProject],
        error: null,
      });

      const result = await repository.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: null,
        error: { message: 'Database unavailable' },
      });

      await expect(repository.findAll()).rejects.toThrow(RepositoryError);
      await expect(repository.findAll()).rejects.toThrow('Failed to list projects');
    });
  });
});
