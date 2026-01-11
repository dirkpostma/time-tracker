/**
 * Interactive mode handler for the `tt` command (no arguments).
 *
 * Flow:
 * 1. If a timer is running → show menu: Stop / Switch / Cancel
 * 2. If no timer → walk user through: Client → Project → Task → Description → Start
 *
 * Features:
 * - Arrow-key selection via inquirer's `select` prompt
 * - "Last used" client/project pre-selected (via config.ts)
 * - Create new client/project/task inline via "[+ New ...]" options
 * - Skip project/task via "[Skip]" option
 *
 * Testing:
 * - Unit tests inject mock `selectFn`/`inputFn` to simulate user input
 * - Integration tests use FORCE_TTY=1 env var to run inquirer in piped stdin
 */

import { select, input } from '@inquirer/prompts';
import { listClients, addClient, Client } from './client.js';
import { listProjectsByClient, addProject, Project } from './project.js';
import { listTasks, addTask, Task } from './task.js';
import { getStatus, startTimer, stopTimer, TimerStatus } from './timeEntry.js';
import { loadRecent, saveRecent } from '../recent.js';

/** Result returned by runInteractiveMode() for testing/verification */
export interface InteractiveResult {
  action: 'started' | 'stopped' | 'switched' | 'cancelled';
  timerStarted?: boolean;
  clientId?: string;
  projectId?: string;
  taskId?: string;
}

/**
 * Dependency injection for testing.
 * In production, uses real inquirer prompts.
 * In tests, pass mock functions that return predetermined values.
 */
export interface InteractiveOptions {
  selectFn?: typeof select;
  inputFn?: typeof input;
}

type SelectChoice = {
  name: string;
  value: string;
};

/**
 * Special values used in select choices:
 * - SKIP: User chose to skip this step (e.g., no project)
 * - NEW: User wants to create a new entity inline
 */
const SKIP = '__skip__';
const NEW = '__new__';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatTimerInfo(status: TimerStatus): string {
  let info = status.client.name;
  if (status.project) {
    info += ` > ${status.project.name}`;
  }
  if (status.task) {
    info += ` > ${status.task.name}`;
  }
  return info;
}

async function selectClient(
  clients: Client[],
  lastUsedClientId: string | undefined,
  selectFn: typeof select
): Promise<{ clientId: string; isNew: boolean; newName?: string }> {
  const choices: SelectChoice[] = clients.map((c) => ({
    name: c.name,
    value: c.id,
  }));
  choices.push({ name: '[+ New client]', value: NEW });

  // Find default (last used)
  const defaultIndex = lastUsedClientId
    ? choices.findIndex((c) => c.value === lastUsedClientId)
    : -1;

  const selected = await selectFn({
    message: 'Select client:',
    choices,
    default: defaultIndex >= 0 ? choices[defaultIndex].value : undefined,
  });

  return { clientId: selected as string, isNew: selected === NEW };
}

async function selectProject(
  projects: Project[],
  lastUsedProjectId: string | undefined,
  selectFn: typeof select
): Promise<{ projectId: string | null; isNew: boolean }> {
  const choices: SelectChoice[] = projects.map((p) => ({
    name: p.name,
    value: p.id,
  }));
  choices.push({ name: '[Skip]', value: SKIP });
  choices.push({ name: '[+ New project]', value: NEW });

  // Find default (last used)
  const defaultIndex = lastUsedProjectId
    ? choices.findIndex((c) => c.value === lastUsedProjectId)
    : -1;

  const selected = await selectFn({
    message: 'Select project:',
    choices,
    default: defaultIndex >= 0 ? choices[defaultIndex].value : undefined,
  });

  if (selected === SKIP) {
    return { projectId: null, isNew: false };
  }

  return { projectId: selected as string, isNew: selected === NEW };
}

