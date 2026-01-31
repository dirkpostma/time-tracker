/**
 * Core domain types for the time-tracker application.
 * These types represent the data model: Client > Project > Task > TimeEntry
 */

export interface Client {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  client_id: string;
  project_id: string | null;
  task_id: string | null;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input types for creating entities (without auto-generated fields)
 */
export interface CreateClientInput {
  name: string;
}

export interface CreateProjectInput {
  name: string;
  client_id: string;
}

export interface CreateTaskInput {
  name: string;
  project_id: string;
}

export interface CreateTimeEntryInput {
  client_id: string;
  project_id?: string | null;
  task_id?: string | null;
  description?: string | null;
  started_at?: string;
}

export interface UpdateTimeEntryInput {
  description?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
}

/**
 * TimeEntry with related entities resolved.
 * Used for displaying timer status with full context.
 */
export interface TimeEntryWithRelations {
  entry: TimeEntry;
  client: Client;
  project: Project | null;
  task: Task | null;
}

/**
 * TimeEntry with just the relation names (not full entities).
 * Used for list displays where only names are needed.
 * More efficient than TimeEntryWithRelations for mobile/UI use cases.
 */
export interface TimeEntryWithRelationNames extends TimeEntry {
  client_name: string;
  project_name: string | null;
  task_name: string | null;
}
