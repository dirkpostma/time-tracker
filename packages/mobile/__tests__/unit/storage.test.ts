/**
 * Unit tests for storage utility functions
 * Tests AsyncStorage wrapper for recent selections
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getRecentSelection,
  saveRecentSelection,
  clearRecentSelection,
  RecentSelection,
} from '../../src/lib/storage';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Storage - Recent Selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecentSelection', () => {
    it('returns null when no stored selection', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const selection = await getRecentSelection();

      expect(selection).toBeNull();
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@time_tracker/recent_selection');
    });

    it('returns parsed selection when stored', async () => {
      const storedSelection: RecentSelection = {
        clientId: 'client-123',
        clientName: 'Acme Corp',
        projectId: 'project-456',
        projectName: 'Website',
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedSelection));

      const selection = await getRecentSelection();

      expect(selection).toEqual(storedSelection);
    });

    it('returns selection with optional fields omitted', async () => {
      const storedSelection: RecentSelection = {
        clientId: 'client-123',
        clientName: 'Acme Corp',
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedSelection));

      const selection = await getRecentSelection();

      expect(selection).toEqual(storedSelection);
      expect(selection?.projectId).toBeUndefined();
      expect(selection?.taskId).toBeUndefined();
    });

    it('returns null on storage error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const selection = await getRecentSelection();

      expect(selection).toBeNull();
    });
  });

  describe('saveRecentSelection', () => {
    it('saves selection to AsyncStorage', async () => {
      const selection: RecentSelection = {
        clientId: 'client-123',
        clientName: 'Acme Corp',
        projectId: 'project-456',
        projectName: 'Website',
        taskId: 'task-789',
        taskName: 'Frontend',
      };

      await saveRecentSelection(selection);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@time_tracker/recent_selection',
        JSON.stringify(selection)
      );
    });

    it('handles storage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const selection: RecentSelection = {
        clientId: 'client-123',
        clientName: 'Acme Corp',
      };

      // Should not throw
      await expect(saveRecentSelection(selection)).resolves.toBeUndefined();
    });
  });

  describe('clearRecentSelection', () => {
    it('removes selection from AsyncStorage', async () => {
      await clearRecentSelection();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@time_tracker/recent_selection');
    });

    it('handles storage errors gracefully', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(clearRecentSelection()).resolves.toBeUndefined();
    });
  });
});
