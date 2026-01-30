import { useState, useEffect, useCallback } from 'react';
import { SupabaseTimeEntryRepository } from '../lib/repositories';
import type { TimeEntryWithRelationNames } from '@time-tracker/core';

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

// Create repository instance outside component to avoid recreating on every render
const timeEntryRepo = new SupabaseTimeEntryRepository();

export function useTimeEntries() {
  const [groups, setGroups] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const data: TimeEntryWithRelationNames[] = await timeEntryRepo.findRecentWithRelations(100);

      const entries: TimeEntryDisplay[] = data.map((entry) => {
        const startedAt = new Date(entry.started_at);
        const endedAt = new Date(entry.ended_at as string);
        const duration = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

        return {
          id: entry.id,
          clientName: entry.client_name,
          projectName: entry.project_name ?? undefined,
          taskName: entry.task_name ?? undefined,
          description: entry.description ?? undefined,
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
