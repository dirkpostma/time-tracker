import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { runInteractiveMode, InteractiveResult, formatDuration, formatTimerInfo } from './interactive.js';
import { getSupabaseClient } from '@time-tracker/repositories/supabase/connection';
import { addClient, Client } from './client.js';
import { addProject, Project } from './project.js';
import { addTask, Task } from './task.js';
import { getRunningTimer, stopTimer, TimerStatus } from './timeEntry.js';
import { saveRecent, loadRecent } from './recent.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('interactive mode', () => {
  const testId = Date.now();
  let testClient: Client;
  let testClient2: Client;
  let testProject: Project;
  let testTask: Task;

  beforeAll(async () => {
    // Create test data
    testClient = await addClient(`Interactive Test Client ${testId}`);
    testClient2 = await addClient(`Interactive Test Client 2 ${testId}`);
    testProject = await addProject(`Interactive Test Project ${testId}`, testClient.id);
    testTask = await addTask(`Interactive Test Task ${testId}`, testProject.id);
  });

  afterAll(async () => {
    const supabase = getSupabaseClient();

    // Stop any running timer
    const running = await getRunningTimer();
    if (running) {
      await stopTimer();
    }

    // Clean up test data
    await supabase.from('tasks').delete().eq('id', testTask.id);
    await supabase.from('projects').delete().eq('id', testProject.id);
    await supabase.from('clients').delete().eq('id', testClient.id);
    await supabase.from('clients').delete().eq('id', testClient2.id);
  });

  beforeEach(async () => {
    // Stop any running timer before each test
    const running = await getRunningTimer();
    if (running) {
      await stopTimer();
    }
  });

  describe('no timer running', () => {
    /** @spec interactive.select.start */
    it('starts timer after selecting client, project, and task', async () => {
      const mockSelect = async (opts: { message: string; choices: unknown[] }) => {
        if (opts.message.includes('client')) return testClient.id;
        if (opts.message.includes('project')) return testProject.id;
        if (opts.message.includes('task')) return testTask.id;
        return '';
      };

      const mockInput = async () => 'Test description';

      const result = await runInteractiveMode({
        selectFn: mockSelect as never,
        inputFn: mockInput as never,
      });

      expect(result.action).toBe('started');
      expect(result.timerStarted).toBe(true);

      const running = await getRunningTimer();
      expect(running).not.toBeNull();
      expect(running?.client_id).toBe(testClient.id);
      expect(running?.project_id).toBe(testProject.id);
      expect(running?.task_id).toBe(testTask.id);
      expect(running?.description).toBe('Test description');
    });

    it('starts timer with only client (skip project and task)', async () => {
      const mockSelect = async (opts: { message: string; choices: unknown[] }) => {
        if (opts.message.includes('client')) return testClient.id;
        if (opts.message.includes('project')) return '__skip__';
        return '__skip__';
      };

      const mockInput = async () => '';

      const result = await runInteractiveMode({
        selectFn: mockSelect as never,
        inputFn: mockInput as never,
      });

      expect(result.action).toBe('started');

      const running = await getRunningTimer();
      expect(running).not.toBeNull();
      expect(running?.client_id).toBe(testClient.id);
      expect(running?.project_id).toBeNull();
      expect(running?.task_id).toBeNull();
    });

    /** @spec interactive.select.client */
    it('creates new client when selected', async () => {
      let createClientPromptShown = false;
      const newClientName = `New Client ${testId}`;

      const mockSelect = async (opts: { message: string; choices: unknown[] }) => {
        if (opts.message.includes('client')) return '__new__';
        if (opts.message.includes('project')) return '__skip__';
        return '__skip__';
      };

      const mockInput = async (opts: { message: string }) => {
        if (opts.message.includes('client') || opts.message.includes('Client')) {
          createClientPromptShown = true;
          return newClientName;
        }
        return '';
      };

      const result = await runInteractiveMode({
        selectFn: mockSelect as never,
        inputFn: mockInput as never,
      });

      expect(createClientPromptShown).toBe(true);
      expect(result.action).toBe('started');

      // Clean up new client
      const supabase = getSupabaseClient();
      await supabase.from('time_entries').delete().eq('client_id', result.clientId!);
      await supabase.from('clients').delete().eq('name', newClientName);
    });

    /** @spec interactive.select.project */
    it('creates new project when [+ New project] is selected', async () => {
      let createProjectPromptShown = false;
      const newProjectName = `New Project ${testId}`;

      const mockSelect = async (opts: { message: string; choices: unknown[] }) => {
        if (opts.message.includes('client')) return testClient.id;
        if (opts.message.includes('project')) return '__new__';
        if (opts.message.includes('task')) return '__skip__';
        return '';
      };

      const mockInput = async (opts: { message: string }) => {
        if (opts.message.includes('Project')) {
          createProjectPromptShown = true;
          return newProjectName;
        }
        return '';
      };

      const result = await runInteractiveMode({
        selectFn: mockSelect as never,
        inputFn: mockInput as never,
      });

      expect(createProjectPromptShown).toBe(true);
      expect(result.action).toBe('started');
      expect(result.projectId).toBeDefined();

      // Verify project was created
      const supabase = getSupabaseClient();
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', result.projectId!)
        .single();
      expect(project?.name).toBe(newProjectName);

      // Clean up
      await supabase.from('time_entries').delete().eq('project_id', result.projectId!);
      await supabase.from('projects').delete().eq('id', result.projectId!);
    });

    /** @spec interactive.select.task */
    it('creates new task when [+ New task] is selected', async () => {
      let createTaskPromptShown = false;
      const newTaskName = `New Task ${testId}`;

      const mockSelect = async (opts: { message: string; choices: unknown[] }) => {
        if (opts.message.includes('client')) return testClient.id;
        if (opts.message.includes('project')) return testProject.id;
        if (opts.message.includes('task')) return '__new__';
        return '';
      };

      const mockInput = async (opts: { message: string }) => {
        if (opts.message.includes('Task')) {
          createTaskPromptShown = true;
          return newTaskName;
        }
        return '';
      };

      const result = await runInteractiveMode({
        selectFn: mockSelect as never,
        inputFn: mockInput as never,
      });

      expect(createTaskPromptShown).toBe(true);
      expect(result.action).toBe('started');
      expect(result.taskId).toBeDefined();

      // Verify task was created
      const supabase = getSupabaseClient();
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', result.taskId!)
        .single();
      expect(task?.name).toBe(newTaskName);

      // Clean up
      await supabase.from('time_entries').delete().eq('task_id', result.taskId!);
      await supabase.from('tasks').delete().eq('id', result.taskId!);
    });

    /** @spec interactive.select.description */
    it('shows optional description prompt after selections', async () => {
      let descriptionPromptMessage: string | undefined;

      const mockSelect = async (opts: { message: string; choices: unknown[] }) => {
        if (opts.message.includes('client')) return testClient.id;
        if (opts.message.includes('project')) return testProject.id;
        if (opts.message.includes('task')) return testTask.id;
        return '';
      };

      const mockInput = async (opts: { message: string }) => {
        if (opts.message.includes('Description')) {
          descriptionPromptMessage = opts.message;
        }
        return '';
      };

      await runInteractiveMode({
        selectFn: mockSelect as never,
        inputFn: mockInput as never,
      });

      // Verify description prompt was shown with correct message
      expect(descriptionPromptMessage).toBeDefined();
      expect(descriptionPromptMessage).toContain('optional');
    });
  });

  describe('timer running', () => {
    beforeEach(async () => {
      // Start a timer
      const supabase = getSupabaseClient();
      await supabase.from('time_entries').insert({
        client_id: testClient.id,
        project_id: testProject.id,
        started_at: new Date().toISOString(),
      });
    });

    /** @spec interactive.running.show-info */
    it('shows timer info when timer is running', async () => {
      // Capture console.log output
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: unknown[]) => {
        logs.push(args.map(String).join(' '));
      };

      try {
        const mockSelect = async (opts: { message: string }) => {
          if (opts.message.includes('What would you like to do')) return 'cancel';
          return '';
        };

        await runInteractiveMode({
          selectFn: mockSelect as never,
          inputFn: (async () => '') as never,
        });

        // Check that timer info was displayed
        const timerInfoLog = logs.find((log) => log.includes('Timer running:'));
        expect(timerInfoLog).toBeDefined();
        expect(timerInfoLog).toMatch(/Timer running: \d+h? ?\d*m on/);
        expect(timerInfoLog).toContain(testClient.name);
        expect(timerInfoLog).toContain(testProject.name);
      } finally {
        console.log = originalLog;
      }
    });

    /** @spec interactive.running.stop */
    it('stops timer when Stop is selected', async () => {
      const mockSelect = async (opts: { message: string }) => {
        if (opts.message.includes('What would you like to do')) return 'stop';
        return '';
      };

      const result = await runInteractiveMode({
        selectFn: mockSelect as never,
        inputFn: (async () => '') as never,
      });

      expect(result.action).toBe('stopped');

      const running = await getRunningTimer();
      expect(running).toBeNull();
    });

    /** @spec interactive.running.switch */
    it('switches timer when Switch is selected', async () => {
      const mockSelect = async (opts: { message: string }) => {
        if (opts.message.includes('What would you like to do')) return 'switch';
        if (opts.message.includes('client')) return testClient2.id;
        if (opts.message.includes('project')) return '__skip__';
        if (opts.message.includes('task')) return '__skip__';
        return '';
      };

      const result = await runInteractiveMode({
        selectFn: mockSelect as never,
        inputFn: (async () => '') as never,
      });

      expect(result.action).toBe('switched');

      const running = await getRunningTimer();
      expect(running).not.toBeNull();
      expect(running?.client_id).toBe(testClient2.id);
    });

    /** @spec interactive.running.cancel */
    it('cancels without changes when Cancel is selected', async () => {
      const runningBefore = await getRunningTimer();

      const mockSelect = async (opts: { message: string }) => {
        if (opts.message.includes('What would you like to do')) return 'cancel';
        return '';
      };

      const result = await runInteractiveMode({
        selectFn: mockSelect as never,
        inputFn: (async () => '') as never,
      });

      expect(result.action).toBe('cancelled');

      const runningAfter = await getRunningTimer();
      expect(runningAfter?.id).toBe(runningBefore?.id);
    });
  });

  describe('smart defaults (last-used pre-selection)', () => {
    const recentPath = path.join(os.tmpdir(), `.tt-recent-test-${Date.now()}.json`);

    afterEach(() => {
      // Clean up test config file
      if (fs.existsSync(recentPath)) {
        fs.unlinkSync(recentPath);
      }
    });

    /** @spec recent.save */
    it('saves last-used client and project after starting timer', async () => {
      const mockSelect = async (opts: { message: string; choices: unknown[] }) => {
        if (opts.message.includes('client')) return testClient.id;
        if (opts.message.includes('project')) return testProject.id;
        if (opts.message.includes('task')) return '__skip__';
        return '';
      };

      await runInteractiveMode({
        selectFn: mockSelect as never,
        inputFn: (async () => '') as never,
      });

      // Verify last-used was saved (check actual config file)
      const recent = loadRecent();
      expect(recent.clientId).toBe(testClient.id);
      expect(recent.projectId).toBe(testProject.id);
    });

    /** @spec interactive.defaults.client */
    it('pre-selects last-used client in choices', async () => {
      // Save a recent client
      saveRecent({ clientId: testClient.id });

      let clientChoicesDefault: string | undefined;

      const mockSelect = async (opts: { message: string; choices: unknown[]; default?: string }) => {
        if (opts.message.includes('client')) {
          clientChoicesDefault = opts.default;
          return testClient.id;
        }
        if (opts.message.includes('project')) return '__skip__';
        return '__skip__';
      };

      await runInteractiveMode({
        selectFn: mockSelect as never,
        inputFn: (async () => '') as never,
      });

      // The default should be the last-used client ID
      expect(clientChoicesDefault).toBe(testClient.id);
    });

    /** @spec interactive.defaults.project */
    it('pre-selects last-used project in choices', async () => {
      // Save recent client and project
      saveRecent({ clientId: testClient.id, projectId: testProject.id });

      let projectChoicesDefault: string | undefined;

      const mockSelect = async (opts: { message: string; choices: unknown[]; default?: string }) => {
        if (opts.message.includes('client')) return testClient.id;
        if (opts.message.includes('project')) {
          projectChoicesDefault = opts.default;
          return testProject.id;
        }
        if (opts.message.includes('task')) return '__skip__';
        return '';
      };

      await runInteractiveMode({
        selectFn: mockSelect as never,
        inputFn: (async () => '') as never,
      });

      // The default should be the last-used project ID
      expect(projectChoicesDefault).toBe(testProject.id);
    });
  });

  describe('formatting functions', () => {
    /** @spec interactive.running.show-info */
    it('formatDuration shows hours and minutes when duration >= 1 hour', () => {
      expect(formatDuration(3600)).toBe('1h 0m'); // exactly 1 hour
      expect(formatDuration(3661)).toBe('1h 1m'); // 1 hour 1 minute
      expect(formatDuration(7200)).toBe('2h 0m'); // 2 hours
      expect(formatDuration(8115)).toBe('2h 15m'); // 2 hours 15 minutes
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
        entry: { id: '0', client_id: '1', project_id: '2', task_id: '3', description: null, started_at: '', ended_at: null, created_at: '', updated_at: '' },
        client: { id: '1', name: 'Acme Corp', created_at: '', updated_at: '' },
        project: { id: '2', name: 'Website', client_id: '1', created_at: '', updated_at: '' },
        task: { id: '3', name: 'Homepage', project_id: '2', created_at: '', updated_at: '' },
        duration: 0,
      };
      expect(formatTimerInfo(status)).toBe('Acme Corp > Website > Homepage');
    });

    /** @spec interactive.running.show-info */
    it('formatTimerInfo shows client and project when no task', () => {
      const status: TimerStatus = {
        entry: { id: '0', client_id: '1', project_id: '2', task_id: null, description: null, started_at: '', ended_at: null, created_at: '', updated_at: '' },
        client: { id: '1', name: 'Acme Corp', created_at: '', updated_at: '' },
        project: { id: '2', name: 'Website', client_id: '1', created_at: '', updated_at: '' },
        task: null,
        duration: 0,
      };
      expect(formatTimerInfo(status)).toBe('Acme Corp > Website');
    });

    /** @spec interactive.running.show-info */
    it('formatTimerInfo shows only client when no project', () => {
      const status: TimerStatus = {
        entry: { id: '0', client_id: '1', project_id: null, task_id: null, description: null, started_at: '', ended_at: null, created_at: '', updated_at: '' },
        client: { id: '1', name: 'Acme Corp', created_at: '', updated_at: '' },
        project: null,
        task: null,
        duration: 0,
      };
      expect(formatTimerInfo(status)).toBe('Acme Corp');
    });
  });
});
