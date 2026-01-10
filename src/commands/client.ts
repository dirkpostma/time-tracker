import { getSupabaseClient } from '../db/client.js';

export interface Client {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function addClient(name: string): Promise<Client> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('clients')
    .insert({ name })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create client: ${error.message}`);
  }

  return data;
}

export async function listClients(): Promise<Client[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Failed to list clients: ${error.message}`);
  }

  return data || [];
}
