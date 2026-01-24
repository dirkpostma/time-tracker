export interface TimeEntry {
  id: string;
  client_id: string;
  started_at: string;
  ended_at: string | null;
  description?: string | null;
}

export interface Client {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  name: string;
}

export interface TimerSelection {
  clientId: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
}
