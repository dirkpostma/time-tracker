import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { getSupabaseClient } from '../../repositories/supabase/connection.js';
import { addClient } from './client.js';
import { addProject } from './project.js';
import { addTask } from './task.js';
import { startTimer, stopTimer, getStatus } from './timeEntry.js';
import { handleTimerSwitch } from './timerSwitch.js';

describe('timerSwitch', () => {
  const testClientName = `TimerSwitch Test Client ${Date.now()}`;
  const testProjectName = `TimerSwitch Test Project ${Date.now()}`;
  const testTaskName = `TimerSwitch Test Task ${Date.now()}`;
  let testClientId: string;
  let testProjectId: string;
  let testTaskId: string;

  beforeAll(async () => {
    const client = await addClient(testClientName);
    testClientId = client.id;
    const project = await addProject(testProjectName, testClientId);
    testProjectId = project.id;
    const task = await addTask(testTaskName, testProjectId);
    testTaskId = task.id;
  });

  afterAll(async () => {
    const supabase = getSupabaseClient();
    await supabase.from('time_entries').delete().eq('client_id', testClientId);
    await supabase.from('tasks').delete().eq('name', testTaskName);
    await supabase.from('projects').delete().eq('name', testProjectName);
    await supabase.from('clients').delete().eq('name', testClientName);
  });

  beforeEach(async () => {
    // Stop any running timer for this test client
    const supabase = getSupabaseClient();
    await supabase.from('time_entries')
      .update({ ended_at: new Date().toISOString() })
      .eq('client_id', testClientId)
      .is('ended_at', null);
  });

  describe('handleTimerSwitch', () => {
    it('should start timer when none is running', async () => {
      const result = await handleTimerSwitch(testClientId, testProjectId);

      expect(result.switched).toBe(false);
      expect(result.message).toBe('started');
      expect(result.stoppedTimer).toBeUndefined();

      // Verify timer is running
      const status = await getStatus();
      expect(status).not.toBeNull();
      expect(status?.client.id).toBe(testClientId);
    });

    it('should switch timer with force=true', async () => {
      // Start initial timer
      await startTimer(testClientId, testProjectId);
      const initialStatus = await getStatus();

      // Switch with force
      const result = await handleTimerSwitch(testClientId, undefined, undefined, undefined, {
        force: true,
      });

      expect(result.switched).toBe(true);
      expect(result.message).toBe('switched');
      expect(result.stoppedTimer).toBeDefined();
      expect(result.stoppedTimer?.client.id).toBe(testClientId);

      // Verify new timer is running
      const newStatus = await getStatus();
      expect(newStatus?.entry.id).not.toBe(initialStatus?.entry.id);
    });

    it('should return non-interactive when not interactive and no force', async () => {
      // Start initial timer
      await startTimer(testClientId, testProjectId);

      const result = await handleTimerSwitch(testClientId, undefined, undefined, undefined, {
        interactive: false,
      });

      expect(result.switched).toBe(false);
      expect(result.message).toBe('non-interactive');
    });

    it('should switch when user confirms in interactive mode', async () => {
      // Start initial timer
      await startTimer(testClientId, testProjectId);

      // Mock confirm to return true
      const mockConfirm = async () => true;

      const result = await handleTimerSwitch(testClientId, undefined, undefined, undefined, {
        interactive: true,
        confirmFn: mockConfirm as typeof import('@inquirer/prompts').confirm,
      });

      expect(result.switched).toBe(true);
      expect(result.message).toBe('switched');
      expect(result.stoppedTimer).toBeDefined();
    });

    it('should keep running when user declines in interactive mode', async () => {
      // Start initial timer
      const initialEntry = await startTimer(testClientId, testProjectId);

      // Mock confirm to return false
      const mockConfirm = async () => false;

      const result = await handleTimerSwitch(testClientId, undefined, undefined, undefined, {
        interactive: true,
        confirmFn: mockConfirm as typeof import('@inquirer/prompts').confirm,
      });

      expect(result.switched).toBe(false);
      expect(result.message).toBe('declined');

      // Verify original timer is still running
      const status = await getStatus();
      expect(status?.entry.id).toBe(initialEntry.id);
    });

    it('should return stoppedTimer with client, project, task, and duration info', async () => {
      // Start timer with client, project, and task
      await startTimer(testClientId, testProjectId, testTaskId);

      // Wait a moment to ensure duration > 0
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await handleTimerSwitch(testClientId, undefined, undefined, undefined, {
        force: true,
      });

      expect(result.stoppedTimer).toBeDefined();
      expect(result.stoppedTimer?.client.name).toBe(testClientName);
      expect(result.stoppedTimer?.project?.name).toBe(testProjectName);
      expect(result.stoppedTimer?.task?.name).toBe(testTaskName);
      expect(result.stoppedTimer?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should pass correct prompt message to confirm function', async () => {
      await startTimer(testClientId, testProjectId);

      let capturedMessage = '';
      const mockConfirm = async (opts: { message: string }) => {
        capturedMessage = opts.message;
        return true;
      };

      await handleTimerSwitch(testClientId, undefined, undefined, undefined, {
        interactive: true,
        confirmFn: mockConfirm as typeof import('@inquirer/prompts').confirm,
      });

      expect(capturedMessage).toBe('Stop it and start a new one?');
    });
  });
});
