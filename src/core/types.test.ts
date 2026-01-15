import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  Client,
  Project,
  Task,
  TimeEntry,
  TimeEntryWithRelations,
} from './types.js';

describe('core types', () => {
  describe('Client type', () => {
    it('should have required fields', () => {
      const client: Client = {
        id: 'uuid-1',
        name: 'Test Client',
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      };

      expect(client.id).toBe('uuid-1');
      expect(client.name).toBe('Test Client');
      expect(client.created_at).toBe('2026-01-15T10:00:00Z');
      expect(client.updated_at).toBe('2026-01-15T10:00:00Z');
    });

    it('should enforce string types', () => {
      expectTypeOf<Client['id']>().toBeString();
      expectTypeOf<Client['name']>().toBeString();
      expectTypeOf<Client['created_at']>().toBeString();
      expectTypeOf<Client['updated_at']>().toBeString();
    });
  });

  describe('Project type', () => {
    it('should have required fields including client_id', () => {
      const project: Project = {
        id: 'uuid-2',
        client_id: 'uuid-1',
        name: 'Test Project',
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      };

      expect(project.id).toBe('uuid-2');
      expect(project.client_id).toBe('uuid-1');
      expect(project.name).toBe('Test Project');
    });

    it('should enforce string types', () => {
      expectTypeOf<Project['id']>().toBeString();
      expectTypeOf<Project['client_id']>().toBeString();
      expectTypeOf<Project['name']>().toBeString();
      expectTypeOf<Project['created_at']>().toBeString();
      expectTypeOf<Project['updated_at']>().toBeString();
    });
  });

  describe('Task type', () => {
    it('should have required fields including project_id', () => {
      const task: Task = {
        id: 'uuid-3',
        project_id: 'uuid-2',
        name: 'Test Task',
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      };

      expect(task.id).toBe('uuid-3');
      expect(task.project_id).toBe('uuid-2');
      expect(task.name).toBe('Test Task');
    });

    it('should enforce string types', () => {
      expectTypeOf<Task['id']>().toBeString();
      expectTypeOf<Task['project_id']>().toBeString();
      expectTypeOf<Task['name']>().toBeString();
      expectTypeOf<Task['created_at']>().toBeString();
      expectTypeOf<Task['updated_at']>().toBeString();
    });
  });

  describe('TimeEntry type', () => {
    it('should have required fields with client_id required', () => {
      const entry: TimeEntry = {
        id: 'uuid-4',
        client_id: 'uuid-1',
        project_id: null,
        task_id: null,
        description: null,
        started_at: '2026-01-15T10:00:00Z',
        ended_at: null,
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      };

      expect(entry.id).toBe('uuid-4');
      expect(entry.client_id).toBe('uuid-1');
      expect(entry.project_id).toBeNull();
      expect(entry.task_id).toBeNull();
      expect(entry.description).toBeNull();
      expect(entry.started_at).toBe('2026-01-15T10:00:00Z');
      expect(entry.ended_at).toBeNull();
    });

    it('should allow optional fields to have values', () => {
      const entry: TimeEntry = {
        id: 'uuid-4',
        client_id: 'uuid-1',
        project_id: 'uuid-2',
        task_id: 'uuid-3',
        description: 'Working on feature',
        started_at: '2026-01-15T10:00:00Z',
        ended_at: '2026-01-15T11:00:00Z',
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T11:00:00Z',
      };

      expect(entry.project_id).toBe('uuid-2');
      expect(entry.task_id).toBe('uuid-3');
      expect(entry.description).toBe('Working on feature');
      expect(entry.ended_at).toBe('2026-01-15T11:00:00Z');
    });

    it('should enforce correct types for nullable fields', () => {
      expectTypeOf<TimeEntry['id']>().toBeString();
      expectTypeOf<TimeEntry['client_id']>().toBeString();
      expectTypeOf<TimeEntry['project_id']>().toEqualTypeOf<string | null>();
      expectTypeOf<TimeEntry['task_id']>().toEqualTypeOf<string | null>();
      expectTypeOf<TimeEntry['description']>().toEqualTypeOf<string | null>();
      expectTypeOf<TimeEntry['started_at']>().toBeString();
      expectTypeOf<TimeEntry['ended_at']>().toEqualTypeOf<string | null>();
    });
  });

  describe('TimeEntryWithRelations type', () => {
    it('should include entry with related entities', () => {
      const client: Client = {
        id: 'uuid-1',
        name: 'Test Client',
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      };

      const project: Project = {
        id: 'uuid-2',
        client_id: 'uuid-1',
        name: 'Test Project',
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      };

      const task: Task = {
        id: 'uuid-3',
        project_id: 'uuid-2',
        name: 'Test Task',
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      };

      const entry: TimeEntry = {
        id: 'uuid-4',
        client_id: 'uuid-1',
        project_id: 'uuid-2',
        task_id: 'uuid-3',
        description: 'Working on feature',
        started_at: '2026-01-15T10:00:00Z',
        ended_at: null,
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      };

      const entryWithRelations: TimeEntryWithRelations = {
        entry,
        client,
        project,
        task,
      };

      expect(entryWithRelations.entry).toBe(entry);
      expect(entryWithRelations.client).toBe(client);
      expect(entryWithRelations.project).toBe(project);
      expect(entryWithRelations.task).toBe(task);
    });

    it('should allow project and task to be null', () => {
      const client: Client = {
        id: 'uuid-1',
        name: 'Test Client',
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      };

      const entry: TimeEntry = {
        id: 'uuid-4',
        client_id: 'uuid-1',
        project_id: null,
        task_id: null,
        description: null,
        started_at: '2026-01-15T10:00:00Z',
        ended_at: null,
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      };

      const entryWithRelations: TimeEntryWithRelations = {
        entry,
        client,
        project: null,
        task: null,
      };

      expect(entryWithRelations.project).toBeNull();
      expect(entryWithRelations.task).toBeNull();
    });

    it('should enforce correct types', () => {
      expectTypeOf<TimeEntryWithRelations['entry']>().toEqualTypeOf<TimeEntry>();
      expectTypeOf<TimeEntryWithRelations['client']>().toEqualTypeOf<Client>();
      expectTypeOf<TimeEntryWithRelations['project']>().toEqualTypeOf<Project | null>();
      expectTypeOf<TimeEntryWithRelations['task']>().toEqualTypeOf<Task | null>();
    });
  });
});
