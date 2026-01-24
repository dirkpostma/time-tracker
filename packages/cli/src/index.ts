#!/usr/bin/env node
/**
 * CLI entry point - Commander setup and command registration.
 */

import { program } from 'commander';
import { confirm } from '@inquirer/prompts';
import { addClient, listClients } from './client.js';
import { addProject, listProjects, findClientByName } from './project.js';
import { listTasks, findProjectByName, addTask } from './task.js';
import { startTimer, stopTimer, getStatus, getRunningTimer } from './timeEntry.js';
import { runInteractiveMode } from './interactive.js';
import { configCommand, ensureConfig, showConfig } from './config.js';
import { loginCommand, logoutCommand, whoamiCommand, ensureAuth } from './auth.js';
import { getSupabaseClient } from '@time-tracker/repositories/supabase/connection';

// Commands that don't require authentication
const AUTH_EXEMPT = ['config', 'login', 'logout', 'whoami'];

program
  .name('tt')
  .description('Time tracking CLI')
  .version('1.0.0')
  .hook('preAction', async (thisCommand, actionCommand) => {
    // actionCommand is the actual command being executed
    const cmdName = actionCommand.name();

    // Skip config check for the config command itself
    if (cmdName === 'config') return;
    await ensureConfig();

    // Skip auth check for exempt commands
    if (AUTH_EXEMPT.includes(cmdName)) return;
    await ensureAuth();
  });

// Client commands
const clientCmd = program
  .command('client')
  .description('Manage clients');

clientCmd
  .command('add <name>')
  .description('Add a new client')
  .action(async (name: string) => {
    try {
      const client = await addClient(name);
      console.log(`Client "${client.name}" created (id: ${client.id})`);
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Failed to create client');
      process.exit(1);
    }
  });

clientCmd
  .command('list')
  .description('List all clients')
  .action(async () => {
    try {
      const clients = await listClients();
      if (clients.length === 0) {
        console.log('No clients found');
        return;
      }
      clients.forEach(client => {
        console.log(`${client.name} (id: ${client.id})`);
      });
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Failed to list clients');
      process.exit(1);
    }
  });

// Project commands
const projectCmd = program
  .command('project')
  .description('Manage projects');

projectCmd
  .command('add <name>')
  .description('Add a new project')
  .requiredOption('--client <client>', 'Client name')
  .action(async (name: string, options: { client: string }) => {
    try {
      let client = await findClientByName(options.client);
      if (!client) {
        const shouldCreate = await confirm({
          message: `Client "${options.client}" doesn't exist. Create it?`,
        });
        if (!shouldCreate) {
          console.log('Cancelled');
          process.exit(0);
        }
        client = await addClient(options.client);
        console.log(`Client "${client.name}" created (id: ${client.id})`);
      }
      const project = await addProject(name, client.id);
      console.log(`Project "${project.name}" created for client "${options.client}" (id: ${project.id})`);
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Failed to create project');
      process.exit(1);
    }
  });

projectCmd
  .command('list')
  .description('List all projects')
  .action(async () => {
    try {
      const projects = await listProjects();
      if (projects.length === 0) {
        console.log('No projects found');
        return;
      }
      projects.forEach(project => {
        console.log(`${project.name} (id: ${project.id})`);
      });
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Failed to list projects');
      process.exit(1);
    }
  });

// Task commands
const taskCmd = program
  .command('task')
  .description('Manage tasks');

taskCmd
  .command('list')
  .description('List tasks for a project')
  .requiredOption('--client <client>', 'Client name')
  .requiredOption('--project <project>', 'Project name')
  .action(async (options: { client: string; project: string }) => {
    try {
      const client = await findClientByName(options.client);
      if (!client) {
        console.error(`Client "${options.client}" not found`);
        process.exit(1);
      }
      const project = await findProjectByName(options.project, client.id);
      if (!project) {
        console.error(`Project "${options.project}" not found`);
        process.exit(1);
      }
      const tasks = await listTasks(project.id);
      if (tasks.length === 0) {
        console.log('No tasks found');
        return;
      }
      tasks.forEach(task => {
        console.log(`${task.name} (id: ${task.id})`);
      });
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Failed to list tasks');
      process.exit(1);
    }
  });

