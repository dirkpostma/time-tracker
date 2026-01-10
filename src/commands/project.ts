import { getSupabaseClient } from '../db/client.js';
import { Client } from './client.js';

export interface Project {
  id: string;
  client_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function findClientByName(name: string): Promise<Client | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('name', name)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find client: ${error.message}`);
  }

  return data;
}

export async function addProject(name: string, clientId: string): Promise<Project> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('projects')
    .insert({ name, client_id: clientId })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return data;
}

export async function listProjects(): Promise<Project[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Failed to list projects: ${error.message}`);
  }

  return data || [];
}
