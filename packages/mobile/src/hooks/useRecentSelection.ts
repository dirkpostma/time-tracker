import { useState, useEffect, useCallback } from 'react';
import {
  RecentSelection,
  getRecentSelection,
  saveRecentSelection,
  clearRecentSelection,
} from '../lib/storage';

export function useRecentSelection() {
  const [selection, setSelection] = useState<RecentSelection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSelection();
  }, []);

  const loadSelection = async () => {
    setLoading(true);
    try {
      const stored = await getRecentSelection();
      setSelection(stored);
    } finally {
      setLoading(false);
    }
  };

  const updateSelection = useCallback(async (newSelection: RecentSelection) => {
    setSelection(newSelection);
    await saveRecentSelection(newSelection);
  }, []);

  const clearSelection = useCallback(async () => {
    setSelection(null);
    await clearRecentSelection();
  }, []);

  return {
    selection,
    loading,
    updateSelection,
    clearSelection,
    refresh: loadSelection,
  };
}
