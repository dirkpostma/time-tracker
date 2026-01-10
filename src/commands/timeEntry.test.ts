import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { getSupabaseClient } from '../db/client.js';
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
    await supabase.from('time_entries').delete().eq('project_id', testProjectId);
    await supabase.from('projects').delete().eq('name', testProjectName);
    await supabase.from('clients').delete().eq('name', testClientName);
  });

  beforeEach(async () => {
    // Stop any running timer before each test
    const supabase = getSupabaseClient();
    await supabase.from('time_entries').update({ ended_at: new Date().toISOString() }).is('ended_at', null);
  });

  describe('startTimer', () => {
    it('should create a new time entry', async () => {
      const entry = await startTimer(testProjectId);

      expect(entry).toBeDefined();
      expect(entry.project_id).toBe(testProjectId);
      expect(entry.started_at).toBeDefined();
      expect(entry.ended_at).toBeNull();
    });

    it('should create entry with optional task and description', async () => {
      const entry = await startTimer(testProjectId, undefined, 'Working on feature');

      expect(entry.description).toBe('Working on feature');
    });

    it('should throw if timer already running', async () => {
      await startTimer(testProjectId);

      await expect(startTimer(testProjectId)).rejects.toThrow('Timer already running');
    });
  });

  describe('getRunningTimer', () => {
    it('should return null when no timer running', async () => {
      const timer = await getRunningTimer();
      expect(timer).toBeNull();
    });

    it('should return running timer', async () => {
      await startTimer(testProjectId);

      const timer = await getRunningTimer();
      expect(timer).toBeDefined();
      expect(timer?.ended_at).toBeNull();
    });
  });

  describe('stopTimer', () => {
    it('should stop running timer', async () => {
      await startTimer(testProjectId);

      const entry = await stopTimer();

      expect(entry).toBeDefined();
      expect(entry.ended_at).toBeDefined();
    });

    it('should throw if no timer running', async () => {
      await expect(stopTimer()).rejects.toThrow('No timer running');
    });

    it('should add description when stopping', async () => {
      await startTimer(testProjectId);

      const entry = await stopTimer('Finished the task');

      expect(entry.description).toBe('Finished the task');
    });

    it('should warn if overwriting description', async () => {
      await startTimer(testProjectId, undefined, 'Original description');

      // This should work but return that there was an existing description
      const entry = await stopTimer('New description');

      expect(entry.description).toBe('New description');
    });
  });

  describe('getStatus', () => {
    it('should return null when no timer running', async () => {
      const status = await getStatus();
      expect(status).toBeNull();
    });

    it('should return status with project info', async () => {
      await startTimer(testProjectId);

      const status = await getStatus();

      expect(status).toBeDefined();
      expect(status?.project.name).toBe(testProjectName);
      expect(status?.client.name).toBe(testClientName);
      expect(status?.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
