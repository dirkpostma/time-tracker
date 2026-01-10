import { getSupabaseClient } from '../db/client.js';
import { Client } from './client.js';
import { Project } from './project.js';
import { Task } from './task.js';

export interface TimeEntry {
  id: string;
  project_id: string;
  task_id: string | null;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimerStatus {
  entry: TimeEntry;
  project: Project;
  client: Client;
  task: Task | null;
  duration: number; // in seconds
}

export async function getRunningTimer(): Promise<TimeEntry | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .is('ended_at', null)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get running timer: ${error.message}`);
  }

  return data;
}

export async function startTimer(
  projectId: string,
  taskId?: string,
  description?: string
): Promise<TimeEntry> {
  const supabase = getSupabaseClient();

  // Check if timer already running
  const running = await getRunningTimer();
  if (running) {
    throw new Error('Timer already running. Stop it first.');
  }

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      project_id: projectId,
      task_id: taskId || null,
      description: description || null,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to start timer: ${error.message}`);
  }

  return data;
}

export async function stopTimer(description?: string): Promise<TimeEntry> {
  const supabase = getSupabaseClient();

  const running = await getRunningTimer();
  if (!running) {
    throw new Error('No timer running');
  }

  const updateData: { ended_at: string; description?: string } = {
    ended_at: new Date().toISOString(),
  };

  // Set description if provided (overwrites existing)
  if (description !== undefined) {
    updateData.description = description;
  }

  const { data, error } = await supabase
    .from('time_entries')
    .update(updateData)
    .eq('id', running.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to stop timer: ${error.message}`);
  }

  return data;
}

export async function getStatus(): Promise<TimerStatus | null> {
  const supabase = getSupabaseClient();

  const running = await getRunningTimer();
  if (!running) {
    return null;
  }

  // Get project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', running.project_id)
    .single();

  if (projectError || !project) {
    throw new Error('Failed to get project info');
  }

  // Get client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', project.client_id)
    .single();

  if (clientError || !client) {
    throw new Error('Failed to get client info');
  }

  // Get task if present
  let task: Task | null = null;
  if (running.task_id) {
    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', running.task_id)
      .single();
    task = taskData;
  }

  // Calculate duration
  const startTime = new Date(running.started_at).getTime();
  const now = Date.now();
  const duration = Math.floor((now - startTime) / 1000);

  return {
    entry: running,
    project,
    client,
    task,
    duration,
  };
}
