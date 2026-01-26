import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHED_TIMER_KEY = '@time_tracker/cached_timer';

export interface CachedTimer {
  id?: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  description?: string;
  startedAt: string;
  isLocal: boolean; // true if not yet synced to server
}

export async function getCachedTimer(): Promise<CachedTimer | null> {
  try {
    const value = await AsyncStorage.getItem(CACHED_TIMER_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error('Error loading cached timer:', error);
    return null;
  }
}

export async function saveCachedTimer(timer: CachedTimer): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHED_TIMER_KEY, JSON.stringify(timer));
  } catch (error) {
    console.error('Error saving cached timer:', error);
  }
}

export async function clearCachedTimer(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHED_TIMER_KEY);
  } catch (error) {
    console.error('Error clearing cached timer:', error);
  }
}
