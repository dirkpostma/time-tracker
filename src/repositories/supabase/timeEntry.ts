import { getSupabaseClient, formatSupabaseError } from './connection.js';
import { RepositoryError, type TimeEntryRepository } from '../types.js';
import type {
  TimeEntry,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
} from '../../core/types.js';

/**
 * Supabase implementation of the TimeEntryRepository interface.
 * Handles all time entry operations against the Supabase database.
 */
export class SupabaseTimeEntryRepository implements TimeEntryRepository {
  /**
   * Creates a new time entry.
   * If started_at is not provided, uses the current timestamp.
   */
  async create(input: CreateTimeEntryInput): Promise<TimeEntry> {
    const supabase = getSupabaseClient();

    const insertData = {
      client_id: input.client_id,
      project_id: input.project_id ?? null,
      task_id: input.task_id ?? null,
      description: input.description ?? null,
      started_at: input.started_at ?? new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('time_entries')
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      throw new RepositoryError(
        `Failed to create time entry: ${formatSupabaseError(error?.message ?? 'Unknown error')}`,
        'create',
        'time_entry',
        error ? new Error(error.message) : undefined
      );
    }

    return data as TimeEntry;
  }

  /**
   * Updates an existing time entry.
   */
  async update(id: string, input: UpdateTimeEntryInput): Promise<TimeEntry> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('time_entries')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new RepositoryError(
        `Failed to update time entry: ${formatSupabaseError(error?.message ?? 'Entry not found')}`,
        'update',
        'time_entry',
        error ? new Error(error.message) : undefined
      );
    }

    return data as TimeEntry;
  }

  /**
   * Finds a time entry by its ID.
   */
  async findById(id: string): Promise<TimeEntry | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new RepositoryError(
        `Failed to find time entry: ${formatSupabaseError(error.message)}`,
        'findById',
        'time_entry',
        new Error(error.message)
      );
    }

    return data as TimeEntry | null;
  }

  /**
   * Finds the currently running time entry (one without an ended_at timestamp).
   */
  async findRunning(): Promise<TimeEntry | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .is('ended_at', null)
      .maybeSingle();

    if (error) {
      throw new RepositoryError(
        `Failed to find running time entry: ${formatSupabaseError(error.message)}`,
        'findRunning',
        'time_entry',
        new Error(error.message)
      );
    }

    return data as TimeEntry | null;
  }

  /**
   * Finds all time entries within a date range.
   * Uses started_at for filtering and orders results by started_at descending.
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())
      .order('started_at', { ascending: false });

    if (error) {
      throw new RepositoryError(
        `Failed to find time entries by date range: ${formatSupabaseError(error.message)}`,
        'findByDateRange',
        'time_entry',
        new Error(error.message)
      );
    }

    return (data ?? []) as TimeEntry[];
  }

  /**
   * Stops a running time entry by setting its ended_at timestamp to now.
   */
  async stop(id: string): Promise<TimeEntry> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('time_entries')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new RepositoryError(
        `Failed to stop time entry: ${formatSupabaseError(error?.message ?? 'Entry not found')}`,
        'stop',
        'time_entry',
        error ? new Error(error.message) : undefined
      );
    }

    return data as TimeEntry;
  }
}
