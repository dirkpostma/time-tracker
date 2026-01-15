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
} from '@time-tracker/core';

/**
 * Custom error class for repository operations.
 * Provides context about what operation failed and on which entity.
 */
export class RepositoryError extends Error {
  readonly operation?: string;
  readonly entity?: string;
  readonly cause?: Error;

  constructor(
    message: string,
    operation?: string,
    entity?: string,
    cause?: Error
  ) {
    super(message);
    this.name = 'RepositoryError';
    this.operation = operation;
    this.entity = entity;
    this.cause = cause;
  }
}
