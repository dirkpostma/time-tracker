import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getSupabaseClient } from './connection.js';
import { SupabaseProjectRepository } from './project.js';
import { RepositoryError } from '../types.js';
import type { Project } from '@time-tracker/core';

// Skip: These integration tests require Supabase authentication (RLS policies).
// Use project.mock.test.ts for unit tests with mocked Supabase client.
describe.skip('SupabaseProjectRepository', () => {
  const testClientName = `Test Client Repo ${Date.now()}`;
  const testProjectName = `Test Project Repo ${Date.now()}`;
  let testClientId: string;
  let repository: SupabaseProjectRepository;
  let createdProjectIds: string[] = [];

  beforeAll(async () => {
    const supabase = getSupabaseClient();
    // Create a test client first
    const { data: client, error } = await supabase
      .from('clients')
      .insert({ name: testClientName })
      .select()
      .single();

    if (error) throw error;
    testClientId = client.id;
    repository = new SupabaseProjectRepository();
  });

  afterAll(async () => {
    const supabase = getSupabaseClient();
    // Clean up created projects
    if (createdProjectIds.length > 0) {
      await supabase.from('projects').delete().in('id', createdProjectIds);
    }
    // Clean up test client
    await supabase.from('clients').delete().eq('name', testClientName);
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const result = await repository.create({
        name: testProjectName,
        client_id: testClientId,
      });

      createdProjectIds.push(result.id);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(testProjectName);
      expect(result.client_id).toBe(testClientId);
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should throw RepositoryError on invalid client_id', async () => {
      await expect(
        repository.create({
          name: 'Invalid Project',
          client_id: '00000000-0000-0000-0000-000000000000',
        })
      ).rejects.toThrow(RepositoryError);
    });
  });

  describe('findById', () => {
    let existingProject: Project;

    beforeAll(async () => {
      existingProject = await repository.create({
        name: `FindById Test ${Date.now()}`,
        client_id: testClientId,
      });
      createdProjectIds.push(existingProject.id);
    });

    it('should find project by id', async () => {
      const result = await repository.findById(existingProject.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(existingProject.id);
      expect(result?.name).toBe(existingProject.name);
    });

    it('should return null for non-existent id', async () => {
      const result = await repository.findById(
        '00000000-0000-0000-0000-000000000000'
      );
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    let existingProject: Project;

    beforeAll(async () => {
      existingProject = await repository.create({
        name: `FindByName Test ${Date.now()}`,
        client_id: testClientId,
      });
      createdProjectIds.push(existingProject.id);
    });

    it('should find project by name and client_id', async () => {
      const result = await repository.findByName(
        existingProject.name,
        testClientId
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(existingProject.id);
      expect(result?.name).toBe(existingProject.name);
    });

    it('should return null for non-existent name', async () => {
      const result = await repository.findByName(
        'Non Existent Project',
        testClientId
      );
      expect(result).toBeNull();
    });

    it('should return null when name exists but in different client', async () => {
      const result = await repository.findByName(
        existingProject.name,
        '00000000-0000-0000-0000-000000000000'
      );
      expect(result).toBeNull();
    });
  });

  describe('findByClientId', () => {
    let projectsInClient: Project[];

    beforeAll(async () => {
      projectsInClient = [];
      for (let i = 0; i < 2; i++) {
        const project = await repository.create({
          name: `ByClientId Test ${Date.now()}-${i}`,
          client_id: testClientId,
        });
        projectsInClient.push(project);
        createdProjectIds.push(project.id);
      }
    });

    it('should find all projects by client_id', async () => {
      const result = await repository.findByClientId(testClientId);

      expect(Array.isArray(result)).toBe(true);
      // Should contain at least our test projects
      for (const project of projectsInClient) {
        const found = result.find((p) => p.id === project.id);
        expect(found).toBeDefined();
      }
    });

    it('should return empty array for client with no projects', async () => {
      const result = await repository.findByClientId(
        '00000000-0000-0000-0000-000000000000'
      );
      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return all projects', async () => {
      const result = await repository.findAll();

      expect(Array.isArray(result)).toBe(true);
      // Should contain at least some projects from our tests
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
