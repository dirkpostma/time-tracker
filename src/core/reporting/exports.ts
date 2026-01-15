/**
 * Export formatting functions for time entries and summaries.
 * Pure functions with no I/O - just format data to CSV or JSON strings.
 */

import type { TimeEntry } from '../types.js';

/**
 * Supported export formats.
 */
export type ExportFormat = 'csv' | 'json';

/**
 * Options for export formatting.
 */
export interface ExportOptions {
  format: ExportFormat;
  includeHeaders?: boolean;
}

/**
 * Summary of time tracked, aggregated by client, project, and day.
 */
export interface TimeSummary {
  totalMinutes: number;
  byClient: { id: string; name: string; minutes: number }[];
  byProject: { id: string; name: string; minutes: number }[];
  byDay: { date: string; minutes: number }[];
}

/**
 * Escape a value for CSV format according to RFC 4180.
 * - If the value contains commas, quotes, or newlines, wrap in quotes
 * - Double any existing quotes within the value
 */
function escapeCsvValue(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // Check if escaping is needed
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Escape quotes by doubling them, then wrap in quotes
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Format time entries as a CSV string.
 *
 * @param entries - Array of time entries to format
 * @param options - Optional formatting options
 * @returns CSV formatted string
 */
export function formatTimeEntriesAsCsv(
  entries: TimeEntry[],
  options?: { includeHeaders?: boolean }
): string {
  const includeHeaders = options?.includeHeaders ?? true;
  const lines: string[] = [];

  if (includeHeaders) {
    lines.push('id,client_id,project_id,task_id,description,started_at,ended_at');
  }

  for (const entry of entries) {
    const row = [
      escapeCsvValue(entry.id),
      escapeCsvValue(entry.client_id),
      escapeCsvValue(entry.project_id),
      escapeCsvValue(entry.task_id),
      escapeCsvValue(entry.description),
      escapeCsvValue(entry.started_at),
      escapeCsvValue(entry.ended_at),
    ].join(',');
    lines.push(row);
  }

  return lines.join('\n');
}

/**
 * Format time entries as a JSON string.
 *
 * @param entries - Array of time entries to format
 * @returns JSON formatted string with indentation
 */
export function formatTimeEntriesAsJson(entries: TimeEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

/**
 * Format a time summary as a CSV string.
 *
 * The output includes sections for:
 * - Total minutes
 * - By client breakdown
 * - By project breakdown
 * - By day breakdown
 *
 * @param summary - Time summary to format
 * @param options - Optional formatting options
 * @returns CSV formatted string
 */
export function formatSummaryAsCsv(
  summary: TimeSummary,
  options?: { includeHeaders?: boolean }
): string {
  const includeHeaders = options?.includeHeaders ?? true;
  const lines: string[] = [];

  if (includeHeaders) {
    // Total
    lines.push('Total Minutes,' + summary.totalMinutes);
    lines.push('');

    // By Client
    lines.push('By Client');
    lines.push('client_id,name,minutes');
    for (const client of summary.byClient) {
      lines.push(`${escapeCsvValue(client.id)},${escapeCsvValue(client.name)},${client.minutes}`);
    }
    lines.push('');

    // By Project
    lines.push('By Project');
    lines.push('project_id,name,minutes');
    for (const project of summary.byProject) {
      lines.push(`${escapeCsvValue(project.id)},${escapeCsvValue(project.name)},${project.minutes}`);
    }
    lines.push('');

    // By Day
    lines.push('By Day');
    lines.push('date,minutes');
    for (const day of summary.byDay) {
      lines.push(`${day.date},${day.minutes}`);
    }
  } else {
    // Data only, no headers or section labels
    lines.push(String(summary.totalMinutes));
    lines.push('');

    for (const client of summary.byClient) {
      lines.push(`${escapeCsvValue(client.id)},${escapeCsvValue(client.name)},${client.minutes}`);
    }
    lines.push('');

    for (const project of summary.byProject) {
      lines.push(`${escapeCsvValue(project.id)},${escapeCsvValue(project.name)},${project.minutes}`);
    }
    lines.push('');

    for (const day of summary.byDay) {
      lines.push(`${day.date},${day.minutes}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format a time summary as a JSON string.
 *
 * @param summary - Time summary to format
 * @returns JSON formatted string with indentation
 */
export function formatSummaryAsJson(summary: TimeSummary): string {
  return JSON.stringify(summary, null, 2);
}
