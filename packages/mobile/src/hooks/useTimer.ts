import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Alert } from 'react-native';
import { createTimeEntryRepository } from '../lib/repositories';
import { Client, Project, Task, TimerSelection } from '../types/timer';
import { useRecentSelection } from './useRecentSelection';
import type { TimeEntryWithRelationNames } from '@time-tracker/core';

export function useTimer() {
  const { selection, updateSelection } = useRecentSelection();
  const [running, setRunning] = useState<TimeEntryWithRelationNames | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [description, setDescription] = useState('');
  const descriptionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeEntryRepo = useMemo(() => createTimeEntryRepository(), []);

  const fetchRunningTimer = useCallback(async () => {
    setLoading(true);
    try {
      const entry = await timeEntryRepo.findRunningWithRelations();

      if (entry) {
        setRunning(entry);
        setDescription(entry.description || '');
      } else {
        setRunning(null);
        setDescription('');
      }
    } catch (error) {
      console.error('Error fetching timer:', error);
    } finally {
      setLoading(false);
    }
  }, [timeEntryRepo]);

  useEffect(() => {
    fetchRunningTimer();
  }, [fetchRunningTimer]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchRunningTimer();
    } finally {
      setRefreshing(false);
    }
  }, [fetchRunningTimer]);

  // Save description with debounce
  const saveDescription = useCallback(
    async (text: string) => {
      if (!running) return;
      try {
        await timeEntryRepo.update(running.id, { description: text || null });
      } catch (error) {
        console.error('Error saving description:', error);
      }
    },
    [running, timeEntryRepo]
  );

  const handleDescriptionChange = useCallback(
    (text: string) => {
      setDescription(text);

      if (descriptionDebounceRef.current) {
        clearTimeout(descriptionDebounceRef.current);
      }

      descriptionDebounceRef.current = setTimeout(() => {
        saveDescription(text);
      }, 500);
    },
    [saveDescription]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (descriptionDebounceRef.current) {
        clearTimeout(descriptionDebounceRef.current);
      }
    };
  }, []);

  // Update elapsed time every second
  useEffect(() => {
    if (!running) {
      setElapsed(0);
      return;
    }

    const updateElapsed = () => {
      const started = new Date(running.started_at).getTime();
      const now = Date.now();
      setElapsed(Math.floor((now - started) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const startTimer = useCallback(
    async (timerSelection: TimerSelection) => {
      setActionLoading(true);
      try {
        const entry = await timeEntryRepo.create({
          client_id: timerSelection.clientId,
          project_id: timerSelection.projectId ?? null,
          task_id: timerSelection.taskId ?? null,
        });

        // Set running entry with relation names from the selection
        setRunning({
          ...entry,
          client_name: timerSelection.clientName,
          project_name: timerSelection.projectName ?? null,
          task_name: timerSelection.taskName ?? null,
        });

        await updateSelection(timerSelection);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to start timer';
        Alert.alert('Error', message);
      } finally {
        setActionLoading(false);
      }
    },
    [updateSelection, timeEntryRepo]
  );

  const stopTimer = useCallback(async () => {
    if (!running) return;

    setActionLoading(true);
    try {
      await timeEntryRepo.stop(running.id);
      setRunning(null);
      setElapsed(0);
      setDescription('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to stop timer';
      Alert.alert('Error', message);
    } finally {
      setActionLoading(false);
    }
  }, [running, timeEntryRepo]);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  // Derive client/project/task from running entry for backwards compatibility
  const client = running ? { id: running.client_id, name: running.client_name } : null;
  const project = running?.project_id ? { id: running.project_id, name: running.project_name ?? '' } : null;
  const task = running?.task_id ? { id: running.task_id, name: running.task_name ?? '' } : null;

  return {
    // State
    running,
    client,
    project,
    task,
    elapsed,
    loading,
    actionLoading,
    refreshing,
    description,
    selection,

    // Actions
    startTimer,
    stopTimer,
    onRefresh,
    handleDescriptionChange,
    formatTime,
  };
}
