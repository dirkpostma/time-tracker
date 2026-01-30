// Repository interfaces and types
export {
  RepositoryError,
  type Repository,
  type ClientRepository,
  type ProjectRepository,
  type TaskRepository,
  type TimeEntryRepository,
  type AuthRepository,
  type AuthUser,
  type AuthSession,
  type AuthStateChangeCallback,
  type AuthUnsubscribe,
} from './types.js';

// Re-export domain types from core that are needed by consumers
export type { TimeEntryWithRelationNames } from '@time-tracker/core';

// Supabase implementations
export { SupabaseClientRepository, createClientRepository } from './supabase/client.js';
export { SupabaseProjectRepository, createProjectRepository } from './supabase/project.js';
export { SupabaseTaskRepository, createTaskRepository } from './supabase/task.js';
export { SupabaseTimeEntryRepository } from './supabase/timeEntry.js';
export { SupabaseAuthRepository, createAuthRepository } from './supabase/auth.js';

// Supabase connection (config exports removed - use direct import from ./supabase/config.js for CLI)
// Note: getConfig/saveConfig use Node.js fs module, so they can't be exported from the main
// index which is used by React Native. CLI should import from '@time-tracker/repositories/supabase/config'
export {
  getSupabaseClient,
  setSupabaseClient,
  clearSupabaseClient,
  formatSupabaseError,
  initSupabaseClient,
  type InitSupabaseClientOptions,
} from './supabase/connection.js';

// Storage adapter for cross-platform compatibility
export type { StorageAdapter } from './supabase/storage.js';
