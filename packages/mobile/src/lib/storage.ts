import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SELECTION_KEY = '@time_tracker/recent_selection';

export interface RecentSelection {
  clientId: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
}

export async function getRecentSelection(): Promise<RecentSelection | null> {
  try {
    const value = await AsyncStorage.getItem(RECENT_SELECTION_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error('Error loading recent selection:', error);
    return null;
  }
}

export async function saveRecentSelection(selection: RecentSelection): Promise<void> {
  try {
    await AsyncStorage.setItem(RECENT_SELECTION_KEY, JSON.stringify(selection));
  } catch (error) {
    console.error('Error saving recent selection:', error);
  }
}

export async function clearRecentSelection(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENT_SELECTION_KEY);
  } catch (error) {
    console.error('Error clearing recent selection:', error);
  }
}
