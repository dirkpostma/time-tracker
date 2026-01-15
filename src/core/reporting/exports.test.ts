import { describe, it, expect } from 'vitest';
import {
  formatTimeEntriesAsCsv,
  formatTimeEntriesAsJson,
  formatSummaryAsCsv,
  formatSummaryAsJson,
  type ExportFormat,
  type ExportOptions,
  type TimeSummary,
} from './exports.js';
import type { TimeEntry } from '../types.js';

describe('exports', () => {
  // Sample time entries for testing
  const sampleTimeEntries: TimeEntry[] = [
    {
      id: '1',
      client_id: 'client-1',
      project_id: 'project-1',
      task_id: 'task-1',
      description: 'Working on feature',
      started_at: '2024-01-15T09:00:00Z',
      ended_at: '2024-01-15T12:00:00Z',
      created_at: '2024-01-15T09:00:00Z',
      updated_at: '2024-01-15T12:00:00Z',
    },
    {
      id: '2',
      client_id: 'client-2',
      project_id: null,
      task_id: null,
      description: null,
      started_at: '2024-01-15T13:00:00Z',
      ended_at: '2024-01-15T14:30:00Z',
      created_at: '2024-01-15T13:00:00Z',
      updated_at: '2024-01-15T14:30:00Z',
    },
  ];

  // Sample summary for testing
  const sampleSummary: TimeSummary = {
    totalMinutes: 270,
    byClient: [
      { id: 'client-1', name: 'Acme Corp', minutes: 180 },
      { id: 'client-2', name: 'Beta Inc', minutes: 90 },
    ],
    byProject: [
      { id: 'project-1', name: 'Website Redesign', minutes: 180 },
    ],
    byDay: [
      { date: '2024-01-15', minutes: 270 },
    ],
  };

  describe('ExportFormat type', () => {
    it('should accept csv as a valid format', () => {
      const format: ExportFormat = 'csv';
      expect(format).toBe('csv');
    });

    it('should accept json as a valid format', () => {
      const format: ExportFormat = 'json';
      expect(format).toBe('json');
    });
  });

  describe('ExportOptions type', () => {
    it('should have format and optional includeHeaders', () => {
      const options: ExportOptions = { format: 'csv' };
      expect(options.format).toBe('csv');
      expect(options.includeHeaders).toBeUndefined();

      const optionsWithHeaders: ExportOptions = { format: 'csv', includeHeaders: true };
      expect(optionsWithHeaders.includeHeaders).toBe(true);
    });
  });

  describe('formatTimeEntriesAsCsv', () => {
    it('should include headers by default', () => {
      const result = formatTimeEntriesAsCsv(sampleTimeEntries);
      const lines = result.split('\n');
      expect(lines[0]).toBe('id,client_id,project_id,task_id,description,started_at,ended_at');
    });

    it('should include headers when includeHeaders is true', () => {
      const result = formatTimeEntriesAsCsv(sampleTimeEntries, { includeHeaders: true });
      const lines = result.split('\n');
      expect(lines[0]).toBe('id,client_id,project_id,task_id,description,started_at,ended_at');
    });

    it('should not include headers when includeHeaders is false', () => {
      const result = formatTimeEntriesAsCsv(sampleTimeEntries, { includeHeaders: false });
      const lines = result.split('\n');
      expect(lines[0]).not.toBe('id,client_id,project_id,task_id,description,started_at,ended_at');
      expect(lines[0]).toContain('1'); // First entry's id
    });

    it('should format time entries as CSV rows', () => {
      const result = formatTimeEntriesAsCsv(sampleTimeEntries);
      const lines = result.split('\n');
      expect(lines).toHaveLength(3); // header + 2 entries
      expect(lines[1]).toBe('1,client-1,project-1,task-1,Working on feature,2024-01-15T09:00:00Z,2024-01-15T12:00:00Z');
    });

    it('should handle null values by leaving fields empty', () => {
      const result = formatTimeEntriesAsCsv(sampleTimeEntries);
      const lines = result.split('\n');
      expect(lines[2]).toBe('2,client-2,,,,2024-01-15T13:00:00Z,2024-01-15T14:30:00Z');
    });

    it('should return empty string for empty array with no headers', () => {
      const result = formatTimeEntriesAsCsv([], { includeHeaders: false });
      expect(result).toBe('');
    });

    it('should return only headers for empty array with headers', () => {
      const result = formatTimeEntriesAsCsv([], { includeHeaders: true });
      expect(result).toBe('id,client_id,project_id,task_id,description,started_at,ended_at');
    });

    it('should escape fields containing commas', () => {
      const entriesWithComma: TimeEntry[] = [{
        id: '1',
        client_id: 'client-1',
        project_id: 'project-1',
        task_id: null,
        description: 'Meeting, discussion, planning',
        started_at: '2024-01-15T09:00:00Z',
        ended_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      }];
      const result = formatTimeEntriesAsCsv(entriesWithComma, { includeHeaders: false });
      expect(result).toContain('"Meeting, discussion, planning"');
    });

    it('should escape fields containing double quotes', () => {
      const entriesWithQuotes: TimeEntry[] = [{
        id: '1',
        client_id: 'client-1',
        project_id: 'project-1',
        task_id: null,
        description: 'Discussed "important" matters',
        started_at: '2024-01-15T09:00:00Z',
        ended_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      }];
      const result = formatTimeEntriesAsCsv(entriesWithQuotes, { includeHeaders: false });
      expect(result).toContain('"Discussed ""important"" matters"');
    });

    it('should escape fields containing newlines', () => {
      const entriesWithNewline: TimeEntry[] = [{
        id: '1',
        client_id: 'client-1',
        project_id: 'project-1',
        task_id: null,
        description: 'Line 1\nLine 2',
        started_at: '2024-01-15T09:00:00Z',
        ended_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      }];
      const result = formatTimeEntriesAsCsv(entriesWithNewline, { includeHeaders: false });
      expect(result).toContain('"Line 1\nLine 2"');
    });
  });

  describe('formatTimeEntriesAsJson', () => {
    it('should return valid JSON string', () => {
      const result = formatTimeEntriesAsJson(sampleTimeEntries);
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should include all time entry fields', () => {
      const result = formatTimeEntriesAsJson(sampleTimeEntries);
      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toEqual(sampleTimeEntries[0]);
      expect(parsed[1]).toEqual(sampleTimeEntries[1]);
    });

    it('should return empty array for empty input', () => {
      const result = formatTimeEntriesAsJson([]);
      expect(JSON.parse(result)).toEqual([]);
    });

    it('should preserve null values', () => {
      const result = formatTimeEntriesAsJson(sampleTimeEntries);
      const parsed = JSON.parse(result);
      expect(parsed[1].project_id).toBeNull();
      expect(parsed[1].task_id).toBeNull();
      expect(parsed[1].description).toBeNull();
    });

    it('should produce formatted JSON with indentation', () => {
      const result = formatTimeEntriesAsJson(sampleTimeEntries);
      expect(result).toContain('\n');
      expect(result).toContain('  '); // indentation
    });
  });

  describe('formatSummaryAsCsv', () => {
    it('should include headers by default', () => {
      const result = formatSummaryAsCsv(sampleSummary);
      expect(result).toContain('Total Minutes');
    });

    it('should format total minutes', () => {
      const result = formatSummaryAsCsv(sampleSummary);
      expect(result).toContain('Total Minutes,270');
    });

    it('should format by client section', () => {
      const result = formatSummaryAsCsv(sampleSummary);
      expect(result).toContain('By Client');
      expect(result).toContain('client_id,name,minutes');
      expect(result).toContain('client-1,Acme Corp,180');
      expect(result).toContain('client-2,Beta Inc,90');
    });

    it('should format by project section', () => {
      const result = formatSummaryAsCsv(sampleSummary);
      expect(result).toContain('By Project');
      expect(result).toContain('project_id,name,minutes');
      expect(result).toContain('project-1,Website Redesign,180');
    });

    it('should format by day section', () => {
      const result = formatSummaryAsCsv(sampleSummary);
      expect(result).toContain('By Day');
      expect(result).toContain('date,minutes');
      expect(result).toContain('2024-01-15,270');
    });

    it('should not include section headers when includeHeaders is false', () => {
      const result = formatSummaryAsCsv(sampleSummary, { includeHeaders: false });
      expect(result).not.toContain('Total Minutes');
      expect(result).not.toContain('By Client');
      expect(result).not.toContain('client_id,name,minutes');
      // But should still contain the data
      expect(result).toContain('270');
      expect(result).toContain('client-1,Acme Corp,180');
    });

    it('should handle empty arrays in summary', () => {
      const emptySummary: TimeSummary = {
        totalMinutes: 0,
        byClient: [],
        byProject: [],
        byDay: [],
      };
      const result = formatSummaryAsCsv(emptySummary);
      expect(result).toContain('Total Minutes,0');
    });

    it('should escape client/project names containing commas', () => {
      const summaryWithComma: TimeSummary = {
        totalMinutes: 60,
        byClient: [{ id: 'c1', name: 'Smith, Jones & Co', minutes: 60 }],
        byProject: [],
        byDay: [],
      };
      const result = formatSummaryAsCsv(summaryWithComma);
      expect(result).toContain('"Smith, Jones & Co"');
    });
  });

  describe('formatSummaryAsJson', () => {
    it('should return valid JSON string', () => {
      const result = formatSummaryAsJson(sampleSummary);
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should include all summary fields', () => {
      const result = formatSummaryAsJson(sampleSummary);
      const parsed = JSON.parse(result);
      expect(parsed.totalMinutes).toBe(270);
      expect(parsed.byClient).toHaveLength(2);
      expect(parsed.byProject).toHaveLength(1);
      expect(parsed.byDay).toHaveLength(1);
    });

    it('should preserve summary structure', () => {
      const result = formatSummaryAsJson(sampleSummary);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(sampleSummary);
    });

    it('should handle empty arrays', () => {
      const emptySummary: TimeSummary = {
        totalMinutes: 0,
        byClient: [],
        byProject: [],
        byDay: [],
      };
      const result = formatSummaryAsJson(emptySummary);
      const parsed = JSON.parse(result);
      expect(parsed.byClient).toEqual([]);
      expect(parsed.byProject).toEqual([]);
      expect(parsed.byDay).toEqual([]);
    });

    it('should produce formatted JSON with indentation', () => {
      const result = formatSummaryAsJson(sampleSummary);
      expect(result).toContain('\n');
      expect(result).toContain('  '); // indentation
    });
  });
});
