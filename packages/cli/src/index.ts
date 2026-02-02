#!/usr/bin/env node
/**
 * CLI entry point - Commander setup and command registration.
 */

import { program } from 'commander';
import { addClient, listClients } from './client.js';
import { addProject, listProjects, findClientByName } from './project.js';
import { listTasks, findProjectByName, addTask, findTaskByName } from './task.js';
import { startTimer, stopTimer, getStatus } from './timeEntry.js';
import { configCommand, ensureConfig, showConfig } from './config.js';
import { loginCommand, logoutCommand, whoamiCommand, ensureAuth } from './auth.js';

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
      const client = await findClientByName(options.client);
      if (!client) {
        console.error(`Error: Client "${options.client}" not found`);
        process.exit(1);
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
      const forceStart = options.force || false;

      if (runningStatus && !forceStart) {
        const hours = Math.floor(runningStatus.duration / 3600);
        const minutes = Math.floor((runningStatus.duration % 3600) / 60);
        const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        console.error('Timer already running:');
        console.error(`  Client: ${runningStatus.client.name}`);
        if (runningStatus.project) {
          console.error(`  Project: ${runningStatus.project.name}`);
        }
        if (runningStatus.task) {
          console.error(`  Task: ${runningStatus.task.name}`);
        }
        console.error(`  Duration: ${durationStr}`);
        console.error('');
        console.error('Use --force to stop it and start a new one.');
        process.exit(1);
      }

      // Find client
      const client = await findClientByName(options.client);
      if (!client) {
        console.error(`Error: Client "${options.client}" not found`);
        process.exit(1);
      }

      // Find project if provided
      let projectId: string | undefined;
      if (options.project) {
        const project = await findProjectByName(options.project, client.id);
        if (!project) {
          console.error(`Error: Project "${options.project}" not found`);
          process.exit(1);
        }
        projectId = project.id;

        // Find task if provided (requires project)
        if (options.task) {
          const existingTask = await findTaskByName(options.task, projectId);
          if (!existingTask) {
            console.error(`Error: Task "${options.task}" not found`);
            process.exit(1);
          }
        }
      } else if (options.task) {
        console.error('Task requires a project. Use --project to specify one.');
        process.exit(1);
      }

      // Find task ID if provided
      let taskId: string | undefined;
      if (options.task && projectId) {
        const existingTask = await findTaskByName(options.task, projectId);
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
  .option('--force', 'Overwrite existing description without confirmation')
  .action(async (options: { description?: string; force?: boolean }) => {
    try {
      const status = await getStatus();
      if (status && status.entry.description && options.description && !options.force) {
        console.error(`Timer already has description "${status.entry.description}". Use --force to overwrite.`);
        process.exit(1);
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
  .option('--url <url>', 'Supabase URL')
  .option('--key <key>', 'Supabase Publishable Key')
  .action(async (options: { show?: boolean; url?: string; key?: string }) => {
    try {
      if (options.show) {
        await showConfig();
      } else {
        await configCommand({ url: options.url, key: options.key });
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
  .option('--email <email>', 'Email address')
  .option('--password <password>', 'Password')
  .action(async (options: { email?: string; password?: string }) => {
    await loginCommand({ email: options.email, password: options.password });
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

// Default action: show help (no interactive mode)
program.action(() => {
  program.outputHelp();
});

program.parse();

export { program };
