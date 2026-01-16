/**
 * CLI command handlers for client operations.
 * These are thin wrappers that:
 * - Parse CLI input
 * - Call repository functions
 * - Format and print output
 * - Handle errors with user-friendly messages
 */

import type { Client } from '@time-tracker/core/types';
import { createClientRepository } from '@time-tracker/repositories/supabase/client';

// Re-export Client type for backward compatibility
export type { Client } from '@time-tracker/core/types';

export async function addClient(name: string): Promise<Client> {
  const repository = createClientRepository();
  return repository.create({ name });
}

export async function listClients(): Promise<Client[]> {
  const repository = createClientRepository();
  return repository.findAll();
}
