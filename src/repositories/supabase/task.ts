import { getSupabaseClient } from '../../db/client.js';
import type { Task, CreateTaskInput } from '../../core/types.js';
import type { TaskRepository } from '../types.js';
import { RepositoryError } from '../types.js';

/**
 * Supabase implementation of the TaskRepository interface.
 * Provides CRUD operations for Task entities using Supabase as the data store.
 */
export class SupabaseTaskRepository implements TaskRepository {
  /**
   * Creates a new task.
   * @param input - The data for creating the task
   * @returns The created task
   * @throws RepositoryError if creation fails
   */
  async create(input: CreateTaskInput): Promise<Task> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        name: input.name,
        project_id: input.project_id,
      })
      .select()
      .single();

    if (error) {
      throw new RepositoryError(
        `Failed to create task: ${error.message}`,
        'create',
        'task',
        new Error(error.message)
      );
    }

    return data;
  }

  /**
   * Finds a task by its ID.
   * @param id - The task ID
   * @returns The task if found, null otherwise
   * @throws RepositoryError if the query fails
   */
  async findById(id: string): Promise<Task | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new RepositoryError(
        `Failed to find task: ${error.message}`,
        'findById',
        'task',
        new Error(error.message)
      );
    }

    return data;
  }

  /**
   * Finds a task by its name within a specific project.
   * @param name - The task name to search for
   * @param projectId - The project ID to search within
   * @returns The task if found, null otherwise
   * @throws RepositoryError if the query fails
   */
  async findByName(name: string, projectId: string): Promise<Task | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('name', name)
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) {
      throw new RepositoryError(
        `Failed to find task by name: ${error.message}`,
        'findByName',
        'task',
        new Error(error.message)
      );
    }

    return data;
  }

  /**
   * Finds all tasks belonging to a specific project.
   * @param projectId - The project ID to search for
   * @returns An array of tasks belonging to the project
   * @throws RepositoryError if the query fails
   */
  async findByProjectId(projectId: string): Promise<Task[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('name');

    if (error) {
      throw new RepositoryError(
        `Failed to find tasks by project: ${error.message}`,
        'findByProjectId',
        'task',
        new Error(error.message)
      );
    }

    return data || [];
  }

  /**
   * Retrieves all tasks.
   * @returns An array of all tasks
   * @throws RepositoryError if the query fails
   */
  async findAll(): Promise<Task[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('name');

    if (error) {
      throw new RepositoryError(
        `Failed to find all tasks: ${error.message}`,
        'findAll',
        'task',
        new Error(error.message)
      );
    }

    return data || [];
  }
}

/**
 * Factory function to create a new SupabaseTaskRepository instance.
 * @returns A new TaskRepository implementation
 */
export function createTaskRepository(): TaskRepository {
  return new SupabaseTaskRepository();
}
