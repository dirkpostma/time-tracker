/**
 * Repository interfaces for the time-tracker application.
 * These provide an abstraction over data access, allowing different implementations
 * (e.g., Supabase, in-memory, etc.) to be swapped without changing business logic.
 *
 * These interfaces live in core to avoid circular dependencies - core/timer.ts
 * depends on TimeEntryRepository, and repositories depend on core types.
 */

import type {
  Client,
  Project,
  Task,
  TimeEntry,
  TimeEntryWithRelationNames,
  CreateClientInput,
  CreateProjectInput,
  CreateTaskInput,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
} from './types.js';

/**
 * Generic repository interface with common CRUD operations.
 * Can be used as a base for entity-specific repositories.
 *
 * @typeParam T - The entity type
 * @typeParam CreateInput - The input type for creating entities
 */
export interface Repository<T, CreateInput> {
  /**
   * Creates a new entity.
   * @param input - The data for creating the entity
   * @returns The created entity
   * @throws RepositoryError if creation fails
   */
  create(input: CreateInput): Promise<T>;

  /**
   * Finds an entity by its ID.
   * @param id - The entity ID
   * @returns The entity if found, null otherwise
   * @throws RepositoryError if the query fails
   */
  findById(id: string): Promise<T | null>;

  /**
   * Retrieves all entities.
   * @returns An array of all entities
   * @throws RepositoryError if the query fails
   */
  findAll(): Promise<T[]>;
}

/**
 * Repository interface for Client entities.
 */
export interface ClientRepository extends Repository<Client, CreateClientInput> {
  /**
   * Finds a client by its exact name.
   * @param name - The client name to search for
   * @returns The client if found, null otherwise
   * @throws RepositoryError if the query fails
   */
  findByName(name: string): Promise<Client | null>;
}

/**
 * Repository interface for Project entities.
 */
export interface ProjectRepository extends Repository<Project, CreateProjectInput> {
  /**
   * Finds a project by its name within a specific client.
   * @param name - The project name to search for
   * @param clientId - The client ID to search within
   * @returns The project if found, null otherwise
   * @throws RepositoryError if the query fails
   */
  findByName(name: string, clientId: string): Promise<Project | null>;

  /**
   * Finds all projects belonging to a specific client.
   * @param clientId - The client ID to search for
   * @returns An array of projects belonging to the client
   * @throws RepositoryError if the query fails
   */
  findByClientId(clientId: string): Promise<Project[]>;
}

/**
 * Repository interface for Task entities.
 */
export interface TaskRepository extends Repository<Task, CreateTaskInput> {
  /**
   * Finds a task by its name within a specific project.
   * @param name - The task name to search for
   * @param projectId - The project ID to search within
   * @returns The task if found, null otherwise
   * @throws RepositoryError if the query fails
   */
  findByName(name: string, projectId: string): Promise<Task | null>;

  /**
   * Finds all tasks belonging to a specific project.
   * @param projectId - The project ID to search for
   * @returns An array of tasks belonging to the project
   * @throws RepositoryError if the query fails
   */
  findByProjectId(projectId: string): Promise<Task[]>;
}

/**
 * Repository interface for TimeEntry entities.
 */
export interface TimeEntryRepository {
  /**
   * Creates a new time entry.
   * @param input - The data for creating the time entry
   * @returns The created time entry
   * @throws RepositoryError if creation fails
   */
  create(input: CreateTimeEntryInput): Promise<TimeEntry>;

  /**
   * Updates an existing time entry.
   * @param id - The time entry ID
   * @param input - The fields to update
   * @returns The updated time entry
   * @throws RepositoryError if update fails or entry not found
   */
  update(id: string, input: UpdateTimeEntryInput): Promise<TimeEntry>;

  /**
   * Finds a time entry by its ID.
   * @param id - The time entry ID
   * @returns The time entry if found, null otherwise
   * @throws RepositoryError if the query fails
   */
  findById(id: string): Promise<TimeEntry | null>;

  /**
   * Finds the currently running time entry (one without an ended_at timestamp).
   * @returns The running time entry if one exists, null otherwise
   * @throws RepositoryError if the query fails
   */
  findRunning(): Promise<TimeEntry | null>;

  /**
   * Finds all time entries within a date range.
   * @param startDate - The start of the date range (inclusive)
   * @param endDate - The end of the date range (inclusive)
   * @returns An array of time entries within the range
   * @throws RepositoryError if the query fails
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]>;

  /**
   * Stops a running time entry by setting its ended_at timestamp.
   * @param id - The time entry ID to stop
   * @returns The stopped time entry
   * @throws RepositoryError if stop fails or entry not found
   */
  stop(id: string): Promise<TimeEntry>;

  /**
   * Finds recent time entries with their relation names (client, project, task).
   * Uses JOINs to avoid N+1 queries.
   * @param limit - Maximum number of entries to return
   * @returns An array of time entries with relation names, ordered by started_at descending
   * @throws RepositoryError if the query fails
   */
  findRecentWithRelations(limit: number): Promise<TimeEntryWithRelationNames[]>;

  /**
   * Finds the currently running time entry with its relation names.
   * Uses JOINs to avoid N+1 queries.
   * @returns The running time entry with relation names if one exists, null otherwise
   * @throws RepositoryError if the query fails
   */
  findRunningWithRelations(): Promise<TimeEntryWithRelationNames | null>;
}

/**
 * User type for authentication.
 * Platform-agnostic representation of an authenticated user.
 */
export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Session type for authentication.
 * Contains the user and token information.
 */
export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

/**
 * Callback for auth state changes.
 */
export type AuthStateChangeCallback = (
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_DELETED',
  session: AuthSession | null
) => void;

/**
 * Unsubscribe function returned by onAuthStateChange.
 */
export type AuthUnsubscribe = () => void;

/**
 * Repository interface for authentication operations.
 */
export interface AuthRepository {
  /**
   * Signs in with email and password.
   * @param email - User's email address
   * @param password - User's password
   * @returns The authenticated user
   * @throws RepositoryError if sign in fails
   */
  signIn(email: string, password: string): Promise<AuthUser>;

  /**
   * Signs up with email and password.
   * @param email - User's email address
   * @param password - User's password
   * @returns The created user
   * @throws RepositoryError if sign up fails
   */
  signUp(email: string, password: string): Promise<AuthUser>;

  /**
   * Signs out the current user.
   * @throws RepositoryError if sign out fails
   */
  signOut(): Promise<void>;

  /**
   * Sends a password reset email.
   * @param email - User's email address
   * @throws RepositoryError if request fails
   */
  resetPassword(email: string): Promise<void>;

  /**
   * Gets the current session.
   * @returns The current session if one exists, null otherwise
   */
  getSession(): Promise<AuthSession | null>;

  /**
   * Subscribes to auth state changes.
   * @param callback - Function to call when auth state changes
   * @returns An unsubscribe function
   */
  onAuthStateChange(callback: AuthStateChangeCallback): AuthUnsubscribe;

  /**
   * Deletes the current user's account.
   * @param password - User's password for verification
   * @throws RepositoryError if deletion fails or password is incorrect
   */
  deleteAccount(password: string): Promise<void>;
}
