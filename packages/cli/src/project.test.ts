import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Client, Project } from '@time-tracker/core';

// Mock the repositories
vi.mock('@time-tracker/repositories/supabase/client', () => ({
  createClientRepository: vi.fn(),
}));

vi.mock('@time-tracker/repositories/supabase/project', () => ({
  createProjectRepository: vi.fn(),
}));

import { createClientRepository } from '@time-tracker/repositories/supabase/client';
import { createProjectRepository } from '@time-tracker/repositories/supabase/project';
import { addProject, listProjects, findClientByName } from './project.js';

describe('project commands', () => {
  const mockClient: Client = {
    id: 'client-123',
    name: 'Test Client',
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  const mockProject: Project = {
    id: 'project-123',
    name: 'Test Project',
    client_id: 'client-123',
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  let mockClientRepository: {
    findByName: ReturnType<typeof vi.fn>;
  };

  let mockProjectRepository: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findByClientId: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClientRepository = {
      findByName: vi.fn(),
    };
    mockProjectRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findByClientId: vi.fn(),
    };
    vi.mocked(createClientRepository).mockReturnValue(mockClientRepository as any);
    vi.mocked(createProjectRepository).mockReturnValue(mockProjectRepository as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findClientByName', () => {
    /** @spec {entity.name-match.found} */
    it('should find client by name', async () => {
      mockClientRepository.findByName.mockResolvedValue(mockClient);

      const client = await findClientByName('Test Client');

      expect(client).toBeDefined();
      expect(client?.name).toBe('Test Client');
    });

    it('should return null for non-existent client', async () => {
      mockClientRepository.findByName.mockResolvedValue(null);

      const client = await findClientByName('Non Existent Client');

      expect(client).toBeNull();
    });
  });

  describe('addProject', () => {
    /** @spec project.add.success */
    it('should create a new project', async () => {
      mockProjectRepository.create.mockResolvedValue(mockProject);

      const result = await addProject('Test Project', 'client-123');

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Project');
      expect(result.client_id).toBe('client-123');
    });

    it('should store project in database', async () => {
      mockProjectRepository.create.mockResolvedValue(mockProject);

      await addProject('Test Project', 'client-123');

      expect(mockProjectRepository.create).toHaveBeenCalledWith({
        name: 'Test Project',
        client_id: 'client-123',
      });
    });

    it('should throw when repository fails', async () => {
      mockProjectRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(addProject('Test Project', 'client-123')).rejects.toThrow('Database error');
    });
  });

  describe('listProjects', () => {
    /** @spec project.list.success */
    it('should return projects', async () => {
      mockProjectRepository.findAll.mockResolvedValue([mockProject]);

      const projects = await listProjects();

      expect(Array.isArray(projects)).toBe(true);
    });

    it('should include created project', async () => {
      mockProjectRepository.findAll.mockResolvedValue([mockProject]);

      const projects = await listProjects();
      const found = projects.find(p => p.name === 'Test Project');

      expect(found).toBeDefined();
    });

    it('should return empty array when no projects', async () => {
      mockProjectRepository.findAll.mockResolvedValue([]);

      const projects = await listProjects();

      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBe(0);
    });
  });
});
