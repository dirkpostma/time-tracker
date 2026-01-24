import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { TimeEntry, Client, Project, Task, TimerSelection } from '../types/timer';
import { useRecentSelection } from './useRecentSelection';

export function useTimer() {
  const { selection, updateSelection } = useRecentSelection();
  const [running, setRunning] = useState<TimeEntry | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [description, setDescription] = useState('');
  const descriptionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRunningTimer = useCallback(async () => {
    setLoading(true);
    try {
      const { data: entries, error } = await supabase
        .from('time_entries')
        .select('*')
        .is('ended_at', null)
        .limit(1);

      if (error) throw error;

      if (entries && entries.length > 0) {
        const entry = entries[0] as TimeEntry;
        setRunning(entry);
        setDescription(entry.description || '');

        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', entry.client_id)
          .single();

        if (clientData) {
          setClient(clientData as Client);
        }
      } else {
        setRunning(null);
        setClient(null);
        setDescription('');
      }
    } catch (error) {
      console.error('Error fetching timer:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
        await supabase
          .from('time_entries')
          .update({ description: text || null })
          .eq('id', running.id);
      } catch (error) {
        console.error('Error saving description:', error);
      }
    },
    [running]
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
        const entryData: Record<string, unknown> = {
          client_id: timerSelection.clientId,
          started_at: new Date().toISOString(),
        };

        if (timerSelection.projectId) entryData.project_id = timerSelection.projectId;
        if (timerSelection.taskId) entryData.task_id = timerSelection.taskId;

        const { data: entry, error } = await supabase
          .from('time_entries')
          .insert(entryData)
          .select()
          .single();

        if (error) throw error;

        setRunning(entry as TimeEntry);
        setClient({ id: timerSelection.clientId, name: timerSelection.clientName });
        if (timerSelection.projectId && timerSelection.projectName) {
          setProject({ id: timerSelection.projectId, name: timerSelection.projectName });
        }
        if (timerSelection.taskId && timerSelection.taskName) {
          setTask({ id: timerSelection.taskId, name: timerSelection.taskName });
        }

        await updateSelection(timerSelection);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to start timer';
        Alert.alert('Error', message);
      } finally {
        setActionLoading(false);
      }
    },
    [updateSelection]
  );

  const stopTimer = useCallback(async () => {
    if (!running) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', running.id);

      if (error) throw error;
      setRunning(null);
      setClient(null);
      setProject(null);
      setTask(null);
      setElapsed(0);
      setDescription('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to stop timer';
      Alert.alert('Error', message);
    } finally {
      setActionLoading(false);
    }
  }, [running]);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

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
