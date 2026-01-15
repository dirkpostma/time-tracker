import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateDuration,
  getTimerState,
  startTimer,
  stopTimer,
  type TimerState,
  type StartTimerRequest,
  type StartTimerResult,
  type StopTimerResult,
} from './timer.js';
import type { TimeEntryRepository } from '../repositories/types.js';
import type { TimeEntry, CreateTimeEntryInput } from './types.js';

// Mock repository factory
function createMockRepository(): TimeEntryRepository & {
  _setRunningEntry: (entry: TimeEntry | null) => void;
  _getCreatedEntries: () => TimeEntry[];
  _getStoppedIds: () => string[];
} {
  let runningEntry: TimeEntry | null = null;
  const createdEntries: TimeEntry[] = [];
  const stoppedIds: string[] = [];

  return {
    _setRunningEntry: (entry: TimeEntry | null) => {
      runningEntry = entry;
    },
    _getCreatedEntries: () => createdEntries,
    _getStoppedIds: () => stoppedIds,

    async create(input: CreateTimeEntryInput): Promise<TimeEntry> {
      const entry: TimeEntry = {
        id: `entry-${Date.now()}`,
        client_id: input.client_id,
        project_id: input.project_id ?? null,
        task_id: input.task_id ?? null,
        description: input.description ?? null,
        started_at: input.started_at ?? new Date().toISOString(),
        ended_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      createdEntries.push(entry);
      runningEntry = entry;
      return entry;
    },

    async update(id: string, input: { description?: string | null; ended_at?: string | null }): Promise<TimeEntry> {
      if (runningEntry && runningEntry.id === id) {
        const updated = { ...runningEntry, ...input, updated_at: new Date().toISOString() };
        if (input.ended_at) {
          runningEntry = null;
        }
        return updated;
      }
      throw new Error('Entry not found');
    },

    async findById(id: string): Promise<TimeEntry | null> {
      if (runningEntry && runningEntry.id === id) {
        return runningEntry;
      }
      return null;
    },

    async findRunning(): Promise<TimeEntry | null> {
      return runningEntry;
    },

    async findByDateRange(): Promise<TimeEntry[]> {
      return [];
    },

    async stop(id: string): Promise<TimeEntry> {
      if (runningEntry && runningEntry.id === id) {
        stoppedIds.push(id);
        const stopped = { ...runningEntry, ended_at: new Date().toISOString() };
        runningEntry = null;
        return stopped;
      }
      throw new Error('Entry not found');
    },
  };
}

describe('timer core', () => {
  describe('calculateDuration', () => {
    it('should calculate duration in minutes between two dates', () => {
      const startedAt = new Date('2024-01-15T09:00:00.000Z');
      const endedAt = new Date('2024-01-15T10:30:00.000Z');

      const result = calculateDuration(startedAt, endedAt);

      expect(result).toBe(90); // 1.5 hours = 90 minutes
    });

    it('should calculate duration from start to now when endedAt is not provided', () => {
      const now = new Date();
      const startedAt = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago

      const result = calculateDuration(startedAt);

      // Allow for small time differences during test execution
      expect(result).toBeGreaterThanOrEqual(59);
      expect(result).toBeLessThanOrEqual(61);
    });

    it('should return 0 for same start and end time', () => {
      const time = new Date('2024-01-15T09:00:00.000Z');

      const result = calculateDuration(time, time);

      expect(result).toBe(0);
    });

    it('should handle fractional minutes by flooring', () => {
      const startedAt = new Date('2024-01-15T09:00:00.000Z');
      const endedAt = new Date('2024-01-15T09:01:30.000Z'); // 1.5 minutes

      const result = calculateDuration(startedAt, endedAt);

      expect(result).toBe(1); // Floor of 1.5
    });
  });

  describe('getTimerState', () => {
    let mockRepo: ReturnType<typeof createMockRepository>;

    beforeEach(() => {
      mockRepo = createMockRepository();
    });

    it('should return isRunning: false when no timer is running', async () => {
      const result = await getTimerState(mockRepo);

      expect(result).toEqual<TimerState>({
        isRunning: false,
        currentEntry: undefined,
        duration: undefined,
      });
    });

    it('should return isRunning: true with entry and duration when timer is running', async () => {
      const runningEntry: TimeEntry = {
        id: 'entry-123',
        client_id: 'client-456',
        project_id: null,
        task_id: null,
        description: 'Working on feature',
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        ended_at: null,
        created_at: '2024-01-15T09:00:00.000Z',
        updated_at: '2024-01-15T09:00:00.000Z',
      };
      mockRepo._setRunningEntry(runningEntry);

      const result = await getTimerState(mockRepo);

      expect(result.isRunning).toBe(true);
      expect(result.currentEntry).toEqual(runningEntry);
      expect(result.duration).toBeGreaterThanOrEqual(29);
      expect(result.duration).toBeLessThanOrEqual(31);
    });
  });

  describe('startTimer', () => {
    let mockRepo: ReturnType<typeof createMockRepository>;

    beforeEach(() => {
      mockRepo = createMockRepository();
    });

    it('should start a new timer when no timer is running', async () => {
      const request: StartTimerRequest = {
        clientId: 'client-123',
        projectId: 'project-456',
        description: 'Working on feature',
      };

      const result = await startTimer(mockRepo, request);

      expect(result.success).toBe(true);
      expect(result.entry).toBeDefined();
      expect(result.entry?.client_id).toBe('client-123');
      expect(result.entry?.project_id).toBe('project-456');
      expect(result.entry?.description).toBe('Working on feature');
      expect(result.entry?.ended_at).toBeNull();
      expect(result.stoppedEntry).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('should start a timer with only clientId (optional fields)', async () => {
      const request: StartTimerRequest = {
        clientId: 'client-123',
      };

      const result = await startTimer(mockRepo, request);

      expect(result.success).toBe(true);
      expect(result.entry?.client_id).toBe('client-123');
      expect(result.entry?.project_id).toBeNull();
      expect(result.entry?.task_id).toBeNull();
      expect(result.entry?.description).toBeNull();
    });

    it('should return error when timer is already running and force is not set', async () => {
      const existingEntry: TimeEntry = {
        id: 'existing-entry',
        client_id: 'client-old',
        project_id: null,
        task_id: null,
        description: 'Existing work',
        started_at: new Date().toISOString(),
        ended_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockRepo._setRunningEntry(existingEntry);

      const request: StartTimerRequest = {
        clientId: 'client-new',
      };

      const result = await startTimer(mockRepo, request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Timer already running. Stop it first.');
      expect(result.entry).toBeUndefined();
    });

    it('should stop existing timer and start new one when force is true', async () => {
      const existingEntry: TimeEntry = {
        id: 'existing-entry',
        client_id: 'client-old',
        project_id: null,
        task_id: null,
        description: 'Existing work',
        started_at: new Date().toISOString(),
        ended_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockRepo._setRunningEntry(existingEntry);

      const request: StartTimerRequest = {
        clientId: 'client-new',
        description: 'New work',
      };

      const result = await startTimer(mockRepo, request, { force: true });

      expect(result.success).toBe(true);
      expect(result.entry).toBeDefined();
      expect(result.entry?.client_id).toBe('client-new');
      expect(result.stoppedEntry).toBeDefined();
      expect(result.stoppedEntry?.id).toBe('existing-entry');
      expect(result.stoppedEntry?.ended_at).toBeDefined();
      expect(mockRepo._getStoppedIds()).toContain('existing-entry');
    });

    it('should include taskId when provided', async () => {
      const request: StartTimerRequest = {
        clientId: 'client-123',
        projectId: 'project-456',
        taskId: 'task-789',
        description: 'Working on specific task',
      };

      const result = await startTimer(mockRepo, request);

      expect(result.success).toBe(true);
      expect(result.entry?.task_id).toBe('task-789');
    });
  });

  describe('stopTimer', () => {
    let mockRepo: ReturnType<typeof createMockRepository>;

    beforeEach(() => {
      mockRepo = createMockRepository();
    });

    it('should return error when no timer is running', async () => {
      const result = await stopTimer(mockRepo);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No timer running');
      expect(result.entry).toBeUndefined();
    });

    it('should stop the running timer and return the stopped entry', async () => {
      const runningEntry: TimeEntry = {
        id: 'entry-123',
        client_id: 'client-456',
        project_id: null,
        task_id: null,
        description: 'Working on feature',
        started_at: new Date().toISOString(),
        ended_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockRepo._setRunningEntry(runningEntry);

      const result = await stopTimer(mockRepo);

      expect(result.success).toBe(true);
      expect(result.entry).toBeDefined();
      expect(result.entry?.id).toBe('entry-123');
      expect(result.entry?.ended_at).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should set ended_at timestamp when stopping', async () => {
      const startTime = new Date(Date.now() - 60 * 1000).toISOString(); // 1 minute ago
      const runningEntry: TimeEntry = {
        id: 'entry-123',
        client_id: 'client-456',
        project_id: null,
        task_id: null,
        description: 'Working on feature',
        started_at: startTime,
        ended_at: null,
        created_at: startTime,
        updated_at: startTime,
      };
      mockRepo._setRunningEntry(runningEntry);

      const beforeStop = new Date();
      const result = await stopTimer(mockRepo);
      const afterStop = new Date();

      expect(result.success).toBe(true);
      expect(result.entry?.ended_at).toBeDefined();

      const endedAt = new Date(result.entry!.ended_at!);
      expect(endedAt.getTime()).toBeGreaterThanOrEqual(beforeStop.getTime());
      expect(endedAt.getTime()).toBeLessThanOrEqual(afterStop.getTime());
    });
  });
});
