import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface TimeEntryDisplay {
  id: string;
  clientName: string;
  projectName?: string;
  taskName?: string;
  description?: string;
  startedAt: Date;
  endedAt: Date;
  duration: number;
}

export interface DayGroup {
  date: string;
  displayDate: string;
  totalDuration: number;
  entries: TimeEntryDisplay[];
}

function formatDisplayDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (entryDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (entryDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Check if within this week
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (entryDate > weekAgo) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  // Older dates
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function groupEntriesByDay(entries: TimeEntryDisplay[]): DayGroup[] {
  const groups: Map<string, DayGroup> = new Map();

  for (const entry of entries) {
    const dateKey = entry.startedAt.toISOString().split('T')[0];

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        date: dateKey,
        displayDate: formatDisplayDate(entry.startedAt),
        totalDuration: 0,
        entries: [],
      });
    }

    const group = groups.get(dateKey)!;
    group.entries.push(entry);
    group.totalDuration += entry.duration;
  }

  return Array.from(groups.values()).sort((a, b) => b.date.localeCompare(a.date));
}

export function useTimeEntries() {
  const [groups, setGroups] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          started_at,
          ended_at,
          description,
          clients (name),
          projects (name),
          tasks (name)
        `)
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const entries: TimeEntryDisplay[] = (data || []).map((entry: Record<string, unknown>) => {
        const startedAt = new Date(entry.started_at as string);
        const endedAt = new Date(entry.ended_at as string);
        const duration = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

        return {
          id: entry.id as string,
          clientName: (entry.clients as { name: string } | null)?.name || 'Unknown Client',
          projectName: (entry.projects as { name: string } | null)?.name,
          taskName: (entry.tasks as { name: string } | null)?.name,
          description: entry.description as string | undefined,
          startedAt,
          endedAt,
          duration,
        };
      });

      setGroups(groupEntriesByDay(entries));
    } catch (error) {
      console.error('Error fetching time entries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  }, [fetchEntries]);

  return {
    groups,
    loading,
    refreshing,
    refresh,
  };
}
