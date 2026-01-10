import { getSupabaseClient } from '../db/client.js';
import { Project } from './project.js';

export interface Task {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function findProjectByName(name: string, clientId: string): Promise<Project | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('name', name)
    .eq('client_id', clientId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find project: ${error.message}`);
  }

  return data;
}

export async function addTask(name: string, projectId: string): Promise<Task> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tasks')
    .insert({ name, project_id: projectId })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return data;
}

export async function listTasks(projectId: string): Promise<Task[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('name');

  if (error) {
    throw new Error(`Failed to list tasks: ${error.message}`);
  }

  return data || [];
}