async function selectTask(
  tasks: Task[],
  selectFn: typeof select
): Promise<{ taskId: string | null; isNew: boolean }> {
  const choices: SelectChoice[] = tasks.map((t) => ({
    name: t.name,
    value: t.id,
  }));
  choices.push({ name: '[Skip]', value: SKIP });
  choices.push({ name: '[+ New task]', value: NEW });

  const selected = await selectFn({
    message: 'Select task:',
    choices,
  });

  if (selected === SKIP) {
    return { taskId: null, isNew: false };
  }

  return { taskId: selected as string, isNew: selected === NEW };
}

async function handleRunningTimer(
  status: TimerStatus,
  selectFn: typeof select
): Promise<'stop' | 'switch' | 'cancel'> {
  console.log(
    `\nTimer running: ${formatDuration(status.duration)} on "${formatTimerInfo(status)}"\n`
  );

  const action = await selectFn({
    message: 'What would you like to do?',
    choices: [
      { name: 'Stop timer', value: 'stop' },
      { name: 'Switch to different client/project', value: 'switch' },
      { name: 'Cancel', value: 'cancel' },
    ],
  });

  return action as 'stop' | 'switch' | 'cancel';
}

async function runSelectionFlow(
  selectFn: typeof select,
  inputFn: typeof input
): Promise<{
  clientId: string;
  projectId: string | undefined;
  taskId: string | undefined;
  description: string | undefined;
}> {
  const lastUsed = loadRecent();

  // Select or create client
  const clients = await listClients();
  let { clientId, isNew: isNewClient } = await selectClient(
    clients,
    lastUsed.clientId,
    selectFn
  );

  if (isNewClient) {
    const name = await inputFn({ message: 'Client name:' });
    const newClient = await addClient(name);
    clientId = newClient.id;
  }

  // Select or create project
  const projects = await listProjectsByClient(clientId);
  let { projectId, isNew: isNewProject } = await selectProject(
    projects,
    lastUsed.projectId,
    selectFn
  );

  if (isNewProject) {
    const name = await inputFn({ message: 'Project name:' });
    const newProject = await addProject(name, clientId);
    projectId = newProject.id;
  }

  // Select or create task (only if project selected)
  let taskId: string | undefined;
  if (projectId) {
    const tasks = await listTasks(projectId);
    const { taskId: selectedTaskId, isNew: isNewTask } = await selectTask(tasks, selectFn);

    if (isNewTask) {
      const name = await inputFn({ message: 'Task name:' });
      const newTask = await addTask(name, projectId);
      taskId = newTask.id;
    } else if (selectedTaskId) {
      taskId = selectedTaskId;
    }
  }

  // Get description
  const description = await inputFn({ message: 'Description (optional):' });

  // Save last used
  saveRecent({ clientId, projectId: projectId || undefined });

  return {
    clientId,
    projectId: projectId || undefined,
    taskId,
    description: description || undefined,
  };
}

export async function runInteractiveMode(
  options?: InteractiveOptions
): Promise<InteractiveResult> {
  const selectFn = options?.selectFn || select;
  const inputFn = options?.inputFn || input;

  // Check if timer is running
  const status = await getStatus();

  if (status) {
    const action = await handleRunningTimer(status, selectFn);

    if (action === 'stop') {
      await stopTimer();
      console.log('Timer stopped.');
      return { action: 'stopped' };
    }

    if (action === 'cancel') {
      return { action: 'cancelled' };
    }

    // Switch: stop current and start new
    await stopTimer();
    const { clientId, projectId, taskId, description } = await runSelectionFlow(
      selectFn,
      inputFn
    );
    await startTimer(clientId, projectId, taskId, description);
    console.log('Timer switched.');
    return {
      action: 'switched',
      timerStarted: true,
      clientId,
      projectId,
      taskId,
    };
  }

  // No timer running - start new one
  const { clientId, projectId, taskId, description } = await runSelectionFlow(
    selectFn,
    inputFn
  );
  await startTimer(clientId, projectId, taskId, description);
  console.log('Timer started.');
  return {
    action: 'started',
    timerStarted: true,
    clientId,
    projectId,
    taskId,
  };
}
