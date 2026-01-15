/**
 * CLI command handlers for time entry operations.
 * These are thin wrappers that:
 * - Parse CLI input
 * - Call repository functions
 * - Format and print output
 * - Handle errors with user-friendly messages
 */

import { getSupabaseClient } from '../../repositories/supabase/connection.js';
import { SupabaseTimeEntryRepository } from '../../repositories/supabase/timeEntry.js';
import { RepositoryError } from '../../repositories/types.js';
import { Client } from './client.js';
import { Project } from './project.js';
import { Task } from './task.js';

// Re-export TimeEntry type from core types for backward compatibility
export type { TimeEntry } from '../../core/types.js';
import type { TimeEntry } from '../../core/types.js';

export interface TimerStatus {
  entry: TimeEntry;
  client: Client;
  project: Project | null;
  task: Task | null;
  duration: number; // in seconds
}

// Create repository instance
const timeEntryRepository = new SupabaseTimeEntryRepository();

export async function getRunningTimer(): Promise<TimeEntry | null> {
  try {
    return await timeEntryRepository.findRunning();
  } catch (err) {
    if (err instanceof RepositoryError) {
      throw new Error(`Failed to get running timer: ${err.message}`);
    }
    throw new Error(`Failed to get running timer: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function startTimer(
  clientId: string,
  projectId?: string,
  taskId?: string,
  description?: string,
  force?: boolean
): Promise<TimeEntry> {
  // Check if timer already running
  const running = await getRunningTimer();
  if (running) {
    if (force) {
      // Stop the running timer first
      await timeEntryRepository.stop(running.id);
    } else {
      throw new Error('Timer already running. Stop it first.');
    }
  }

  try {
    return await timeEntryRepository.create({
      client_id: clientId,
      project_id: projectId || null,
      task_id: taskId || null,
      description: description || null,
    });
  } catch (err) {
    if (err instanceof RepositoryError) {
      throw new Error(`Failed to start timer: ${err.message}`);
    }
    throw new Error(`Failed to start timer: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function stopTimer(description?: string): Promise<TimeEntry> {
  const running = await getRunningTimer();
  if (!running) {
    throw new Error('No timer running');
  }

  try {
    if (description !== undefined) {
      // Update with description and stop in one operation
      return await timeEntryRepository.update(running.id, {
        description,
        ended_at: new Date().toISOString(),
      });
    } else {
      return await timeEntryRepository.stop(running.id);
    }
  } catch (err) {
    if (err instanceof RepositoryError) {
      throw new Error(`Failed to stop timer: ${err.message}`);
    }
    throw new Error(`Failed to stop timer: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getStatus(): Promise<TimerStatus | null> {
  const supabase = getSupabaseClient();

  const running = await getRunningTimer();
  if (!running) {
    return null;
  }

  // Get client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', running.client_id)
    .single();

  if (clientError || !client) {
    throw new Error('Failed to get client info');
  }

  // Get project if present
  let project: Project | null = null;
  if (running.project_id) {
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', running.project_id)
      .single();

    if (projectError || !projectData) {
      throw new Error('Failed to get project info');
    }
    project = projectData;
  }

  // Get task if present
  let task: Task | null = null;
  if (running.task_id) {
    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', running.task_id)
      .single();
    task = taskData;
  }

  // Calculate duration
  const startTime = new Date(running.started_at).getTime();
  const now = Date.now();
  const duration = Math.floor((now - startTime) / 1000);

  return {
    entry: running,
    client,
    project,
    task,
    duration,
  };
}
