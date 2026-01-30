/**
 * Unit tests for groupEntriesByDay function from useTimeEntries hook
 * Tests the entry grouping and date display logic
 */

interface TimeEntryDisplay {
  id: string;
  clientName: string;
  projectName?: string;
  taskName?: string;
  description?: string;
  startedAt: Date;
  endedAt: Date;
  duration: number;
}

interface DayGroup {
  date: string;
  displayDate: string;
  totalDuration: number;
  entries: TimeEntryDisplay[];
}

// Extract pure functions for testing
function formatDisplayDate(date: Date, now: Date = new Date()): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (entryDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (entryDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (entryDate > weekAgo) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function groupEntriesByDay(entries: TimeEntryDisplay[], now: Date = new Date()): DayGroup[] {
  const groups: Map<string, DayGroup> = new Map();

  for (const entry of entries) {
    const dateKey = entry.startedAt.toISOString().split('T')[0];

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        date: dateKey,
        displayDate: formatDisplayDate(entry.startedAt, now),
        totalDuration: 0,
        entries: [],
      });
    }

    const group = groups.get(dateKey)!;
    group.entries.push(entry);
    group.totalDuration += entry.duration;
  }

  return Array.from(groups.values()).sort((a, b) => b.date.localeCompare(a.date));
}

// Helper to create test entries
function createEntry(
  id: string,
  clientName: string,
  startedAt: Date,
  durationSeconds: number
): TimeEntryDisplay {
  const endedAt = new Date(startedAt.getTime() + durationSeconds * 1000);
  return {
    id,
    clientName,
    startedAt,
    endedAt,
    duration: durationSeconds,
  };
}

describe('formatDisplayDate', () => {
  const fixedNow = new Date('2026-01-30T12:00:00Z');

  describe('relative dates', () => {
    it('returns "Today" for today\'s date', () => {
      const today = new Date('2026-01-30T09:00:00Z');
      expect(formatDisplayDate(today, fixedNow)).toBe('Today');
    });

    it('returns "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date('2026-01-29T09:00:00Z');
      expect(formatDisplayDate(yesterday, fixedNow)).toBe('Yesterday');
    });

    it('returns weekday name for dates within last 7 days', () => {
      // Jan 30 2026 is a Friday, so Jan 25 is Sunday
      const sunday = new Date('2026-01-25T09:00:00Z');
      expect(formatDisplayDate(sunday, fixedNow)).toBe('Sunday');

      const monday = new Date('2026-01-26T09:00:00Z');
      expect(formatDisplayDate(monday, fixedNow)).toBe('Monday');
    });

    it('returns formatted date for dates older than 7 days', () => {
      const oldDate = new Date('2026-01-15T09:00:00Z');
      const result = formatDisplayDate(oldDate, fixedNow);
      // Should include weekday, month, day
      expect(result).toMatch(/Thu/);
      expect(result).toMatch(/Jan/);
      expect(result).toMatch(/15/);
    });
  });

  describe('edge cases', () => {
    it('handles midnight correctly for today', () => {
      // Use local time to avoid timezone issues
      const now = new Date(2026, 0, 30, 12, 0, 0); // Jan 30, 2026 noon local
      const midnight = new Date(2026, 0, 30, 0, 0, 0); // Jan 30, 2026 midnight local
      expect(formatDisplayDate(midnight, now)).toBe('Today');
    });

    it('handles late night correctly for yesterday', () => {
      // Use local time to avoid timezone issues
      const now = new Date(2026, 0, 30, 12, 0, 0); // Jan 30, 2026 noon local
      const lateYesterday = new Date(2026, 0, 29, 23, 59, 59); // Jan 29, 2026 11:59pm local
      expect(formatDisplayDate(lateYesterday, now)).toBe('Yesterday');
    });
  });
});

describe('groupEntriesByDay', () => {
  const fixedNow = new Date('2026-01-30T12:00:00Z');

  describe('empty input', () => {
    it('returns empty array for no entries', () => {
      expect(groupEntriesByDay([], fixedNow)).toEqual([]);
    });
  });

  describe('single day grouping', () => {
    it('groups multiple entries from same day', () => {
      const entries = [
        createEntry('1', 'Client A', new Date('2026-01-30T09:00:00Z'), 3600),
        createEntry('2', 'Client B', new Date('2026-01-30T14:00:00Z'), 1800),
      ];

      const groups = groupEntriesByDay(entries, fixedNow);

      expect(groups).toHaveLength(1);
      expect(groups[0].date).toBe('2026-01-30');
      expect(groups[0].displayDate).toBe('Today');
      expect(groups[0].entries).toHaveLength(2);
      expect(groups[0].totalDuration).toBe(5400); // 3600 + 1800
    });
  });

  describe('multi-day grouping', () => {
    it('creates separate groups for different days', () => {
      const entries = [
        createEntry('1', 'Client A', new Date('2026-01-30T09:00:00Z'), 3600),
        createEntry('2', 'Client B', new Date('2026-01-29T14:00:00Z'), 1800),
        createEntry('3', 'Client C', new Date('2026-01-28T10:00:00Z'), 7200),
      ];

      const groups = groupEntriesByDay(entries, fixedNow);

      expect(groups).toHaveLength(3);
      expect(groups[0].date).toBe('2026-01-30');
      expect(groups[1].date).toBe('2026-01-29');
      expect(groups[2].date).toBe('2026-01-28');
    });

    it('sorts groups by date descending (newest first)', () => {
      const entries = [
        createEntry('1', 'Client A', new Date('2026-01-25T09:00:00Z'), 3600),
        createEntry('2', 'Client B', new Date('2026-01-30T14:00:00Z'), 1800),
        createEntry('3', 'Client C', new Date('2026-01-27T10:00:00Z'), 7200),
      ];

      const groups = groupEntriesByDay(entries, fixedNow);

      expect(groups[0].date).toBe('2026-01-30');
      expect(groups[1].date).toBe('2026-01-27');
      expect(groups[2].date).toBe('2026-01-25');
    });
  });

  describe('duration calculations', () => {
    it('sums durations correctly for a day', () => {
      const entries = [
        createEntry('1', 'Client A', new Date('2026-01-30T09:00:00Z'), 3600),
        createEntry('2', 'Client A', new Date('2026-01-30T11:00:00Z'), 3600),
        createEntry('3', 'Client A', new Date('2026-01-30T14:00:00Z'), 1800),
      ];

      const groups = groupEntriesByDay(entries, fixedNow);

      expect(groups[0].totalDuration).toBe(9000); // 3600 + 3600 + 1800
    });

    it('calculates separate totals for each day', () => {
      const entries = [
        createEntry('1', 'Client A', new Date('2026-01-30T09:00:00Z'), 3600),
        createEntry('2', 'Client A', new Date('2026-01-29T09:00:00Z'), 7200),
      ];

      const groups = groupEntriesByDay(entries, fixedNow);

      expect(groups[0].totalDuration).toBe(3600);
      expect(groups[1].totalDuration).toBe(7200);
    });
  });

  describe('entry preservation', () => {
    it('preserves all entry fields', () => {
      const entry: TimeEntryDisplay = {
        id: '123',
        clientName: 'Acme Corp',
        projectName: 'Website Redesign',
        taskName: 'Frontend',
        description: 'Working on homepage',
        startedAt: new Date('2026-01-30T09:00:00Z'),
        endedAt: new Date('2026-01-30T10:00:00Z'),
        duration: 3600,
      };

      const groups = groupEntriesByDay([entry], fixedNow);

      expect(groups[0].entries[0]).toEqual(entry);
    });
  });
});
