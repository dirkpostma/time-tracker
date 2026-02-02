/**
 * CLI command handlers for timer switching operations.
 * These are thin wrappers that:
 * - Parse CLI input
 * - Call timer functions
 * - Format and print output
 * - Handle errors with user-friendly messages
 */

import { getStatus, startTimer, TimerStatus } from './timeEntry.js';

export interface SwitchResult {
  switched: boolean;
  stoppedTimer?: TimerStatus;
  message: string;
}

export interface SwitchOptions {
  force?: boolean;
}

/**
 * Handles the logic for starting a timer when one might already be running.
 * Returns info about what happened for the CLI to display.
 */
export async function handleTimerSwitch(
  clientId: string,
  projectId?: string,
  taskId?: string,
  description?: string,
  options?: SwitchOptions
): Promise<SwitchResult> {
  const runningStatus = await getStatus();

  if (!runningStatus) {
    // No timer running, just start
    await startTimer(clientId, projectId, taskId, description);
    return { switched: false, message: 'started' };
  }

  // Timer is running
  if (options?.force) {
    // Force: stop and start without prompting
    await startTimer(clientId, projectId, taskId, description, true);
    return { switched: true, stoppedTimer: runningStatus, message: 'switched' };
  }

  // No force flag and timer running - return error
  return { switched: false, message: 'timer-running' };
}
