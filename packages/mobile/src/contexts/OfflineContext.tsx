import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { supabase } from '../lib/supabase';
import {
  QueuedAction,
  ActionType,
  getQueue,
  addToQueue,
  removeFromQueue,
  incrementRetry,
} from '../lib/offlineQueue';
import {
  CachedTimer,
  getCachedTimer,
  saveCachedTimer,
  clearCachedTimer,
} from '../lib/offlineStorage';

interface OfflineContextValue {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: number;
  cachedTimer: CachedTimer | null;
  queueAction: (type: ActionType, payload: Record<string, unknown>) => Promise<void>;
  setCachedTimer: (timer: CachedTimer | null) => Promise<void>;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

const MAX_RETRIES = 3;

export function OfflineProvider({ children }: { children: ReactNode }) {
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);
  const [cachedTimer, setCachedTimerState] = useState<CachedTimer | null>(null);

  // Load initial state
  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    const queue = await getQueue();
    setPendingActions(queue.length);

    const timer = await getCachedTimer();
    setCachedTimerState(timer);
  };

  // Sync when coming online
  useEffect(() => {
    if (isOnline && pendingActions > 0) {
      syncNow();
    }
  }, [isOnline]);

  const queueAction = useCallback(async (type: ActionType, payload: Record<string, unknown>) => {
    await addToQueue(type, payload);
    const queue = await getQueue();
    setPendingActions(queue.length);
  }, []);

  const setCachedTimer = useCallback(async (timer: CachedTimer | null) => {
    if (timer) {
      await saveCachedTimer(timer);
    } else {
      await clearCachedTimer();
    }
    setCachedTimerState(timer);
  }, []);

  const processAction = async (action: QueuedAction): Promise<boolean> => {
    try {
      switch (action.type) {
        case 'start_timer': {
          const entryData: Record<string, unknown> = {
            client_id: action.payload.clientId,
            started_at: action.payload.startedAt,
          };
          if (action.payload.projectId) entryData.project_id = action.payload.projectId;
          if (action.payload.taskId) entryData.task_id = action.payload.taskId;
          if (action.payload.description) entryData.description = action.payload.description;

          const { error } = await supabase
            .from('time_entries')
            .insert(entryData);

          if (error) throw error;
          return true;
        }

        case 'stop_timer': {
          const { error } = await supabase
            .from('time_entries')
            .update({ ended_at: action.payload.endedAt })
            .eq('id', action.payload.entryId);

          if (error) throw error;
          return true;
        }

        case 'update_description': {
          const { error } = await supabase
            .from('time_entries')
            .update({ description: action.payload.description })
            .eq('id', action.payload.entryId);

          if (error) throw error;
          return true;
        }

        default:
          console.error('Unknown action type:', action.type);
          return false;
      }
    } catch (error) {
      console.error('Error processing action:', error);
      return false;
    }
  };

  const syncNow = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);

    try {
      const queue = await getQueue();

      for (const action of queue) {
        if (action.retryCount >= MAX_RETRIES) {
          // Skip actions that have exceeded retry limit
          continue;
        }

        const success = await processAction(action);

        if (success) {
          await removeFromQueue(action.id);
        } else {
          await incrementRetry(action.id);
        }
      }

      // Refresh pending count
      const updatedQueue = await getQueue();
      setPendingActions(updatedQueue.length);

      // Clear local cache if sync successful
      if (updatedQueue.length === 0) {
        await clearCachedTimer();
        setCachedTimerState(null);
      }
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingActions,
        cachedTimer,
        queueAction,
        setCachedTimer,
        syncNow,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
