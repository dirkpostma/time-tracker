// Repository interfaces and types
export {
  RepositoryError,
  type Repository,
  type ClientRepository,
  type ProjectRepository,
  type TaskRepository,
  type TimeEntryRepository,
} from './types.js';

// Supabase implementations
export { SupabaseClientRepository, createClientRepository } from './supabase/client.js';
export { SupabaseProjectRepository, createProjectRepository } from './supabase/project.js';
export { SupabaseTaskRepository, createTaskRepository } from './supabase/task.js';
export { SupabaseTimeEntryRepository } from './supabase/timeEntry.js';

// Supabase configuration and connection
export { getConfig, saveConfig, getConfigPath, type Config } from './supabase/config.js';
export { getSupabaseClient, formatSupabaseError } from './supabase/connection.js';
