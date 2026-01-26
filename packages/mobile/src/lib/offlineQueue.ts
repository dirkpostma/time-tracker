import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = '@time_tracker/offline_queue';

export type ActionType = 'start_timer' | 'stop_timer' | 'update_description';

export interface QueuedAction {
  id: string;
  type: ActionType;
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function getQueue(): Promise<QueuedAction[]> {
  try {
    const value = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return [];
  } catch (error) {
    console.error('Error loading offline queue:', error);
    return [];
  }
}

export async function addToQueue(type: ActionType, payload: Record<string, unknown>): Promise<QueuedAction> {
  const action: QueuedAction = {
    id: generateId(),
    type,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  try {
    const queue = await getQueue();
    queue.push(action);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to offline queue:', error);
  }

  return action;
}

export async function removeFromQueue(actionId: string): Promise<void> {
  try {
    const queue = await getQueue();
    const filtered = queue.filter((action) => action.id !== actionId);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from offline queue:', error);
  }
}

export async function incrementRetry(actionId: string): Promise<void> {
  try {
    const queue = await getQueue();
    const updated = queue.map((action) => {
      if (action.id === actionId) {
        return { ...action, retryCount: action.retryCount + 1 };
      }
      return action;
    });
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating retry count:', error);
  }
}

export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing offline queue:', error);
  }
}
