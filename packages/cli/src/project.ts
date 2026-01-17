/**
 * CLI command handlers for project operations.
 * These are thin wrappers that:
 * - Parse CLI input
 * - Call repository functions
 * - Format and print output
 * - Handle errors with user-friendly messages
 */

import type { Project } from '@time-tracker/core/types';
import type { Client } from '@time-tracker/core/types';
import { createProjectRepository } from '@time-tracker/repositories/supabase/project';
import { createClientRepository } from '@time-tracker/repositories/supabase/client';

// Re-export Project type for backward compatibility
export type { Project } from '@time-tracker/core/types';

export async function findClientByName(name: string): Promise<Client | null> {
  const repository = createClientRepository();
  return repository.findByName(name);
}

export async function addProject(name: string, clientId: string): Promise<Project> {
  const repository = createProjectRepository();
  return repository.create({ name, client_id: clientId });
}

export async function listProjects(): Promise<Project[]> {
  const repository = createProjectRepository();
  return repository.findAll();
}

export async function listProjectsByClient(clientId: string): Promise<Project[]> {
  const repository = createProjectRepository();
  return repository.findByClientId(clientId);
}