// Time tracking commands
program
  .command('start')
  .description('Start a timer')
  .requiredOption('--client <client>', 'Client name')
  .option('--project <project>', 'Project name')
  .option('--task <task>', 'Task name')
  .option('--description <description>', 'Description')
  .option('--force', 'Stop running timer without confirmation')
  .action(async (options: { client: string; project?: string; task?: string; description?: string; force?: boolean }) => {
    try {
      // Check if a timer is already running
      const runningStatus = await getStatus();
      let forceStart = options.force || false;

      if (runningStatus && !forceStart) {
        // Check if we can prompt (interactive terminal)
        if (!process.stdin.isTTY && process.env.FORCE_TTY !== '1') {
          console.error('Timer already running. Use --force to stop it and start a new one.');
          process.exit(1);
        }

        const hours = Math.floor(runningStatus.duration / 3600);
        const minutes = Math.floor((runningStatus.duration % 3600) / 60);
        const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        console.log('A timer is already running:');
        console.log(`  Client: ${runningStatus.client.name}`);
        if (runningStatus.project) {
          console.log(`  Project: ${runningStatus.project.name}`);
        }
        if (runningStatus.task) {
          console.log(`  Task: ${runningStatus.task.name}`);
        }
        console.log(`  Duration: ${durationStr}`);
        console.log('');

        const shouldSwitch = await confirm({
          message: 'Stop it and start a new one?',
        });

        if (!shouldSwitch) {
          console.log('Keeping current timer running.');
          return;
        }
        forceStart = true;
      }
      // Find or create client
      let client = await findClientByName(options.client);
      if (!client) {
        const shouldCreate = await confirm({
          message: `Client "${options.client}" doesn't exist. Create it?`,
        });
        if (!shouldCreate) {
          console.log('Cancelled');
          process.exit(0);
        }
        client = await addClient(options.client);
        console.log(`Client "${client.name}" created`);
      }

      // Find or create project if provided
      let projectId: string | undefined;
      if (options.project) {
        let project = await findProjectByName(options.project, client.id);
        if (!project) {
          const shouldCreate = await confirm({
            message: `Project "${options.project}" doesn't exist. Create it?`,
          });
          if (!shouldCreate) {
            console.log('Cancelled');
            process.exit(0);
          }
          project = await addProject(options.project, client.id);
          console.log(`Project "${project.name}" created`);
        }
        projectId = project.id;

        // Find or create task if provided (requires project)
        if (options.task) {
          const { data: existingTask } = await getSupabaseClient()
            .from('tasks')
            .select('*')
            .eq('name', options.task)
            .eq('project_id', projectId)
            .maybeSingle();

          if (!existingTask) {
            const shouldCreate = await confirm({
              message: `Task "${options.task}" doesn't exist. Create it?`,
            });
            if (!shouldCreate) {
              console.log('Cancelled');
              process.exit(0);
            }
            const task = await addTask(options.task, projectId);
            console.log(`Task "${task.name}" created`);
          }
        }
      } else if (options.task) {
        console.error('Task requires a project. Use --project to specify one.');
        process.exit(1);
      }

      // Find task ID if provided
      let taskId: string | undefined;
      if (options.task && projectId) {
        const { data: existingTask } = await getSupabaseClient()
          .from('tasks')
          .select('*')
          .eq('name', options.task)
          .eq('project_id', projectId)
          .maybeSingle();
        taskId = existingTask?.id;
      }

      // Show stopped timer info if we're switching
      if (forceStart && runningStatus) {
        const hours = Math.floor(runningStatus.duration / 3600);
        const minutes = Math.floor((runningStatus.duration % 3600) / 60);
        const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        let stoppedPath = runningStatus.client.name;
        if (runningStatus.project) stoppedPath += ` / ${runningStatus.project.name}`;
        if (runningStatus.task) stoppedPath += ` / ${runningStatus.task.name}`;
        console.log(`Stopped timer for ${stoppedPath} (${durationStr})`);
      }

      const entry = await startTimer(client.id, projectId, taskId, options.description, forceStart);
      let timerPath = options.client;
      if (options.project) timerPath += ` > ${options.project}`;
      if (options.task) timerPath += ` > ${options.task}`;
      console.log(`Started timer for ${timerPath}`);
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Failed to start timer');
      process.exit(1);
    }
  });

program
  .command('stop')
  .description('Stop the running timer')
  .option('--description <description>', 'Description')
  .action(async (options: { description?: string }) => {
    try {
      const status = await getStatus();
      if (status && status.entry.description && options.description) {
        const shouldOverwrite = await confirm({
          message: `Timer already has description "${status.entry.description}". Overwrite?`,
        });
        if (!shouldOverwrite) {
          // Stop without changing description
          await stopTimer();
          console.log('Timer stopped');
          return;
        }
      }

      const entry = await stopTimer(options.description);
      console.log('Timer stopped');
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Failed to stop timer');
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show the current timer status')
  .action(async () => {
    try {
      const status = await getStatus();
      if (!status) {
        console.log('No timer running');
        return;
      }

      const hours = Math.floor(status.duration / 3600);
      const minutes = Math.floor((status.duration % 3600) / 60);
      const seconds = status.duration % 60;
      const durationStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      console.log(`Client: ${status.client.name}`);
      if (status.project) {
        console.log(`Project: ${status.project.name}`);
      }
      if (status.task) {
        console.log(`Task: ${status.task.name}`);
      }
      if (status.entry.description) {
        console.log(`Description: ${status.entry.description}`);
      }
      console.log(`Duration: ${durationStr}`);
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Failed to get status');
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Configure Supabase credentials')
  .option('--show', 'Show current configuration')
  .action(async (options: { show?: boolean }) => {
    try {
      if (options.show) {
        await showConfig();
      } else {
        await configCommand();
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Failed to configure');
      process.exit(1);
    }
  });

// Auth commands
program
  .command('login')
  .description('Log in to your account')
  .action(async () => {
    await loginCommand();
  });

program
  .command('logout')
  .description('Log out of your account')
  .action(async () => {
    await logoutCommand();
  });

program
  .command('whoami')
  .description('Show current logged-in user')
  .action(async () => {
    await whoamiCommand();
  });

// Default action (interactive mode)
program.action(async () => {
  try {
    if (!process.stdin.isTTY && process.env.FORCE_TTY !== '1') {
      console.error('Interactive mode requires a TTY. Use `tt start --client <client>` instead.');
      process.exit(1);
    }
    await runInteractiveMode();
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Failed');
    process.exit(1);
  }
});

program.parse();

export { program };
