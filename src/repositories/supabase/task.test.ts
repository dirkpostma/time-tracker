import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getSupabaseClient } from '../../db/client.js';
import { SupabaseTaskRepository } from './task.js';
import type { TaskRepository } from '../types.js';
import { RepositoryError } from '../types.js';

describe('SupabaseTaskRepository', () => {
  let repository: TaskRepository;
  let testClientId: string;
  let testProjectId: string;
  const testClientName = `TaskRepo Test Client ${Date.now()}`;
  const testProjectName = `TaskRepo Test Project ${Date.now()}`;
  const testTaskName = `TaskRepo Test Task ${Date.now()}`;
  const testTaskName2 = `TaskRepo Test Task 2 ${Date.now()}`;

  beforeAll(async () => {
    repository = new SupabaseTaskRepository();
    const supabase = getSupabaseClient();

    // Create test client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({ name: testClientName })
      .select()
      .single();

    if (clientError) throw clientError;
    testClientId = client.id;

    // Create test project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({ name: testProjectName, client_id: testClientId })
      .select()
      .single();

    if (projectError) throw projectError;
    testProjectId = project.id;
  });

  afterAll(async () => {
    const supabase = getSupabaseClient();
    // Clean up in reverse order of dependencies
    await supabase.from('tasks').delete().like('name', 'TaskRepo Test Task%');
    await supabase.from('projects').delete().eq('name', testProjectName);
    await supabase.from('clients').delete().eq('name', testClientName);
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const result = await repository.create({
        name: testTaskName,
        project_id: testProjectId,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(testTaskName);
      expect(result.project_id).toBe(testProjectId);
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should throw RepositoryError on failure', async () => {
      await expect(
        repository.create({
          name: testTaskName,
          project_id: 'invalid-uuid',
        })
      ).rejects.toThrow(RepositoryError);
    });
  });

  describe('findById', () => {
    it('should find task by id', async () => {
      const created = await repository.create({
        name: `FindById Test ${Date.now()}`,
        project_id: testProjectId,
      });

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(created.name);
    });

    it('should return null for non-existent id', async () => {
      const result = await repository.findById('00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should find task by name and project', async () => {
      const found = await repository.findByName(testTaskName, testProjectId);

      expect(found).toBeDefined();
      expect(found?.name).toBe(testTaskName);
      expect(found?.project_id).toBe(testProjectId);
    });

    it('should return null for non-existent name', async () => {
      const result = await repository.findByName('Non Existent Task', testProjectId);
      expect(result).toBeNull();
    });

    it('should return null if name exists in different project', async () => {
      const result = await repository.findByName(testTaskName, '00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });
  });

  describe('findByProjectId', () => {
    it('should find all tasks for a project', async () => {
      // Create another task for the same project
      await repository.create({
        name: testTaskName2,
        project_id: testProjectId,
      });

      const tasks = await repository.findByProjectId(testProjectId);

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThanOrEqual(2);
      expect(tasks.some(t => t.name === testTaskName)).toBe(true);
      expect(tasks.some(t => t.name === testTaskName2)).toBe(true);
    });

    it('should return empty array for project with no tasks', async () => {
      const tasks = await repository.findByProjectId('00000000-0000-0000-0000-000000000000');
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBe(0);
    });

    it('should order tasks by name', async () => {
      const tasks = await repository.findByProjectId(testProjectId);
      const names = tasks.map(t => t.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const tasks = await repository.findAll();

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThanOrEqual(2);
    });
  });
});
