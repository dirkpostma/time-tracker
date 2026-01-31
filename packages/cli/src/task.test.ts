import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Project, Task } from '@time-tracker/core';

// Mock the repositories - must be hoisted before imports
vi.mock('@time-tracker/repositories/supabase/task', () => {
  const mockTaskRepository = {
    create: vi.fn(),
    findByProjectId: vi.fn(),
    findByName: vi.fn(),
  };
  return {
    createTaskRepository: vi.fn(() => mockTaskRepository),
    SupabaseTaskRepository: vi.fn(),
    __mockTaskRepository: mockTaskRepository,
  };
});

vi.mock('@time-tracker/repositories/supabase/project', () => {
  const mockProjectRepository = {
    findByName: vi.fn(),
  };
  return {
    createProjectRepository: vi.fn(() => mockProjectRepository),
    __mockProjectRepository: mockProjectRepository,
  };
});

import { createTaskRepository } from '@time-tracker/repositories/supabase/task';
import { createProjectRepository } from '@time-tracker/repositories/supabase/project';
import { addTask, listTasks, findProjectByName, findTaskByName } from './task.js';

// Access the mock repositories via the factory return values
const getMockTaskRepo = () => (createTaskRepository as any)().__mockTaskRepository || createTaskRepository();
const getMockProjectRepo = () => (createProjectRepository as any)().__mockProjectRepository || createProjectRepository();

describe('task commands', () => {
  const mockProject: Project = {
    id: 'project-123',
    name: 'Test Project',
    client_id: 'client-123',
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  const mockTask: Task = {
    id: 'task-123',
    name: 'Test Task',
    project_id: 'project-123',
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  let mockTaskRepo: any;
  let mockProjectRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Get fresh references to the mock repos
    mockTaskRepo = createTaskRepository();
    mockProjectRepo = createProjectRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findProjectByName', () => {
    /** @spec {entity.name-match.found} */
    it('should find project by name and client', async () => {
      mockProjectRepo.findByName.mockResolvedValue(mockProject);

      const project = await findProjectByName('Test Project', 'client-123');

      expect(project).toBeDefined();
      expect(project?.name).toBe('Test Project');
    });

    it('should return null for non-existent project', async () => {
      mockProjectRepo.findByName.mockResolvedValue(null);

      const project = await findProjectByName('Non Existent Project', 'client-123');

      expect(project).toBeNull();
    });
  });

  describe('addTask', () => {
    it('should create a new task', async () => {
      mockTaskRepo.create.mockResolvedValue(mockTask);

      const result = await addTask('Test Task', 'project-123');

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Task');
      expect(result.project_id).toBe('project-123');
    });

    it('should call repository with correct params', async () => {
      mockTaskRepo.create.mockResolvedValue(mockTask);

      await addTask('Test Task', 'project-123');

      expect(mockTaskRepo.create).toHaveBeenCalledWith({
        name: 'Test Task',
        project_id: 'project-123',
      });
    });

    it('should throw when repository fails', async () => {
      mockTaskRepo.create.mockRejectedValue(new Error('Database error'));

      await expect(addTask('Test Task', 'project-123')).rejects.toThrow('Database error');
    });
  });

  describe('listTasks', () => {
    /** @spec {task.list.success} */
    it('should return tasks for a project', async () => {
      mockTaskRepo.findByProjectId.mockResolvedValue([mockTask]);

      const tasks = await listTasks('project-123');

      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should include created task', async () => {
      mockTaskRepo.findByProjectId.mockResolvedValue([mockTask]);

      const tasks = await listTasks('project-123');
      const found = tasks.find((t: Task) => t.name === 'Test Task');

      expect(found).toBeDefined();
    });

    it('should return empty array when no tasks', async () => {
      mockTaskRepo.findByProjectId.mockResolvedValue([]);

      const tasks = await listTasks('project-123');

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBe(0);
    });
  });

  describe('findTaskByName', () => {
    it('should find task by name and project', async () => {
      mockTaskRepo.findByName.mockResolvedValue(mockTask);

      const task = await findTaskByName('Test Task', 'project-123');

      expect(task).toBeDefined();
      expect(task?.name).toBe('Test Task');
    });

    it('should return null for non-existent task', async () => {
      mockTaskRepo.findByName.mockResolvedValue(null);

      const task = await findTaskByName('Non Existent Task', 'project-123');

      expect(task).toBeNull();
    });
  });
});
