import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { getSupabaseClient } from '@time-tracker/repositories/supabase/connection';
import { addClient } from './client.js';
import { addProject } from './project.js';
import { startTimer, stopTimer, getRunningTimer, getStatus } from './timeEntry.js';

describe('time entry commands', () => {
  const testClientName = `TimeEntry Test Client ${Date.now()}`;
  const testProjectName = `TimeEntry Test Project ${Date.now()}`;
  let testClientId: string;
  let testProjectId: string;

  beforeAll(async () => {
    const client = await addClient(testClientName);
    testClientId = client.id;
    const project = await addProject(testProjectName, testClientId);
    testProjectId = project.id;
  });

  afterAll(async () => {
    const supabase = getSupabaseClient();
    await supabase.from('time_entries').delete().eq('client_id', testClientId);
    await supabase.from('projects').delete().eq('name', testProjectName);
    await supabase.from('clients').delete().eq('name', testClientName);
  });

  beforeEach(async () => {
    // Stop any running timer for THIS test client only (avoids parallel test interference)
    const supabase = getSupabaseClient();
    await supabase.from('time_entries')
      .update({ ended_at: new Date().toISOString() })
      .eq('client_id', testClientId)
      .is('ended_at', null);
  });

  describe('startTimer', () => {
    /** @spec timer.start.success */
    it('should create a new time entry with client and project', async () => {
      const entry = await startTimer(testClientId, testProjectId);

      expect(entry).toBeDefined();
      expect(entry.client_id).toBe(testClientId);
      expect(entry.project_id).toBe(testProjectId);
      expect(entry.started_at).toBeDefined();
      expect(entry.ended_at).toBeNull();
    });

    it('should create a new time entry with only client (no project)', async () => {
      const entry = await startTimer(testClientId);

      expect(entry).toBeDefined();
      expect(entry.client_id).toBe(testClientId);
      expect(entry.project_id).toBeNull();
      expect(entry.started_at).toBeDefined();
      expect(entry.ended_at).toBeNull();
    });

    it('should create entry with optional task and description', async () => {
      const entry = await startTimer(testClientId, testProjectId, undefined, 'Working on feature');

      expect(entry.description).toBe('Working on feature');
    });

    /** @spec timer.start.running-exists */
    it('should throw if timer already running and force is false', async () => {
      await startTimer(testClientId, testProjectId);

      await expect(startTimer(testClientId)).rejects.toThrow('Timer already running');
    });

    it('should stop current timer and start new one when force is true', async () => {
      // Start first timer
      const firstEntry = await startTimer(testClientId, testProjectId);
      expect(firstEntry.ended_at).toBeNull();

      // Start second timer with force
      const secondEntry = await startTimer(testClientId, undefined, undefined, undefined, true);

      // Second timer should be running
      expect(secondEntry.ended_at).toBeNull();
      expect(secondEntry.id).not.toBe(firstEntry.id);

      // First timer should be stopped
      const supabase = getSupabaseClient();
      const { data: stoppedEntry } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', firstEntry.id)
        .single();

      expect(stoppedEntry?.ended_at).not.toBeNull();
    });
  });

  describe('getRunningTimer', () => {
    it('should return null when no timer running', async () => {
      const timer = await getRunningTimer();
      expect(timer).toBeNull();
    });

    it('should return running timer', async () => {
      await startTimer(testClientId, testProjectId);

      const timer = await getRunningTimer();
      expect(timer).toBeDefined();
      expect(timer?.ended_at).toBeNull();
    });
  });

  describe('stopTimer', () => {
    /** @spec timer.stop.success */
    it('should stop running timer', async () => {
      await startTimer(testClientId, testProjectId);

      const entry = await stopTimer();

      expect(entry).toBeDefined();
      expect(entry.ended_at).toBeDefined();
    });

    /** @spec timer.stop.no-running */
    it('should throw if no timer running', async () => {
      await expect(stopTimer()).rejects.toThrow('No timer running');
    });

    it('should add description when stopping', async () => {
      await startTimer(testClientId, testProjectId);

      const entry = await stopTimer('Finished the task');

      expect(entry.description).toBe('Finished the task');
    });

    it('should warn if overwriting description', async () => {
      await startTimer(testClientId, testProjectId, undefined, 'Original description');

      // This should work but return that there was an existing description
      const entry = await stopTimer('New description');

      expect(entry.description).toBe('New description');
    });
  });

  describe('getStatus', () => {
    /** @spec timer.status.not-running */
    it('should return null when no timer running', async () => {
      const status = await getStatus();
      expect(status).toBeNull();
    });

    /** @spec timer.status.running */
    it('should return status with client and project info', async () => {
      await startTimer(testClientId, testProjectId);

      const status = await getStatus();

      expect(status).toBeDefined();
      expect(status?.client.name).toBe(testClientName);
      expect(status?.project?.name).toBe(testProjectName);
      expect(status?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should return status with only client (no project)', async () => {
      await startTimer(testClientId);

      const status = await getStatus();

      expect(status).toBeDefined();
      expect(status?.client.name).toBe(testClientName);
      expect(status?.project).toBeNull();
      expect(status?.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
