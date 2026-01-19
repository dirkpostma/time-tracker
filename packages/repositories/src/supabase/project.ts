import { getSupabaseClient } from './connection.js';
import { RepositoryError, type ProjectRepository } from '../types.js';
import type { Project, CreateProjectInput } from '@time-tracker/core';

/**
 * Supabase implementation of ProjectRepository.
 * Provides CRUD operations for Project entities using Supabase as the backend.
 */
export class SupabaseProjectRepository implements ProjectRepository {
  /**
   * Creates a new project.
   * @param input - The data for creating the project
   * @returns The created project
   * @throws RepositoryError if creation fails
   */
  async create(input: CreateProjectInput): Promise<Project> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('projects')
      .insert({ name: input.name, client_id: input.client_id })
      .select()
      .single();

    if (error) {
      throw new RepositoryError(`Failed to create project: ${error.message}`);
    }

    return data;
  }

  /**
   * Finds a project by its ID.
   * @param id - The project ID
   * @returns The project if found, null otherwise
   * @throws RepositoryError if the query fails
   */
  async findById(id: string): Promise<Project | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new RepositoryError(`Failed to find project: ${error.message}`);
    }

    return data;
  }

  /**
   * Finds a project by its name within a specific client.
   * @param name - The project name to search for
   * @param clientId - The client ID to search within
   * @returns The project if found, null otherwise
   * @throws RepositoryError if the query fails
   */
  async findByName(name: string, clientId: string): Promise<Project | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('name', name)
      .eq('client_id', clientId)
      .maybeSingle();

    if (error) {
      throw new RepositoryError(`Failed to find project by name: ${error.message}`);
    }

    return data;
  }

  /**
   * Finds all projects belonging to a specific client.
   * @param clientId - The client ID to search for
   * @returns An array of projects belonging to the client
   * @throws RepositoryError if the query fails
   */
  async findByClientId(clientId: string): Promise<Project[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .order('name');

    if (error) {
      throw new RepositoryError(`Failed to find projects by client: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Retrieves all projects.
   * @returns An array of all projects
   * @throws RepositoryError if the query fails
   */
  async findAll(): Promise<Project[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name');

    if (error) {
      throw new RepositoryError(`Failed to list projects: ${error.message}`);
    }

    return data || [];
  }
}

/**
 * Factory function to create a SupabaseProjectRepository instance.
 * @returns A new SupabaseProjectRepository
 */
export function createProjectRepository(): ProjectRepository {
  return new SupabaseProjectRepository();
}
