/**
 * Core timer business logic.
 * Pure functions with no side effects - no console.log, no process.exit.
 * Functions receive repository as parameter for dependency injection.
 */

import type { TimeEntry } from './types.js';
import type { TimeEntryRepository } from '../repositories/types.js';

/**
 * Represents the current state of the timer.
 */
export interface TimerState {
  isRunning: boolean;
  currentEntry?: TimeEntry;
  duration?: number; // in minutes
}

/**
 * Request object for starting a timer.
 */
export interface StartTimerRequest {
  clientId: string;
  projectId?: string;
  taskId?: string;
  description?: string;
}

/**
 * Result object from starting a timer.
 */
export interface StartTimerResult {
  success: boolean;
  entry?: TimeEntry;
  stoppedEntry?: TimeEntry;
  error?: string;
}

/**
 * Result object from stopping a timer.
 */
export interface StopTimerResult {
  success: boolean;
  entry?: TimeEntry;
  error?: string;
}

/**
 * Calculates the duration in minutes between two dates.
 * If endedAt is not provided, calculates duration from startedAt to now.
 *
 * @param startedAt - The start time
 * @param endedAt - The end time (optional, defaults to now)
 * @returns Duration in minutes (floored)
 */
export function calculateDuration(startedAt: Date, endedAt?: Date): number {
  const end = endedAt ?? new Date();
  const durationMs = end.getTime() - startedAt.getTime();
  return Math.floor(durationMs / (1000 * 60));
}

/**
 * Gets the current timer state.
 *
 * @param repo - The time entry repository
 * @returns The current timer state
 */
export async function getTimerState(repo: TimeEntryRepository): Promise<TimerState> {
  const runningEntry = await repo.findRunning();

  if (!runningEntry) {
    return {
      isRunning: false,
      currentEntry: undefined,
      duration: undefined,
    };
  }

  const duration = calculateDuration(new Date(runningEntry.started_at));

  return {
    isRunning: true,
    currentEntry: runningEntry,
    duration,
  };
}

/**
 * Starts a new timer.
 * If a timer is already running:
 * - Without force: returns error
 * - With force: stops the running timer first and returns it in stoppedEntry
 *
 * @param repo - The time entry repository
 * @param request - The start timer request
 * @param options - Optional settings (force: stop existing timer)
 * @returns The start timer result
 */
export async function startTimer(
  repo: TimeEntryRepository,
  request: StartTimerRequest,
  options?: { force?: boolean }
): Promise<StartTimerResult> {
  const runningEntry = await repo.findRunning();

  // Check if a timer is already running
  if (runningEntry) {
    if (options?.force) {
      // Stop the running timer first
      const stoppedEntry = await repo.stop(runningEntry.id);

      // Create new entry
      const newEntry = await repo.create({
        client_id: request.clientId,
        project_id: request.projectId ?? null,
        task_id: request.taskId ?? null,
        description: request.description ?? null,
      });

      return {
        success: true,
        entry: newEntry,
        stoppedEntry,
      };
    }

    // Timer running and force not set
    return {
      success: false,
      error: 'Timer already running. Stop it first.',
    };
  }

  // No timer running, create new entry
  const newEntry = await repo.create({
    client_id: request.clientId,
    project_id: request.projectId ?? null,
    task_id: request.taskId ?? null,
    description: request.description ?? null,
  });

  return {
    success: true,
    entry: newEntry,
  };
}

/**
 * Stops the currently running timer.
 *
 * @param repo - The time entry repository
 * @returns The stop timer result
 */
export async function stopTimer(repo: TimeEntryRepository): Promise<StopTimerResult> {
  const runningEntry = await repo.findRunning();

  if (!runningEntry) {
    return {
      success: false,
      error: 'No timer running',
    };
  }

  const stoppedEntry = await repo.stop(runningEntry.id);

  return {
    success: true,
    entry: stoppedEntry,
  };
}
