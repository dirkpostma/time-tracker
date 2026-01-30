/**
 * Storage adapter interface for Supabase auth session persistence.
 * This allows different platforms to provide their own storage implementation:
 * - Node.js/CLI: Uses default localStorage or file-based storage
 * - React Native: Can use expo-secure-store or AsyncStorage
 * - Web: Uses browser localStorage
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}
