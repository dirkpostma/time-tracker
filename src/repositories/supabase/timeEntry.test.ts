import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseTimeEntryRepository } from './timeEntry.js';
import { RepositoryError } from '../types.js';
import type { TimeEntry, CreateTimeEntryInput, UpdateTimeEntryInput } from '../../core/types.js';

// Mock the Supabase client module
vi.mock('../../db/client.js', () => ({
  getSupabaseClient: vi.fn(),
  formatSupabaseError: vi.fn((err: Error | string) => {
    const message = err instanceof Error ? err.message : err;
    return message;
  }),
}));

import { getSupabaseClient } from '../../db/client.js';

describe('SupabaseTimeEntryRepository', () => {
  let repository: SupabaseTimeEntryRepository;
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  function createMockSupabase() {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
      order: vi.fn().mockReturnThis(),
    };

    return {
      from: vi.fn().mockReturnValue(mockChain),
      _chain: mockChain,
    };
  }

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof getSupabaseClient>);
    repository = new SupabaseTimeEntryRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockTimeEntry: TimeEntry = {
    id: 'entry-123',
    client_id: 'client-456',
    project_id: 'project-789',
    task_id: null,
    description: 'Working on feature',
    started_at: '2024-01-15T09:00:00.000Z',
    ended_at: null,
    created_at: '2024-01-15T09:00:00.000Z',
    updated_at: '2024-01-15T09:00:00.000Z',
  };

  describe('create', () => {
    it('should create a time entry successfully', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: mockTimeEntry,
        error: null,
      });

      const input: CreateTimeEntryInput = {
        client_id: 'client-456',
        project_id: 'project-789',
        description: 'Working on feature',
      };

      const result = await repository.create(input);

      expect(mockSupabase.from).toHaveBeenCalledWith('time_entries');
      expect(mockSupabase._chain.insert).toHaveBeenCalled();
      expect(result).toEqual(mockTimeEntry);
    });

    it('should throw RepositoryError when creation fails', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const input: CreateTimeEntryInput = {
        client_id: 'client-456',
      };

      await expect(repository.create(input)).rejects.toThrow(RepositoryError);
      await expect(repository.create(input)).rejects.toThrow('Failed to create time entry');
    });

    it('should set started_at to current time if not provided', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: mockTimeEntry,
        error: null,
      });

      const input: CreateTimeEntryInput = {
        client_id: 'client-456',
      };

      await repository.create(input);

      expect(mockSupabase._chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'client-456',
          started_at: expect.any(String),
        })
      );
    });

    it('should use provided started_at if given', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: mockTimeEntry,
        error: null,
      });

      const customStartTime = '2024-01-10T08:00:00.000Z';
      const input: CreateTimeEntryInput = {
        client_id: 'client-456',
        started_at: customStartTime,
      };

      await repository.create(input);

      expect(mockSupabase._chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'client-456',
          started_at: customStartTime,
        })
      );
    });
  });

  describe('update', () => {
    it('should update a time entry successfully', async () => {
      const updatedEntry = { ...mockTimeEntry, description: 'Updated description' };
      mockSupabase._chain.single.mockResolvedValue({
        data: updatedEntry,
        error: null,
      });

      const input: UpdateTimeEntryInput = {
        description: 'Updated description',
      };

      const result = await repository.update('entry-123', input);

      expect(mockSupabase.from).toHaveBeenCalledWith('time_entries');
      expect(mockSupabase._chain.update).toHaveBeenCalledWith(input);
      expect(mockSupabase._chain.eq).toHaveBeenCalledWith('id', 'entry-123');
      expect(result).toEqual(updatedEntry);
    });

    it('should throw RepositoryError when update fails', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: null,
        error: { message: 'Entry not found' },
      });

      await expect(repository.update('invalid-id', {})).rejects.toThrow(RepositoryError);
      await expect(repository.update('invalid-id', {})).rejects.toThrow('Failed to update time entry');
    });
  });

  describe('findById', () => {
    it('should find a time entry by id', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: mockTimeEntry,
        error: null,
      });

      const result = await repository.findById('entry-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('time_entries');
      expect(mockSupabase._chain.select).toHaveBeenCalledWith('*');
      expect(mockSupabase._chain.eq).toHaveBeenCalledWith('id', 'entry-123');
      expect(result).toEqual(mockTimeEntry);
    });

    it('should return null when time entry not found', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(repository.findById('entry-123')).rejects.toThrow(RepositoryError);
      await expect(repository.findById('entry-123')).rejects.toThrow('Failed to find time entry');
    });
  });

  describe('findRunning', () => {
    it('should find the running time entry', async () => {
      const runningEntry = { ...mockTimeEntry, ended_at: null };
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: runningEntry,
        error: null,
      });

      const result = await repository.findRunning();

      expect(mockSupabase.from).toHaveBeenCalledWith('time_entries');
      expect(mockSupabase._chain.select).toHaveBeenCalledWith('*');
      expect(mockSupabase._chain.is).toHaveBeenCalledWith('ended_at', null);
      expect(result).toEqual(runningEntry);
    });

    it('should return null when no timer is running', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findRunning();

      expect(result).toBeNull();
    });

    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(repository.findRunning()).rejects.toThrow(RepositoryError);
      await expect(repository.findRunning()).rejects.toThrow('Failed to find running time entry');
    });
  });

  describe('findByDateRange', () => {
    it('should find time entries within date range', async () => {
      const entries = [mockTimeEntry, { ...mockTimeEntry, id: 'entry-456' }];
      // For findByDateRange, we need a resolved value that returns the array (no .single/.maybeSingle)
      mockSupabase._chain.order.mockResolvedValue({
        data: entries,
        error: null,
      });

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await repository.findByDateRange(startDate, endDate);

      expect(mockSupabase.from).toHaveBeenCalledWith('time_entries');
      expect(mockSupabase._chain.select).toHaveBeenCalledWith('*');
      expect(mockSupabase._chain.gte).toHaveBeenCalledWith('started_at', startDate.toISOString());
      expect(mockSupabase._chain.lte).toHaveBeenCalledWith('started_at', endDate.toISOString());
      expect(result).toEqual(entries);
    });

    it('should return empty array when no entries in range', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByDateRange(new Date(), new Date());

      expect(result).toEqual([]);
    });

    it('should throw RepositoryError when query fails', async () => {
      mockSupabase._chain.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(repository.findByDateRange(new Date(), new Date())).rejects.toThrow(RepositoryError);
      await expect(repository.findByDateRange(new Date(), new Date())).rejects.toThrow('Failed to find time entries by date range');
    });
  });

  describe('stop', () => {
    it('should stop a running time entry', async () => {
      const stoppedEntry = { ...mockTimeEntry, ended_at: '2024-01-15T17:00:00.000Z' };
      mockSupabase._chain.single.mockResolvedValue({
        data: stoppedEntry,
        error: null,
      });

      const result = await repository.stop('entry-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('time_entries');
      expect(mockSupabase._chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ended_at: expect.any(String),
        })
      );
      expect(mockSupabase._chain.eq).toHaveBeenCalledWith('id', 'entry-123');
      expect(result).toEqual(stoppedEntry);
    });

    it('should throw RepositoryError when stop fails', async () => {
      mockSupabase._chain.single.mockResolvedValue({
        data: null,
        error: { message: 'Entry not found' },
      });

      await expect(repository.stop('invalid-id')).rejects.toThrow(RepositoryError);
      await expect(repository.stop('invalid-id')).rejects.toThrow('Failed to stop time entry');
    });
  });
});
