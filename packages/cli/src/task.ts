/**
 * CLI command handlers for task operations.
 * These are thin wrappers that:
 * - Parse CLI input
 * - Call repository functions
 * - Format and print output
 * - Handle errors with user-friendly messages
 */

import { createProjectRepository } from '@time-tracker/repositories/supabase/project';
import { SupabaseTaskRepository, createTaskRepository } from '@time-tracker/repositories/supabase/task';
import type { Task, Project } from '@time-tracker/core/types';

// Re-export Task type for backward compatibility
export type { Task };

// Create a singleton repository instance
const taskRepository = createTaskRepository();

export async function findProjectByName(name: string, clientId: string): Promise<Project | null> {
  const projectRepository = createProjectRepository();
  return projectRepository.findByName(name, clientId);
}

export async function addTask(name: string, projectId: string): Promise<Task> {
  return taskRepository.create({ name, project_id: projectId });
}

export async function listTasks(projectId: string): Promise<Task[]> {
  return taskRepository.findByProjectId(projectId);
}

export async function findTaskByName(name: string, projectId: string): Promise<Task | null> {
  return taskRepository.findByName(name, projectId);
}

// Export the repository for direct access when needed
export { taskRepository, SupabaseTaskRepository, createTaskRepository };
