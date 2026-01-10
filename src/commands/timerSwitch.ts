import { confirm } from '@inquirer/prompts';
import { getStatus, startTimer, TimerStatus } from './timeEntry.js';

export interface SwitchResult {
  switched: boolean;
  stoppedTimer?: TimerStatus;
  message: string;
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
  options?: {
    force?: boolean;
    interactive?: boolean;
    confirmFn?: typeof confirm;
  }
): Promise<SwitchResult> {
  const runningStatus = await getStatus();
  const confirmFn = options?.confirmFn ?? confirm;
  const isInteractive = options?.interactive ?? process.stdin.isTTY;

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

  if (!isInteractive) {
    return { switched: false, message: 'non-interactive' };
  }

  // Interactive: prompt user
  const shouldSwitch = await confirmFn({
    message: 'Stop it and start a new one?',
  });

  if (!shouldSwitch) {
    return { switched: false, message: 'declined' };
  }

  await startTimer(clientId, projectId, taskId, description, true);
  return { switched: true, stoppedTimer: runningStatus, message: 'switched' };
}
