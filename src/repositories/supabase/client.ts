import { getSupabaseClient } from './connection.js';
import type { Client, CreateClientInput } from '../../core/types.js';
import type { ClientRepository } from '../types.js';
import { RepositoryError } from '../types.js';

/**
 * Supabase implementation of the ClientRepository interface.
 * Provides data access for Client entities using Supabase as the backend.
 */
export class SupabaseClientRepository implements ClientRepository {
  /**
   * Creates a new client.
   * @param input - The data for creating the client
   * @returns The created client
   * @throws RepositoryError if creation fails
   */
  async create(input: CreateClientInput): Promise<Client> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('clients')
      .insert({ name: input.name })
      .select()
      .single();

    if (error) {
      throw new RepositoryError(
        `Failed to create client: ${error.message}`,
        'create',
        'client',
        new Error(error.message)
      );
    }

    return data;
  }

  /**
   * Finds a client by its ID.
   * @param id - The client ID
   * @returns The client if found, null otherwise
   * @throws RepositoryError if the query fails
   */
  async findById(id: string): Promise<Client | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // PGRST116 means no rows returned, which is not an error for findById
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new RepositoryError(
        `Failed to find client by ID: ${error.message}`,
        'findById',
        'client',
        new Error(error.message)
      );
    }

    return data;
  }

  /**
   * Finds a client by its exact name.
   * @param name - The client name to search for
   * @returns The client if found, null otherwise
   * @throws RepositoryError if the query fails
   */
  async findByName(name: string): Promise<Client | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      // PGRST116 means no rows returned, which is not an error for findByName
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new RepositoryError(
        `Failed to find client by name: ${error.message}`,
        'findByName',
        'client',
        new Error(error.message)
      );
    }

    return data;
  }

  /**
   * Retrieves all clients, ordered by name.
   * @returns An array of all clients
   * @throws RepositoryError if the query fails
   */
  async findAll(): Promise<Client[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) {
      throw new RepositoryError(
        `Failed to list clients: ${error.message}`,
        'findAll',
        'client',
        new Error(error.message)
      );
    }

    return data || [];
  }
}

/**
 * Factory function to create a SupabaseClientRepository instance.
 * @returns A new SupabaseClientRepository
 */
export function createClientRepository(): ClientRepository {
  return new SupabaseClientRepository();
}
