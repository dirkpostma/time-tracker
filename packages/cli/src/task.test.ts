import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getSupabaseClient } from '@time-tracker/repositories/supabase/connection';
import { addClient } from './client.js';
import { addProject } from './project.js';
import { addTask, listTasks, findProjectByName } from './task.js';

describe('task commands', () => {
  const testClientName = `Task Test Client ${Date.now()}`;
  const testProjectName = `Task Test Project ${Date.now()}`;
  const testTaskName = `Test Task ${Date.now()}`;
  let testClientId: string;
  let testProjectId: string;

  beforeAll(async () => {
    const client = await addClient(testClientName);
    testClientId = client.id;
    const project = await addProject(testProjectName, testClientId);
    testProjectId = project.id;
  });

  afterAll(async () => {
    const supabase = getSupabaseClient();
    await supabase.from('tasks').delete().eq('name', testTaskName);
    await supabase.from('projects').delete().eq('name', testProjectName);
    await supabase.from('clients').delete().eq('name', testClientName);
  });

  describe('findProjectByName', () => {
    /** @spec {entity.name-match.found} */
    it('should find project by name and client', async () => {
      const project = await findProjectByName(testProjectName, testClientId);
      expect(project).toBeDefined();
      expect(project?.name).toBe(testProjectName);
    });

    it('should return null for non-existent project', async () => {
      const project = await findProjectByName('Non Existent Project', testClientId);
      expect(project).toBeNull();
    });
  });

  describe('addTask', () => {
    it('should create a new task', async () => {
      const result = await addTask(testTaskName, testProjectId);

      expect(result).toBeDefined();
      expect(result.name).toBe(testTaskName);
      expect(result.project_id).toBe(testProjectId);
    });
  });

  describe('listTasks', () => {
    /** @spec {task.list.success} */
    it('should return tasks for a project', async () => {
      const tasks = await listTasks(testProjectId);
      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should include created task', async () => {
      const tasks = await listTasks(testProjectId);
      const found = tasks.find(t => t.name === testTaskName);
      expect(found).toBeDefined();
    });
  });
});
