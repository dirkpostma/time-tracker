import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTimeSummary,
  getDailySummary,
  getWeeklySummary,
  getMonthlySummary,
  type TimeSummary,
  type ClientSummary,
  type ProjectSummary,
  type DaySummary,
  type SummaryOptions,
} from './summaries.js';
import type { TimeEntryRepository, ClientRepository, ProjectRepository } from '../../repositories/types.js';
import type { TimeEntry, Client, Project, CreateTimeEntryInput, CreateClientInput, CreateProjectInput } from '../types.js';

// Helper to create a time entry with specific dates
function createTimeEntry(
  id: string,
  clientId: string,
  projectId: string | null,
  startedAt: string,
  endedAt: string | null,
  description?: string
): TimeEntry {
  return {
    id,
    client_id: clientId,
    project_id: projectId,
    task_id: null,
    description: description ?? null,
    started_at: startedAt,
    ended_at: endedAt,
    created_at: startedAt,
    updated_at: startedAt,
  };
}

// Mock repositories
function createMockTimeEntryRepository(entries: TimeEntry[]): TimeEntryRepository {
  return {
    async create(input: CreateTimeEntryInput): Promise<TimeEntry> {
      throw new Error('Not implemented');
    },
    async update(): Promise<TimeEntry> {
      throw new Error('Not implemented');
    },
    async findById(id: string): Promise<TimeEntry | null> {
      return entries.find((e) => e.id === id) ?? null;
    },
    async findRunning(): Promise<TimeEntry | null> {
      return entries.find((e) => e.ended_at === null) ?? null;
    },
    async findByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
      return entries.filter((e) => {
        const entryStart = new Date(e.started_at);
        return entryStart >= startDate && entryStart <= endDate;
      });
    },
    async stop(): Promise<TimeEntry> {
      throw new Error('Not implemented');
    },
  };
}

function createMockClientRepository(clients: Client[]): ClientRepository {
  return {
    async create(input: CreateClientInput): Promise<Client> {
      throw new Error('Not implemented');
    },
    async findById(id: string): Promise<Client | null> {
      return clients.find((c) => c.id === id) ?? null;
    },
    async findAll(): Promise<Client[]> {
      return clients;
    },
    async findByName(name: string): Promise<Client | null> {
      return clients.find((c) => c.name === name) ?? null;
    },
  };
}

function createMockProjectRepository(projects: Project[]): ProjectRepository {
  return {
    async create(input: CreateProjectInput): Promise<Project> {
      throw new Error('Not implemented');
    },
    async findById(id: string): Promise<Project | null> {
      return projects.find((p) => p.id === id) ?? null;
    },
    async findAll(): Promise<Project[]> {
      return projects;
    },
    async findByName(name: string, clientId: string): Promise<Project | null> {
      return projects.find((p) => p.name === name && p.client_id === clientId) ?? null;
    },
    async findByClientId(clientId: string): Promise<Project[]> {
      return projects.filter((p) => p.client_id === clientId);
    },
  };
}

