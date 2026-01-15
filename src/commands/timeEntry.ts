/**
 * @deprecated This module is deprecated. Import from '../cli/commands/timeEntry.js' instead.
 * This file re-exports from the new location for backward compatibility.
 */
export {
  getRunningTimer,
  startTimer,
  stopTimer,
  getStatus,
} from '../cli/commands/timeEntry.js';
export type { TimeEntry, TimerStatus } from '../cli/commands/timeEntry.js';
