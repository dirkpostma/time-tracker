import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Client, Project, Task, TimeEntry } from '@time-tracker/core';
import type { TimerStatus } from './timeEntry.js';

// Mock all dependencies
vi.mock('./client.js', () => ({
  listClients: vi.fn(),
  addClient: vi.fn(),
}));

vi.mock('./project.js', () => ({
  listProjectsByClient: vi.fn(),
  addProject: vi.fn(),
}));

vi.mock('./task.js', () => ({
  listTasks: vi.fn(),
  addTask: vi.fn(),
}));

vi.mock('./timeEntry.js', () => ({
  getStatus: vi.fn(),
  startTimer: vi.fn(),
  stopTimer: vi.fn(),
  getRunningTimer: vi.fn(),
}));

vi.mock('./recent.js', () => ({
  loadRecent: vi.fn(),
  saveRecent: vi.fn(),
}));

import { listClients, addClient } from './client.js';
import { listProjectsByClient, addProject } from './project.js';
import { listTasks, addTask } from './task.js';
import { getStatus, startTimer, stopTimer, getRunningTimer } from './timeEntry.js';
import { loadRecent, saveRecent } from './recent.js';
import { runInteractiveMode, formatDuration, formatTimerInfo } from './interactive.js';

describe('interactive mode', () => {
  const mockClient: Client = {
    id: 'client-123',
    name: 'Test Client',
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  const mockClient2: Client = {
    id: 'client-456',
    name: 'Test Client 2',
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
    started_at: new Date().toISOString(),
    ended_at: null,
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    vi.mocked(listClients).mockResolvedValue([mockClient, mockClient2]);
    vi.mocked(listProjectsByClient).mockResolvedValue([mockProject]);
    vi.mocked(listTasks).mockResolvedValue([mockTask]);
    vi.mocked(getStatus).mockResolvedValue(null);
    vi.mocked(startTimer).mockResolvedValue(mockTimeEntry);
    vi.mocked(loadRecent).mockReturnValue({});
    vi.mocked(saveRecent).mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('no timer running', () => {
    /** @spec interactive.select.start */
    it('starts timer after selecting client, project, and task', async () => {
      const mockSelect = vi.fn()
        .mockResolvedValueOnce(mockClient.id)    // Select client
        .mockResolvedValueOnce(mockProject.id)   // Select project
        .mockResolvedValueOnce(mockTask.id);     // Select task

      const mockInput = vi.fn().mockResolvedValue('Test description');

      const result = await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: mockInput as any,
      });

      expect(result.action).toBe('started');
      expect(result.timerStarted).toBe(true);
      expect(startTimer).toHaveBeenCalledWith(
        mockClient.id,
        mockProject.id,
        mockTask.id,
        'Test description'
      );
    });

    it('starts timer with only client (skip project and task)', async () => {
      const mockSelect = vi.fn()
        .mockResolvedValueOnce(mockClient.id)    // Select client
        .mockResolvedValueOnce('__skip__');      // Skip project

      const mockInput = vi.fn().mockResolvedValue('');

      const result = await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: mockInput as any,
      });

      expect(result.action).toBe('started');
      expect(startTimer).toHaveBeenCalledWith(
        mockClient.id,
        undefined,
        undefined,
        undefined
      );
    });

    /** @spec interactive.select.client */
    it('creates new client when selected', async () => {
      const newClient: Client = { ...mockClient, id: 'new-client-id', name: 'New Client' };
      vi.mocked(addClient).mockResolvedValue(newClient);

      const mockSelect = vi.fn()
        .mockResolvedValueOnce('__new__')        // Create new client
        .mockResolvedValueOnce('__skip__');      // Skip project

      const mockInput = vi.fn()
        .mockResolvedValueOnce('New Client')     // New client name
        .mockResolvedValueOnce('');              // Description

      const result = await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: mockInput as any,
      });

      expect(addClient).toHaveBeenCalledWith('New Client');
      expect(result.action).toBe('started');
    });

    /** @spec interactive.select.project */
    it('creates new project when [+ New project] is selected', async () => {
      const newProject: Project = { ...mockProject, id: 'new-project-id', name: 'New Project' };
      vi.mocked(addProject).mockResolvedValue(newProject);

      const mockSelect = vi.fn()
        .mockResolvedValueOnce(mockClient.id)    // Select client
        .mockResolvedValueOnce('__new__')        // Create new project
        .mockResolvedValueOnce('__skip__');      // Skip task

      const mockInput = vi.fn()
        .mockResolvedValueOnce('New Project')    // New project name
        .mockResolvedValueOnce('');              // Description

      const result = await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: mockInput as any,
      });

      expect(addProject).toHaveBeenCalledWith('New Project', mockClient.id);
      expect(result.action).toBe('started');
      expect(result.projectId).toBe('new-project-id');
    });

    /** @spec interactive.select.task */
    it('creates new task when [+ New task] is selected', async () => {
      const newTask: Task = { ...mockTask, id: 'new-task-id', name: 'New Task' };
      vi.mocked(addTask).mockResolvedValue(newTask);

      const mockSelect = vi.fn()
        .mockResolvedValueOnce(mockClient.id)    // Select client
        .mockResolvedValueOnce(mockProject.id)   // Select project
        .mockResolvedValueOnce('__new__');       // Create new task

      const mockInput = vi.fn()
        .mockResolvedValueOnce('New Task')       // New task name
        .mockResolvedValueOnce('');              // Description

      const result = await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: mockInput as any,
      });

      expect(addTask).toHaveBeenCalledWith('New Task', mockProject.id);
      expect(result.action).toBe('started');
      expect(result.taskId).toBe('new-task-id');
    });

    /** @spec interactive.select.description */
    it('shows optional description prompt after selections', async () => {
      const mockSelect = vi.fn()
        .mockResolvedValueOnce(mockClient.id)
        .mockResolvedValueOnce(mockProject.id)
        .mockResolvedValueOnce(mockTask.id);

      const mockInput = vi.fn().mockResolvedValue('');

      await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: mockInput as any,
      });

      // Verify input was called for description
      expect(mockInput).toHaveBeenCalledWith({ message: 'Description (optional):' });
    });
  });

  describe('timer running', () => {
    const mockRunningStatus: TimerStatus = {
      entry: mockTimeEntry,
      client: mockClient,
      project: mockProject,
      task: null,
      duration: 3600, // 1 hour
    };

    beforeEach(() => {
      vi.mocked(getStatus).mockResolvedValue(mockRunningStatus);
    });

    /** @spec interactive.running.show-info */
    it('shows timer info when timer is running', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      const mockSelect = vi.fn().mockResolvedValue('cancel');

      await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: vi.fn() as any,
      });

      // Check that timer info was displayed
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Timer running:.*1h 0m.*Test Client.*Test Project/)
      );
    });

    /** @spec interactive.running.stop */
    it('stops timer when Stop is selected', async () => {
      vi.mocked(stopTimer).mockResolvedValue({ ...mockTimeEntry, ended_at: new Date().toISOString() });

      const mockSelect = vi.fn().mockResolvedValue('stop');

      const result = await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: vi.fn() as any,
      });

      expect(result.action).toBe('stopped');
      expect(stopTimer).toHaveBeenCalled();
    });

    /** @spec interactive.running.switch */
    it('switches timer when Switch is selected', async () => {
      vi.mocked(stopTimer).mockResolvedValue({ ...mockTimeEntry, ended_at: new Date().toISOString() });

      const mockSelect = vi.fn()
        .mockResolvedValueOnce('switch')         // Choose to switch
        .mockResolvedValueOnce(mockClient2.id)   // Select new client
        .mockResolvedValueOnce('__skip__');      // Skip project

      const mockInput = vi.fn().mockResolvedValue('');

      const result = await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: mockInput as any,
      });

      expect(result.action).toBe('switched');
      expect(stopTimer).toHaveBeenCalled();
      expect(startTimer).toHaveBeenCalledWith(
        mockClient2.id,
        undefined,
        undefined,
        undefined
      );
    });

    /** @spec interactive.running.cancel */
    it('cancels without changes when Cancel is selected', async () => {
      const mockSelect = vi.fn().mockResolvedValue('cancel');

      const result = await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: vi.fn() as any,
      });

      expect(result.action).toBe('cancelled');
      expect(stopTimer).not.toHaveBeenCalled();
      expect(startTimer).not.toHaveBeenCalled();
    });
  });

  describe('smart defaults (last-used pre-selection)', () => {
    /** @spec recent.save */
    it('saves last-used client and project after starting timer', async () => {
      const mockSelect = vi.fn()
        .mockResolvedValueOnce(mockClient.id)
        .mockResolvedValueOnce(mockProject.id)
        .mockResolvedValueOnce('__skip__');

      const mockInput = vi.fn().mockResolvedValue('');

      await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: mockInput as any,
      });

      expect(saveRecent).toHaveBeenCalledWith({
        clientId: mockClient.id,
        projectId: mockProject.id,
      });
    });

    /** @spec interactive.defaults.client */
    it('pre-selects last-used client in choices', async () => {
      vi.mocked(loadRecent).mockReturnValue({ clientId: mockClient.id });

      let clientDefaultValue: string | undefined;
      const mockSelect = vi.fn().mockImplementation((opts: { default?: string }) => {
        if (!clientDefaultValue && opts.default) {
          clientDefaultValue = opts.default;
        }
        return Promise.resolve(mockClient.id);
      })
        .mockResolvedValueOnce(mockClient.id)
        .mockResolvedValueOnce('__skip__');

      await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: vi.fn().mockResolvedValue('') as any,
      });

      // The first call should have the default set to the last-used client
      expect(mockSelect.mock.calls[0][0].default).toBe(mockClient.id);
    });

    /** @spec interactive.defaults.project */
    it('pre-selects last-used project in choices', async () => {
      vi.mocked(loadRecent).mockReturnValue({
        clientId: mockClient.id,
        projectId: mockProject.id,
      });

      const selectCalls: any[] = [];
      const mockSelect = vi.fn().mockImplementation((opts: any) => {
        selectCalls.push(opts);
        if (opts.message.includes('client')) return Promise.resolve(mockClient.id);
        if (opts.message.includes('project')) return Promise.resolve(mockProject.id);
        return Promise.resolve('__skip__');
      });

      await runInteractiveMode({
        selectFn: mockSelect as any,
        inputFn: vi.fn().mockResolvedValue('') as any,
      });

      // Find the project selection call
      const projectCall = selectCalls.find(c => c.message.includes('project'));
      expect(projectCall?.default).toBe(mockProject.id);
    });
  });

  describe('formatting functions', () => {
    /** @spec interactive.running.show-info */
    it('formatDuration shows hours and minutes when duration >= 1 hour', () => {
      expect(formatDuration(3600)).toBe('1h 0m');   // exactly 1 hour
      expect(formatDuration(3661)).toBe('1h 1m');   // 1 hour 1 minute
      expect(formatDuration(7200)).toBe('2h 0m');   // 2 hours
      expect(formatDuration(8115)).toBe('2h 15m');  // 2 hours 15 minutes
    });

    /** @spec interactive.running.show-info */
    it('formatDuration shows only minutes when duration < 1 hour', () => {
      expect(formatDuration(0)).toBe('0m');
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(900)).toBe('15m');
      expect(formatDuration(3599)).toBe('59m');
    });

    /** @spec interactive.running.show-info */
    it('formatTimerInfo shows client, project, and task names', () => {
      const status: TimerStatus = {
        entry: mockTimeEntry,
        client: mockClient,
        project: mockProject,
        task: mockTask,
        duration: 0,
      };
      expect(formatTimerInfo(status)).toBe('Test Client > Test Project > Test Task');
    });

    /** @spec interactive.running.show-info */
    it('formatTimerInfo shows client and project when no task', () => {
      const status: TimerStatus = {
        entry: { ...mockTimeEntry, task_id: null },
        client: mockClient,
        project: mockProject,
        task: null,
        duration: 0,
      };
      expect(formatTimerInfo(status)).toBe('Test Client > Test Project');
    });

    /** @spec interactive.running.show-info */
    it('formatTimerInfo shows only client when no project', () => {
      const status: TimerStatus = {
        entry: { ...mockTimeEntry, project_id: null, task_id: null },
        client: mockClient,
        project: null,
        task: null,
        duration: 0,
      };
      expect(formatTimerInfo(status)).toBe('Test Client');
    });
  });
});
