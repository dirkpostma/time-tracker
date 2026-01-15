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
} from '@time-tracker/core';

describe('RepositoryError', () => {
  it('should be an instance of Error', () => {
    const error = new RepositoryError('Test error');
    expect(error).toBeInstanceOf(Error);
  });

  it('should store the message', () => {
    const error = new RepositoryError('Test error message');
    expect(error.message).toBe('Test error message');
  });

  it('should have name RepositoryError', () => {
    const error = new RepositoryError('Test');
    expect(error.name).toBe('RepositoryError');
  });

  it('should store operation and entity', () => {
    const error = new RepositoryError('Test', 'create', 'client');
    expect(error.operation).toBe('create');
    expect(error.entity).toBe('client');
  });

  it('should store cause', () => {
    const cause = new Error('Original error');
    const error = new RepositoryError('Wrapped', 'update', 'project', cause);
    expect(error.cause).toBe(cause);
  });
});

describe('Repository interfaces', () => {
  // Type-level tests to ensure interfaces are correctly defined

  it('Repository interface should have create, findById, and findAll methods', () => {
    // This is a compile-time check
    const mockRepo: Repository<Client, CreateClientInput> = {
      create: async (_input: CreateClientInput) => ({} as Client),
      findById: async (_id: string) => null,
      findAll: async () => [],
    };
    expect(mockRepo).toBeDefined();
  });

  it('ClientRepository should extend Repository with findByName', () => {
    const mockRepo: ClientRepository = {
      create: async (_input: CreateClientInput) => ({} as Client),
      findById: async (_id: string) => null,
      findAll: async () => [],
      findByName: async (_name: string) => null,
    };
    expect(mockRepo).toBeDefined();
  });

  it('ProjectRepository should have findByName and findByClientId', () => {
    const mockRepo: ProjectRepository = {
      create: async (_input: CreateProjectInput) => ({} as Project),
      findById: async (_id: string) => null,
      findAll: async () => [],
      findByName: async (_name: string, _clientId: string) => null,
      findByClientId: async (_clientId: string) => [],
    };
    expect(mockRepo).toBeDefined();
  });

  it('TaskRepository should have findByName and findByProjectId', () => {
    const mockRepo: TaskRepository = {
      create: async (_input: CreateTaskInput) => ({} as Task),
      findById: async (_id: string) => null,
      findAll: async () => [],
      findByName: async (_name: string, _projectId: string) => null,
      findByProjectId: async (_projectId: string) => [],
    };
    expect(mockRepo).toBeDefined();
  });

  it('TimeEntryRepository should have all required methods', () => {
    const mockRepo: TimeEntryRepository = {
      create: async (_input: CreateTimeEntryInput) => ({} as TimeEntry),
      update: async (_id: string, _input: UpdateTimeEntryInput) => ({} as TimeEntry),
      findById: async (_id: string) => null,
      findRunning: async () => null,
      findByDateRange: async (_start: Date, _end: Date) => [],
      stop: async (_id: string) => ({} as TimeEntry),
    };
    expect(mockRepo).toBeDefined();
  });
});
