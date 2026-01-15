/**
 * @deprecated This module is deprecated. Import from '../cli/commands/project.js' instead.
 * This file re-exports from the new location for backward compatibility.
 */
export {
  findClientByName,
  addProject,
  listProjects,
  listProjectsByClient,
} from '../cli/commands/project.js';
export type { Project } from '../cli/commands/project.js';
