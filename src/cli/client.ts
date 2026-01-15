/**
 * CLI command handlers for client operations.
 * These are thin wrappers that:
 * - Parse CLI input
 * - Call repository functions
 * - Format and print output
 * - Handle errors with user-friendly messages
 */

import type { Client } from '../core/types.js';
import { createClientRepository } from '../repositories/supabase/client.js';

// Re-export Client type for backward compatibility
export type { Client } from '../core/types.js';

export async function addClient(name: string): Promise<Client> {
  const repository = createClientRepository();
  return repository.create({ name });
}

export async function listClients(): Promise<Client[]> {
  const repository = createClientRepository();
  return repository.findAll();
}
