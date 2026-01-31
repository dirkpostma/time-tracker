import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { TimeEntry, Client, Project, Task } from '@time-tracker/core';

// Use vi.hoisted() to create mocks that are available during mock hoisting
const { mockTimeEntryRepo, mockSupabaseChain, mockSupabase } = vi.hoisted(() => {
  const mockTimeEntryRepo = {
    findRunning: vi.fn(),
    create: vi.fn(),
    stop: vi.fn(),
    update: vi.fn(),
  };

  const mockSupabaseChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };

  const mockSupabase = {
    from: vi.fn().mockReturnValue(mockSupabaseChain),
  };

  return { mockTimeEntryRepo, mockSupabaseChain, mockSupabase };
});

// Mock the modules - the class must be defined inside the factory
vi.mock('@time-tracker/repositories/supabase/timeEntry', () => {
  return {
    SupabaseTimeEntryRepository: class {
      findRunning = mockTimeEntryRepo.findRunning;
      create = mockTimeEntryRepo.create;
      stop = mockTimeEntryRepo.stop;
      update = mockTimeEntryRepo.update;
    },
  };
});

vi.mock('@time-tracker/repositories/supabase/connection', () => ({
  getSupabaseClient: () => mockSupabase,
}));

import { startTimer, stopTimer, getRunningTimer, getStatus } from './timeEntry.js';

