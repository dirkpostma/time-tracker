import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getSupabaseClient } from '../../db/client.js';
import { addClient } from './client.js';
import { addProject, listProjects, findClientByName } from './project.js';

describe('project commands', () => {
  const testClientName = `Test Client ${Date.now()}`;
  const testProjectName = `Test Project ${Date.now()}`;
  let testClientId: string;

  beforeAll(async () => {
    const client = await addClient(testClientName);
    testClientId = client.id;
  });

  afterAll(async () => {
    const supabase = getSupabaseClient();
    await supabase.from('projects').delete().eq('name', testProjectName);
    await supabase.from('clients').delete().eq('name', testClientName);
  });

  describe('findClientByName', () => {
    it('should find client by name', async () => {
      const client = await findClientByName(testClientName);
      expect(client).toBeDefined();
      expect(client?.name).toBe(testClientName);
    });

    it('should return null for non-existent client', async () => {
      const client = await findClientByName('Non Existent Client');
      expect(client).toBeNull();
    });
  });

  describe('addProject', () => {
    it('should create a new project', async () => {
      const result = await addProject(testProjectName, testClientId);

      expect(result).toBeDefined();
      expect(result.name).toBe(testProjectName);
      expect(result.client_id).toBe(testClientId);
    });

    it('should store project in database', async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('name', testProjectName)
        .single();

      expect(data).toBeDefined();
      expect(data?.name).toBe(testProjectName);
    });
  });

  describe('listProjects', () => {
    it('should return projects', async () => {
      const projects = await listProjects();
      expect(Array.isArray(projects)).toBe(true);
    });

    it('should include created project', async () => {
      const projects = await listProjects();
      const found = projects.find(p => p.name === testProjectName);
      expect(found).toBeDefined();
    });
  });
});
