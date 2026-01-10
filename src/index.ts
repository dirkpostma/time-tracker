#!/usr/bin/env node
import { program } from 'commander';
import { confirm } from '@inquirer/prompts';
import { addClient, listClients } from './commands/client.js';
import { addProject, listProjects, findClientByName } from './commands/project.js';
import { listTasks, findProjectByName } from './commands/task.js';

program
  .name('tt')
  .description('Time tracking CLI')
  .version('1.0.0');

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

program.parse();
