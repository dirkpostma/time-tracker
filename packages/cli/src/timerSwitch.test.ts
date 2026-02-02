import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { TimeEntry, Client, Project, Task } from '@time-tracker/core';
import type { TimerStatus } from './timeEntry.js';

// Mock timeEntry module
vi.mock('./timeEntry.js', () => ({
  getStatus: vi.fn(),
  startTimer: vi.fn(),
}));

import { getStatus, startTimer } from './timeEntry.js';
import { handleTimerSwitch } from './timerSwitch.js';

describe('timerSwitch', () => {
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

  const mockTask: Task = {
    id: 'task-123',
    name: 'Test Task',
    project_id: 'project-123',
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  const mockTimeEntry: TimeEntry = {
    id: 'entry-123',
    client_id: 'client-123',
    project_id: 'project-123',
    task_id: 'task-123',
    description: null,
    started_at: new Date(Date.now() - 1000).toISOString(), // 1 second ago
    ended_at: null,
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  const mockRunningStatus: TimerStatus = {
    entry: mockTimeEntry,
    client: mockClient,
    project: mockProject,
    task: mockTask,
    duration: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStatus).mockResolvedValue(null);
    vi.mocked(startTimer).mockResolvedValue(mockTimeEntry);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('handleTimerSwitch', () => {
    it('should start timer when none is running', async () => {
      vi.mocked(getStatus).mockResolvedValue(null);

      const result = await handleTimerSwitch('client-123', 'project-123');

      expect(result.switched).toBe(false);
      expect(result.message).toBe('started');
      expect(result.stoppedTimer).toBeUndefined();
      expect(startTimer).toHaveBeenCalledWith('client-123', 'project-123', undefined, undefined);
    });

    /** @spec timer.switch.force-flag */
    it('should switch timer with force=true', async () => {
      vi.mocked(getStatus).mockResolvedValue(mockRunningStatus);

      const result = await handleTimerSwitch('client-123', undefined, undefined, undefined, {
        force: true,
      });

      expect(result.switched).toBe(true);
      expect(result.message).toBe('switched');
      expect(result.stoppedTimer).toBeDefined();
      expect(result.stoppedTimer?.client.id).toBe('client-123');
      expect(startTimer).toHaveBeenCalledWith('client-123', undefined, undefined, undefined, true);
    });

    /** @spec timer.switch.require-force */
    it('should return error when timer running and no force flag', async () => {
      vi.mocked(getStatus).mockResolvedValue(mockRunningStatus);

      const result = await handleTimerSwitch('client-123', undefined, undefined, undefined, {
        force: false,
      });

      expect(result.switched).toBe(false);
      expect(result.message).toBe('timer-running');
      expect(startTimer).not.toHaveBeenCalled();
    });

    /** @spec timer.switch.detect-running */
    it('should return stoppedTimer with client, project, task, and duration info', async () => {
      vi.mocked(getStatus).mockResolvedValue(mockRunningStatus);

      const result = await handleTimerSwitch('client-123', undefined, undefined, undefined, {
        force: true,
      });

      expect(result.stoppedTimer).toBeDefined();
      expect(result.stoppedTimer?.client.name).toBe('Test Client');
      expect(result.stoppedTimer?.project?.name).toBe('Test Project');
      expect(result.stoppedTimer?.task?.name).toBe('Test Task');
      expect(result.stoppedTimer?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should pass all parameters to startTimer', async () => {
      vi.mocked(getStatus).mockResolvedValue(null);

      await handleTimerSwitch('client-123', 'project-123', 'task-123', 'description', {
        force: false,
      });

      expect(startTimer).toHaveBeenCalledWith('client-123', 'project-123', 'task-123', 'description');
    });
  });
});
