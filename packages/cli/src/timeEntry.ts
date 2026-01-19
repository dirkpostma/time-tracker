/**
 * CLI command handlers for time entry operations.
 * These are thin wrappers that:
 * - Parse CLI input
 * - Call repository functions
 * - Format and print output
 * - Handle errors with user-friendly messages
 */

import { getSupabaseClient } from '@time-tracker/repositories/supabase/connection';
import { SupabaseTimeEntryRepository } from '@time-tracker/repositories/supabase/timeEntry';
import { Client } from './client.js';
import { Project } from './project.js';
import { Task } from './task.js';

// Re-export TimeEntry type from core types for backward compatibility
export type { TimeEntry } from '@time-tracker/core/types';
import type { TimeEntry } from '@time-tracker/core/types';

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
  return await timeEntryRepository.findRunning();
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

  return await timeEntryRepository.create({
    client_id: clientId,
    project_id: projectId || null,
    task_id: taskId || null,
    description: description || null,
  });
}

export async function stopTimer(description?: string): Promise<TimeEntry> {
  const running = await getRunningTimer();
  if (!running) {
    throw new Error('No timer running');
  }

  if (description !== undefined) {
    // Update with description and stop in one operation
    return await timeEntryRepository.update(running.id, {
      description,
      ended_at: new Date().toISOString(),
    });
  } else {
    return await timeEntryRepository.stop(running.id);
  }
}

export async function getStatus(): Promise<TimerStatus | null> {
  const supabase = getSupabaseClient();

  const running = await getRunningTimer();
  if (!running) {
    return null;
  }

  // Get client
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', running.client_id)
    .single();

  // Get project if present
  let project: Project | null = null;
  if (running.project_id) {
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('id', running.project_id)
      .single();
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
