import { useState, useCallback } from 'react';
import { SupabaseTimeEntryRepository } from '../lib/repositories';
import type { UpdateTimeEntryInput } from '@time-tracker/core';

const timeEntryRepo = new SupabaseTimeEntryRepository();

export function useUpdateTimeEntry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEntry = useCallback(async (id: string, input: UpdateTimeEntryInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await timeEntryRepo.update(id, input);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update time entry';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateEntry,
    loading,
    error,
  };
}
