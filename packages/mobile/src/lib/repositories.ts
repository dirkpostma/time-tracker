/**
 * Repository initialization for mobile app.
 * Sets up the Supabase client with expo-secure-store for auth session persistence.
 */

import * as SecureStore from 'expo-secure-store';
import {
  initSupabaseClient,
  type StorageAdapter,
  // Repository factories
  createClientRepository,
  createProjectRepository,
  createTaskRepository,
  createAuthRepository,
  // Repository classes (for direct instantiation if needed)
  SupabaseClientRepository,
  SupabaseProjectRepository,
  SupabaseTaskRepository,
  SupabaseTimeEntryRepository,
  SupabaseAuthRepository,
} from '@time-tracker/repositories';
import { env } from './env';

/**
 * Expo SecureStore adapter implementing StorageAdapter interface.
 * Provides secure storage for auth session tokens on mobile devices.
 */
const expoStorage: StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ignore errors on simulator/testing
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore errors
    }
  },
};

// Initialize the Supabase client at module load time
// This ensures repositories are ready when imported
initSupabaseClient(env.supabaseUrl, env.supabasePublishableKey, {
  storage: expoStorage,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
});

// Factory function for TimeEntryRepository (not exported from package)
export function createTimeEntryRepository(): SupabaseTimeEntryRepository {
  return new SupabaseTimeEntryRepository();
}

// Re-export repository factory functions for convenient access
export {
  createClientRepository,
  createProjectRepository,
  createTaskRepository,
  createAuthRepository,
  // Repository classes
  SupabaseClientRepository,
  SupabaseProjectRepository,
  SupabaseTaskRepository,
  SupabaseTimeEntryRepository,
  SupabaseAuthRepository,
};

// Re-export types that consumers might need
export type {
  ClientRepository,
  ProjectRepository,
  TaskRepository,
  TimeEntryRepository,
  AuthRepository,
  AuthUser,
  AuthSession,
} from '@time-tracker/repositories';
