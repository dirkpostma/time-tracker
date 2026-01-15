import { describe, it, expect } from 'vitest';
import {
  RepositoryError,
  type Repository,
  type ClientRepository,
  type ProjectRepository,
  type TaskRepository,
  type TimeEntryRepository,
} from './types.js';
import type {
  Client,
  Project,
  Task,
  TimeEntry,
  CreateClientInput,
  CreateProjectInput,
  CreateTaskInput,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
} from '../core/types.js';

describe('RepositoryError', () => {
  it('should be an instance of Error', () => {
    const error = new RepositoryError('Test error');
    expect(error).toBeInstanceOf(Error);
  });

  it('should store the message', () => {
    const error = new RepositoryError('Test error message');
    expect(error.message).toBe('Test error message');
  });

  it('should have name set to RepositoryError', () => {
    const error = new RepositoryError('Test error');
    expect(error.name).toBe('RepositoryError');
  });

  it('should store operation type', () => {
    const error = new RepositoryError('Test error', 'create');
    expect(error.operation).toBe('create');
  });

  it('should store entity type', () => {
    const error = new RepositoryError('Test error', 'create', 'client');
    expect(error.entity).toBe('client');
  });

  it('should store the original cause', () => {
    const cause = new Error('Original error');
    const error = new RepositoryError('Test error', 'create', 'client', cause);
    expect(error.cause).toBe(cause);
  });
});

describe('Repository interfaces', () => {
  describe('ClientRepository', () => {
    it('should define required methods', () => {
      // Type check: ensure ClientRepository has all required methods
      const mockRepo: ClientRepository = {
        create: async (_input: CreateClientInput): Promise<Client> => ({
          id: '1',
          name: 'Test',
          created_at: '',
          updated_at: '',
        }),
        findById: async (_id: string): Promise<Client | null> => null,
        findByName: async (_name: string): Promise<Client | null> => null,
        findAll: async (): Promise<Client[]> => [],
      };

      expect(mockRepo.create).toBeDefined();
      expect(mockRepo.findById).toBeDefined();
      expect(mockRepo.findByName).toBeDefined();
      expect(mockRepo.findAll).toBeDefined();
    });
  });

  describe('ProjectRepository', () => {
    it('should define required methods', () => {
      const mockRepo: ProjectRepository = {
        create: async (_input: CreateProjectInput): Promise<Project> => ({
          id: '1',
          client_id: '1',
          name: 'Test',
          created_at: '',
          updated_at: '',
        }),
        findById: async (_id: string): Promise<Project | null> => null,
        findByName: async (
          _name: string,
          _clientId: string
        ): Promise<Project | null> => null,
        findByClientId: async (_clientId: string): Promise<Project[]> => [],
        findAll: async (): Promise<Project[]> => [],
      };

      expect(mockRepo.create).toBeDefined();
      expect(mockRepo.findById).toBeDefined();
      expect(mockRepo.findByName).toBeDefined();
      expect(mockRepo.findByClientId).toBeDefined();
      expect(mockRepo.findAll).toBeDefined();
    });
  });

  describe('TaskRepository', () => {
    it('should define required methods', () => {
      const mockRepo: TaskRepository = {
        create: async (_input: CreateTaskInput): Promise<Task> => ({
          id: '1',
          project_id: '1',
          name: 'Test',
          created_at: '',
          updated_at: '',
        }),
        findById: async (_id: string): Promise<Task | null> => null,
        findByName: async (
          _name: string,
          _projectId: string
        ): Promise<Task | null> => null,
        findByProjectId: async (_projectId: string): Promise<Task[]> => [],
        findAll: async (): Promise<Task[]> => [],
      };

      expect(mockRepo.create).toBeDefined();
      expect(mockRepo.findById).toBeDefined();
      expect(mockRepo.findByName).toBeDefined();
      expect(mockRepo.findByProjectId).toBeDefined();
      expect(mockRepo.findAll).toBeDefined();
    });
  });

  describe('TimeEntryRepository', () => {
    it('should define required methods', () => {
      const mockTimeEntry: TimeEntry = {
        id: '1',
        client_id: '1',
        project_id: null,
        task_id: null,
        description: null,
        started_at: '',
        ended_at: null,
        created_at: '',
        updated_at: '',
      };

      const mockRepo: TimeEntryRepository = {
        create: async (_input: CreateTimeEntryInput): Promise<TimeEntry> =>
          mockTimeEntry,
        update: async (
          _id: string,
          _input: UpdateTimeEntryInput
        ): Promise<TimeEntry> => mockTimeEntry,
        findById: async (_id: string): Promise<TimeEntry | null> => null,
        findRunning: async (): Promise<TimeEntry | null> => null,
        findByDateRange: async (
          _startDate: Date,
          _endDate: Date
        ): Promise<TimeEntry[]> => [],
        stop: async (_id: string): Promise<TimeEntry> => mockTimeEntry,
      };

      expect(mockRepo.create).toBeDefined();
      expect(mockRepo.update).toBeDefined();
      expect(mockRepo.findById).toBeDefined();
      expect(mockRepo.findRunning).toBeDefined();
      expect(mockRepo.findByDateRange).toBeDefined();
      expect(mockRepo.stop).toBeDefined();
    });
  });

  describe('Repository<T> base interface', () => {
    it('should be usable as base for custom repositories', () => {
      interface CustomEntity {
        id: string;
        value: string;
      }

      interface CreateCustomInput {
        value: string;
      }

      // Verify Repository<T> can be used as a base
      const mockRepo: Repository<CustomEntity, CreateCustomInput> = {
        create: async (_input: CreateCustomInput): Promise<CustomEntity> => ({
          id: '1',
          value: 'test',
        }),
        findById: async (_id: string): Promise<CustomEntity | null> => null,
        findAll: async (): Promise<CustomEntity[]> => [],
      };

      expect(mockRepo.create).toBeDefined();
      expect(mockRepo.findById).toBeDefined();
      expect(mockRepo.findAll).toBeDefined();
    });
  });
});
