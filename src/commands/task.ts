/**
 * @deprecated This module is deprecated. Import from '../cli/commands/task.js' instead.
 * This file re-exports from the new location for backward compatibility.
 */
export {
  findProjectByName,
  addTask,
  listTasks,
  taskRepository,
  SupabaseTaskRepository,
  createTaskRepository,
} from '../cli/commands/task.js';
export type { Task } from '../cli/commands/task.js';