describe('reporting summaries', () => {
  // Test data
  const clients: Client[] = [
    { id: 'client-1', name: 'Acme Corp', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 'client-2', name: 'Globex Inc', created_at: '2024-01-01', updated_at: '2024-01-01' },
  ];

  const projects: Project[] = [
    { id: 'project-1', client_id: 'client-1', name: 'Website Redesign', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 'project-2', client_id: 'client-1', name: 'Mobile App', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 'project-3', client_id: 'client-2', name: 'API Development', created_at: '2024-01-01', updated_at: '2024-01-01' },
  ];

  // Time entries spanning multiple days and clients
  const timeEntries: TimeEntry[] = [
    // Day 1 (Jan 15) - Acme Corp, Website Redesign - 2 hours (120 min)
    createTimeEntry('entry-1', 'client-1', 'project-1', '2024-01-15T09:00:00.000Z', '2024-01-15T11:00:00.000Z'),
    // Day 1 (Jan 15) - Acme Corp, Mobile App - 1 hour (60 min)
    createTimeEntry('entry-2', 'client-1', 'project-2', '2024-01-15T13:00:00.000Z', '2024-01-15T14:00:00.000Z'),
    // Day 1 (Jan 15) - Globex Inc, API Development - 1.5 hours (90 min)
    createTimeEntry('entry-3', 'client-2', 'project-3', '2024-01-15T15:00:00.000Z', '2024-01-15T16:30:00.000Z'),
    // Day 2 (Jan 16) - Acme Corp, Website Redesign - 3 hours (180 min)
    createTimeEntry('entry-4', 'client-1', 'project-1', '2024-01-16T09:00:00.000Z', '2024-01-16T12:00:00.000Z'),
    // Day 2 (Jan 16) - Globex Inc, API Development - 2 hours (120 min)
    createTimeEntry('entry-5', 'client-2', 'project-3', '2024-01-16T14:00:00.000Z', '2024-01-16T16:00:00.000Z'),
  ];

  let timeEntryRepo: TimeEntryRepository;
  let clientRepo: ClientRepository;
  let projectRepo: ProjectRepository;

  beforeEach(() => {
    timeEntryRepo = createMockTimeEntryRepository(timeEntries);
    clientRepo = createMockClientRepository(clients);
    projectRepo = createMockProjectRepository(projects);
  });

  describe('getTimeSummary', () => {
    it('should calculate total minutes for a date range', async () => {
      const options: SummaryOptions = {
        startDate: new Date('2024-01-15T00:00:00.000Z'),
        endDate: new Date('2024-01-16T23:59:59.999Z'),
      };

      const result = await getTimeSummary(timeEntryRepo, clientRepo, projectRepo, options);

      // Total: 120 + 60 + 90 + 180 + 120 = 570 minutes
      expect(result.totalMinutes).toBe(570);
    });

    it('should group time by client', async () => {
      const options: SummaryOptions = {
        startDate: new Date('2024-01-15T00:00:00.000Z'),
        endDate: new Date('2024-01-16T23:59:59.999Z'),
      };

      const result = await getTimeSummary(timeEntryRepo, clientRepo, projectRepo, options);

      // Acme Corp: 120 + 60 + 180 = 360 minutes
      // Globex Inc: 90 + 120 = 210 minutes
      expect(result.byClient).toHaveLength(2);

      const acme = result.byClient.find((c) => c.id === 'client-1');
      const globex = result.byClient.find((c) => c.id === 'client-2');

      expect(acme).toEqual<ClientSummary>({ id: 'client-1', name: 'Acme Corp', minutes: 360 });
      expect(globex).toEqual<ClientSummary>({ id: 'client-2', name: 'Globex Inc', minutes: 210 });
    });

    it('should group time by project', async () => {
      const options: SummaryOptions = {
        startDate: new Date('2024-01-15T00:00:00.000Z'),
        endDate: new Date('2024-01-16T23:59:59.999Z'),
      };

      const result = await getTimeSummary(timeEntryRepo, clientRepo, projectRepo, options);

      // Website Redesign: 120 + 180 = 300 minutes
      // Mobile App: 60 minutes
      // API Development: 90 + 120 = 210 minutes
      expect(result.byProject).toHaveLength(3);

      const website = result.byProject.find((p) => p.id === 'project-1');
      const mobile = result.byProject.find((p) => p.id === 'project-2');
      const api = result.byProject.find((p) => p.id === 'project-3');

      expect(website).toEqual<ProjectSummary>({ id: 'project-1', name: 'Website Redesign', clientId: 'client-1', minutes: 300 });
      expect(mobile).toEqual<ProjectSummary>({ id: 'project-2', name: 'Mobile App', clientId: 'client-1', minutes: 60 });
      expect(api).toEqual<ProjectSummary>({ id: 'project-3', name: 'API Development', clientId: 'client-2', minutes: 210 });
    });

    it('should group time by day', async () => {
      const options: SummaryOptions = {
        startDate: new Date('2024-01-15T00:00:00.000Z'),
        endDate: new Date('2024-01-16T23:59:59.999Z'),
      };

      const result = await getTimeSummary(timeEntryRepo, clientRepo, projectRepo, options);

      // Day 1 (Jan 15): 120 + 60 + 90 = 270 minutes
      // Day 2 (Jan 16): 180 + 120 = 300 minutes
      expect(result.byDay).toHaveLength(2);

      const day1 = result.byDay.find((d) => d.date === '2024-01-15');
      const day2 = result.byDay.find((d) => d.date === '2024-01-16');

      expect(day1).toEqual<DaySummary>({ date: '2024-01-15', minutes: 270 });
      expect(day2).toEqual<DaySummary>({ date: '2024-01-16', minutes: 300 });
    });

    it('should filter by clientId when provided', async () => {
      const options: SummaryOptions = {
        startDate: new Date('2024-01-15T00:00:00.000Z'),
        endDate: new Date('2024-01-16T23:59:59.999Z'),
        clientId: 'client-1',
      };

      const result = await getTimeSummary(timeEntryRepo, clientRepo, projectRepo, options);

      // Acme Corp only: 120 + 60 + 180 = 360 minutes
      expect(result.totalMinutes).toBe(360);
      expect(result.byClient).toHaveLength(1);
      expect(result.byClient[0].id).toBe('client-1');
      expect(result.byProject).toHaveLength(2); // Website Redesign and Mobile App
    });

    it('should filter by projectId when provided', async () => {
      const options: SummaryOptions = {
        startDate: new Date('2024-01-15T00:00:00.000Z'),
        endDate: new Date('2024-01-16T23:59:59.999Z'),
        projectId: 'project-1',
      };

      const result = await getTimeSummary(timeEntryRepo, clientRepo, projectRepo, options);

      // Website Redesign only: 120 + 180 = 300 minutes
      expect(result.totalMinutes).toBe(300);
      expect(result.byProject).toHaveLength(1);
      expect(result.byProject[0].id).toBe('project-1');
    });

    it('should return empty summary for date range with no entries', async () => {
      const options: SummaryOptions = {
        startDate: new Date('2024-02-01T00:00:00.000Z'),
        endDate: new Date('2024-02-28T23:59:59.999Z'),
      };

      const result = await getTimeSummary(timeEntryRepo, clientRepo, projectRepo, options);

      expect(result.totalMinutes).toBe(0);
      expect(result.byClient).toHaveLength(0);
      expect(result.byProject).toHaveLength(0);
      expect(result.byDay).toHaveLength(0);
    });

    it('should handle entries without a project', async () => {
      const entriesWithNull: TimeEntry[] = [
        createTimeEntry('entry-np', 'client-1', null, '2024-01-17T09:00:00.000Z', '2024-01-17T10:00:00.000Z'),
      ];
      const repoWithNull = createMockTimeEntryRepository(entriesWithNull);

      const options: SummaryOptions = {
        startDate: new Date('2024-01-17T00:00:00.000Z'),
        endDate: new Date('2024-01-17T23:59:59.999Z'),
      };

      const result = await getTimeSummary(repoWithNull, clientRepo, projectRepo, options);

      expect(result.totalMinutes).toBe(60);
      expect(result.byClient).toHaveLength(1);
      expect(result.byProject).toHaveLength(0); // No project, so no project summary
    });

    it('should handle running entries (no ended_at) by using current time', async () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
      const runningEntries: TimeEntry[] = [
        createTimeEntry('entry-running', 'client-1', 'project-1', startTime.toISOString(), null),
      ];
      const repoWithRunning = createMockTimeEntryRepository(runningEntries);

      const options: SummaryOptions = {
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
      };

      const result = await getTimeSummary(repoWithRunning, clientRepo, projectRepo, options);

      // Should be approximately 30 minutes (allow for small time differences)
      expect(result.totalMinutes).toBeGreaterThanOrEqual(29);
      expect(result.totalMinutes).toBeLessThanOrEqual(31);
    });
  });

  describe('getDailySummary', () => {
    it('should return summary for a specific day', async () => {
      const date = new Date('2024-01-15');

      const result = await getDailySummary(timeEntryRepo, clientRepo, projectRepo, date);

      // Day 1 (Jan 15): 120 + 60 + 90 = 270 minutes
      expect(result.totalMinutes).toBe(270);
      expect(result.byDay).toHaveLength(1);
      expect(result.byDay[0].date).toBe('2024-01-15');
    });

    it('should include correct client breakdown for the day', async () => {
      const date = new Date('2024-01-15');

      const result = await getDailySummary(timeEntryRepo, clientRepo, projectRepo, date);

      // Acme Corp: 120 + 60 = 180 minutes
      // Globex Inc: 90 minutes
      expect(result.byClient).toHaveLength(2);

      const acme = result.byClient.find((c) => c.id === 'client-1');
      const globex = result.byClient.find((c) => c.id === 'client-2');

      expect(acme?.minutes).toBe(180);
      expect(globex?.minutes).toBe(90);
    });
  });

  describe('getWeeklySummary', () => {
    it('should return summary for a full week starting from given date', async () => {
      // Week starting Monday Jan 15, 2024
      const weekStart = new Date('2024-01-15');

      const result = await getWeeklySummary(timeEntryRepo, clientRepo, projectRepo, weekStart);

      // All entries are within Jan 15-16, so total is 570 minutes
      expect(result.totalMinutes).toBe(570);
    });

    it('should span exactly 7 days', async () => {
      const weekStart = new Date('2024-01-15');

      const result = await getWeeklySummary(timeEntryRepo, clientRepo, projectRepo, weekStart);

      // Should only include days with entries within the 7-day range
      expect(result.byDay.length).toBeGreaterThanOrEqual(1);
      expect(result.byDay.length).toBeLessThanOrEqual(7);
    });
  });

  describe('getMonthlySummary', () => {
    it('should return summary for a specific month', async () => {
      const result = await getMonthlySummary(timeEntryRepo, clientRepo, projectRepo, 2024, 1); // January 2024

      // All test entries are in January 2024
      expect(result.totalMinutes).toBe(570);
    });

    it('should handle different month lengths correctly', async () => {
      // Test with February (shorter month)
      const result = await getMonthlySummary(timeEntryRepo, clientRepo, projectRepo, 2024, 2);

      // No entries in February
      expect(result.totalMinutes).toBe(0);
      expect(result.byDay).toHaveLength(0);
    });

    it('should include correct number of days with entries', async () => {
      const result = await getMonthlySummary(timeEntryRepo, clientRepo, projectRepo, 2024, 1);

      // We have entries on Jan 15 and Jan 16
      expect(result.byDay).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('should sort byClient by minutes descending', async () => {
      const options: SummaryOptions = {
        startDate: new Date('2024-01-15T00:00:00.000Z'),
        endDate: new Date('2024-01-16T23:59:59.999Z'),
      };

      const result = await getTimeSummary(timeEntryRepo, clientRepo, projectRepo, options);

      // Acme Corp (360 min) should come before Globex Inc (210 min)
      expect(result.byClient[0].id).toBe('client-1');
      expect(result.byClient[1].id).toBe('client-2');
    });

    it('should sort byProject by minutes descending', async () => {
      const options: SummaryOptions = {
        startDate: new Date('2024-01-15T00:00:00.000Z'),
        endDate: new Date('2024-01-16T23:59:59.999Z'),
      };

      const result = await getTimeSummary(timeEntryRepo, clientRepo, projectRepo, options);

      // Website Redesign (300) > API Development (210) > Mobile App (60)
      expect(result.byProject[0].id).toBe('project-1'); // 300 min
      expect(result.byProject[1].id).toBe('project-3'); // 210 min
      expect(result.byProject[2].id).toBe('project-2'); // 60 min
    });

    it('should sort byDay by date ascending', async () => {
      const options: SummaryOptions = {
        startDate: new Date('2024-01-15T00:00:00.000Z'),
        endDate: new Date('2024-01-16T23:59:59.999Z'),
      };

      const result = await getTimeSummary(timeEntryRepo, clientRepo, projectRepo, options);

      expect(result.byDay[0].date).toBe('2024-01-15');
      expect(result.byDay[1].date).toBe('2024-01-16');
    });
  });
});
