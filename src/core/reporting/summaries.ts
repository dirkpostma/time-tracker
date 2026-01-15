/**
 * Core reporting functionality for time summaries.
 * Pure functions with dependency injection for repositories.
 */

import type { TimeEntry, Client, Project } from '../types.js';
import type { TimeEntryRepository, ClientRepository, ProjectRepository } from '../../repositories/types.js';
import { calculateDuration } from '../timer.js';

/**
 * Summary of time tracked for a client.
 */
export interface ClientSummary {
  id: string;
  name: string;
  minutes: number;
}

/**
 * Summary of time tracked for a project.
 */
export interface ProjectSummary {
  id: string;
  name: string;
  clientId: string;
  minutes: number;
}

/**
 * Summary of time tracked for a specific day.
 */
export interface DaySummary {
  date: string; // YYYY-MM-DD format
  minutes: number;
}

/**
 * Complete time summary with aggregations by client, project, and day.
 */
export interface TimeSummary {
  totalMinutes: number;
  byClient: ClientSummary[];
  byProject: ProjectSummary[];
  byDay: DaySummary[];
}

/**
 * Options for filtering time summaries.
 */
export interface SummaryOptions {
  startDate: Date;
  endDate: Date;
  clientId?: string;
  projectId?: string;
}

/**
 * Calculates the duration of a time entry in minutes.
 * If the entry has no ended_at (running), uses current time.
 */
function getEntryDuration(entry: TimeEntry): number {
  const startedAt = new Date(entry.started_at);
  const endedAt = entry.ended_at ? new Date(entry.ended_at) : undefined;
  return calculateDuration(startedAt, endedAt);
}

/**
 * Extracts the date portion (YYYY-MM-DD) from an ISO timestamp.
 */
function getDateString(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10);
}

/**
 * Gets a comprehensive time summary for a date range with optional filters.
 *
 * @param timeEntryRepo - Repository for time entries
 * @param clientRepo - Repository for clients
 * @param projectRepo - Repository for projects
 * @param options - Summary options including date range and optional filters
 * @returns Time summary with totals and breakdowns
 */
export async function getTimeSummary(
  timeEntryRepo: TimeEntryRepository,
  clientRepo: ClientRepository,
  projectRepo: ProjectRepository,
  options: SummaryOptions
): Promise<TimeSummary> {
  // Fetch entries for the date range
  let entries = await timeEntryRepo.findByDateRange(options.startDate, options.endDate);

  // Apply optional filters
  if (options.clientId) {
    entries = entries.filter((e) => e.client_id === options.clientId);
  }
  if (options.projectId) {
    entries = entries.filter((e) => e.project_id === options.projectId);
  }

  // If no entries, return empty summary
  if (entries.length === 0) {
    return {
      totalMinutes: 0,
      byClient: [],
      byProject: [],
      byDay: [],
    };
  }

  // Aggregate by client
  const clientMinutes = new Map<string, number>();
  for (const entry of entries) {
    const duration = getEntryDuration(entry);
    const current = clientMinutes.get(entry.client_id) ?? 0;
    clientMinutes.set(entry.client_id, current + duration);
  }

  // Build client summaries with names
  const byClient: ClientSummary[] = [];
  for (const [clientId, minutes] of clientMinutes) {
    const client = await clientRepo.findById(clientId);
    if (client) {
      byClient.push({
        id: clientId,
        name: client.name,
        minutes,
      });
    }
  }
  // Sort by minutes descending
  byClient.sort((a, b) => b.minutes - a.minutes);

  // Aggregate by project
  const projectMinutes = new Map<string, number>();
  for (const entry of entries) {
    if (entry.project_id) {
      const duration = getEntryDuration(entry);
      const current = projectMinutes.get(entry.project_id) ?? 0;
      projectMinutes.set(entry.project_id, current + duration);
    }
  }

  // Build project summaries with names
  const byProject: ProjectSummary[] = [];
  for (const [projectId, minutes] of projectMinutes) {
    const project = await projectRepo.findById(projectId);
    if (project) {
      byProject.push({
        id: projectId,
        name: project.name,
        clientId: project.client_id,
        minutes,
      });
    }
  }
  // Sort by minutes descending
  byProject.sort((a, b) => b.minutes - a.minutes);

  // Aggregate by day
  const dayMinutes = new Map<string, number>();
  for (const entry of entries) {
    const dateStr = getDateString(entry.started_at);
    const duration = getEntryDuration(entry);
    const current = dayMinutes.get(dateStr) ?? 0;
    dayMinutes.set(dateStr, current + duration);
  }

  // Build day summaries
  const byDay: DaySummary[] = [];
  for (const [date, minutes] of dayMinutes) {
    byDay.push({ date, minutes });
  }
  // Sort by date ascending
  byDay.sort((a, b) => a.date.localeCompare(b.date));

  // Calculate total
  const totalMinutes = entries.reduce((sum, entry) => sum + getEntryDuration(entry), 0);

  return {
    totalMinutes,
    byClient,
    byProject,
    byDay,
  };
}

/**
 * Gets a time summary for a specific day.
 *
 * @param timeEntryRepo - Repository for time entries
 * @param clientRepo - Repository for clients
 * @param projectRepo - Repository for projects
 * @param date - The day to summarize
 * @returns Time summary for the day
 */
export async function getDailySummary(
  timeEntryRepo: TimeEntryRepository,
  clientRepo: ClientRepository,
  projectRepo: ProjectRepository,
  date: Date
): Promise<TimeSummary> {
  // Create date range for the full day
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  return getTimeSummary(timeEntryRepo, clientRepo, projectRepo, {
    startDate,
    endDate,
  });
}

/**
 * Gets a time summary for a week starting from the given date.
 *
 * @param timeEntryRepo - Repository for time entries
 * @param clientRepo - Repository for clients
 * @param projectRepo - Repository for projects
 * @param weekStart - The first day of the week
 * @returns Time summary for the week
 */
export async function getWeeklySummary(
  timeEntryRepo: TimeEntryRepository,
  clientRepo: ClientRepository,
  projectRepo: ProjectRepository,
  weekStart: Date
): Promise<TimeSummary> {
  // Create date range for 7 days
  const startDate = new Date(weekStart);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(weekStart);
  endDate.setDate(endDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return getTimeSummary(timeEntryRepo, clientRepo, projectRepo, {
    startDate,
    endDate,
  });
}

/**
 * Gets a time summary for a specific month.
 *
 * @param timeEntryRepo - Repository for time entries
 * @param clientRepo - Repository for clients
 * @param projectRepo - Repository for projects
 * @param year - The year (e.g., 2024)
 * @param month - The month (1-12)
 * @returns Time summary for the month
 */
export async function getMonthlySummary(
  timeEntryRepo: TimeEntryRepository,
  clientRepo: ClientRepository,
  projectRepo: ProjectRepository,
  year: number,
  month: number
): Promise<TimeSummary> {
  // Create date range for the month
  // Note: JavaScript months are 0-indexed, so subtract 1
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);

  // Get last day of month by going to next month's day 0
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  return getTimeSummary(timeEntryRepo, clientRepo, projectRepo, {
    startDate,
    endDate,
  });
}
