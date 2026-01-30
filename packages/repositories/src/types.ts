/**
 * Repository types for the time-tracker application.
 *
 * Interfaces are defined in @time-tracker/core to avoid circular dependencies.
 * This file re-exports them for convenience and defines the RepositoryError class.
 */

// Re-export interfaces from core
export type {
  Repository,
  ClientRepository,
  ProjectRepository,
  TaskRepository,
  TimeEntryRepository,
  AuthRepository,
  AuthUser,
  AuthSession,
  AuthStateChangeCallback,
  AuthUnsubscribe,
} from '@time-tracker/core';

/**
 * Custom error class for repository operations.
 */
export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryError';
  }
}