describe('time entry commands', () => {
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

  const mockTimeEntry: TimeEntry = {
    id: 'entry-123',
    client_id: 'client-123',
    project_id: 'project-123',
    task_id: null,
    description: null,
    started_at: new Date().toISOString(),
    ended_at: null,
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default state
    mockTimeEntryRepo.findRunning.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('startTimer', () => {
    /** @spec timer.start.success */
    it('should create a new time entry with client and project', async () => {
      mockTimeEntryRepo.create.mockResolvedValue(mockTimeEntry);

      const entry = await startTimer('client-123', 'project-123');

      expect(entry).toBeDefined();
      expect(entry.client_id).toBe('client-123');
      expect(entry.project_id).toBe('project-123');
      expect(entry.started_at).toBeDefined();
      expect(entry.ended_at).toBeNull();
    });

    it('should create a new time entry with only client (no project)', async () => {
      const entryWithoutProject = { ...mockTimeEntry, project_id: null };
      mockTimeEntryRepo.create.mockResolvedValue(entryWithoutProject);

      const entry = await startTimer('client-123');

      expect(entry).toBeDefined();
      expect(entry.client_id).toBe('client-123');
      expect(entry.project_id).toBeNull();
      expect(entry.started_at).toBeDefined();
      expect(entry.ended_at).toBeNull();
    });

    it('should create entry with optional task and description', async () => {
      const entryWithDescription = { ...mockTimeEntry, description: 'Working on feature' };
      mockTimeEntryRepo.create.mockResolvedValue(entryWithDescription);

      const entry = await startTimer('client-123', 'project-123', undefined, 'Working on feature');

      expect(entry.description).toBe('Working on feature');
    });

    /** @spec timer.start.client-missing */
    it('should throw when client does not exist', async () => {
      mockTimeEntryRepo.create.mockRejectedValue(new Error('Failed to create time entry'));

      await expect(startTimer('00000000-0000-0000-0000-000000000000')).rejects.toThrow('Failed to create time entry');
    });

    /** @spec timer.start.project-missing */
    it('should throw when project does not exist', async () => {
      mockTimeEntryRepo.create.mockRejectedValue(new Error('Failed to create time entry'));

      await expect(startTimer('client-123', '00000000-0000-0000-0000-000000000000')).rejects.toThrow('Failed to create time entry');
    });

    /** @spec timer.start.task-missing */
    it('should throw when task does not exist', async () => {
      mockTimeEntryRepo.create.mockRejectedValue(new Error('Failed to create time entry'));

      await expect(startTimer('client-123', 'project-123', '00000000-0000-0000-0000-000000000000')).rejects.toThrow('Failed to create time entry');
    });

    /** @spec timer.start.running-exists */
    it('should throw if timer already running and force is false', async () => {
      mockTimeEntryRepo.findRunning.mockResolvedValue(mockTimeEntry);

      await expect(startTimer('client-123')).rejects.toThrow('Timer already running');
    });

    it('should stop current timer and start new one when force is true', async () => {
      const firstEntry = { ...mockTimeEntry, id: 'first-entry' };
      const secondEntry = { ...mockTimeEntry, id: 'second-entry' };

      mockTimeEntryRepo.findRunning
        .mockResolvedValueOnce(firstEntry)  // First call: running timer found
        .mockResolvedValueOnce(null);       // After stop, no running timer
      mockTimeEntryRepo.stop.mockResolvedValue({ ...firstEntry, ended_at: new Date().toISOString() });
      mockTimeEntryRepo.create.mockResolvedValue(secondEntry);

      const entry = await startTimer('client-123', undefined, undefined, undefined, true);

      expect(entry.id).not.toBe(firstEntry.id);
      expect(mockTimeEntryRepo.stop).toHaveBeenCalledWith('first-entry');
    });
  });

  describe('getRunningTimer', () => {
    it('should return null when no timer running', async () => {
      mockTimeEntryRepo.findRunning.mockResolvedValue(null);

      const timer = await getRunningTimer();

      expect(timer).toBeNull();
    });

    it('should return running timer', async () => {
      mockTimeEntryRepo.findRunning.mockResolvedValue(mockTimeEntry);

      const timer = await getRunningTimer();

      expect(timer).toBeDefined();
      expect(timer?.ended_at).toBeNull();
    });
  });

  describe('stopTimer', () => {
    /** @spec timer.stop.success */
    it('should stop running timer', async () => {
      const stoppedEntry = { ...mockTimeEntry, ended_at: new Date().toISOString() };
      mockTimeEntryRepo.findRunning.mockResolvedValue(mockTimeEntry);
      mockTimeEntryRepo.stop.mockResolvedValue(stoppedEntry);

      const entry = await stopTimer();

      expect(entry).toBeDefined();
      expect(entry.ended_at).toBeDefined();
    });

    /** @spec timer.stop.no-running */
    it('should throw if no timer running', async () => {
      mockTimeEntryRepo.findRunning.mockResolvedValue(null);

      await expect(stopTimer()).rejects.toThrow('No timer running');
    });

    it('should add description when stopping', async () => {
      const stoppedEntry = { ...mockTimeEntry, description: 'Finished the task', ended_at: new Date().toISOString() };
      mockTimeEntryRepo.findRunning.mockResolvedValue(mockTimeEntry);
      mockTimeEntryRepo.update.mockResolvedValue(stoppedEntry);

      const entry = await stopTimer('Finished the task');

      expect(entry.description).toBe('Finished the task');
    });

    /** @spec timer.stop.desc-exists */
    it('should overwrite existing description when new description provided', async () => {
      const runningWithDescription = { ...mockTimeEntry, description: 'Original description' };
      const stoppedEntry = { ...runningWithDescription, description: 'New description', ended_at: new Date().toISOString() };

      mockTimeEntryRepo.findRunning.mockResolvedValue(runningWithDescription);
      mockTimeEntryRepo.update.mockResolvedValue(stoppedEntry);

      const entry = await stopTimer('New description');

      expect(entry.description).toBe('New description');
    });

    it('should preserve existing description when stopping without new description', async () => {
      const runningWithDescription = { ...mockTimeEntry, description: 'Original description' };
      const stoppedEntry = { ...runningWithDescription, ended_at: new Date().toISOString() };

      mockTimeEntryRepo.findRunning.mockResolvedValue(runningWithDescription);
      mockTimeEntryRepo.stop.mockResolvedValue(stoppedEntry);

      const entry = await stopTimer();

      expect(entry.description).toBe('Original description');
    });
  });

  describe('getStatus', () => {
    /** @spec timer.status.not-running */
    it('should return null when no timer running', async () => {
      mockTimeEntryRepo.findRunning.mockResolvedValue(null);

      const status = await getStatus();

      expect(status).toBeNull();
    });

    /** @spec timer.status.running */
    it('should return status with client and project info', async () => {
      mockTimeEntryRepo.findRunning.mockResolvedValue(mockTimeEntry);
      mockSupabaseChain.single
        .mockResolvedValueOnce({ data: mockClient, error: null })  // Client query
        .mockResolvedValueOnce({ data: mockProject, error: null }); // Project query

      const status = await getStatus();

      expect(status).toBeDefined();
      expect(status?.client.name).toBe('Test Client');
      expect(status?.project?.name).toBe('Test Project');
      expect(status?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should return status with only client (no project)', async () => {
      const entryWithoutProject = { ...mockTimeEntry, project_id: null };
      mockTimeEntryRepo.findRunning.mockResolvedValue(entryWithoutProject);
      mockSupabaseChain.single.mockResolvedValueOnce({ data: mockClient, error: null });

      const status = await getStatus();

      expect(status).toBeDefined();
      expect(status?.client.name).toBe('Test Client');
      expect(status?.project).toBeNull();
      expect(status?.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
