import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { getSupabaseClient } from '@time-tracker/repositories/supabase/connection';
import { addClient, Client } from './client.js';
import { addProject, Project } from './project.js';
import { stopTimer, getRunningTimer } from './timeEntry.js';
import path from 'path';

const CLI_PATH = path.join(process.cwd(), 'dist', 'index.js');
const ENTER = '\r';

interface FakeTtyProcess {
  proc: ChildProcess;
  write: (data: string) => void;
  kill: () => void;
  output: string;
  onData: (handler: (data: string) => void) => void;
}

function spawnCli(args: string[]): FakeTtyProcess {
  const proc = spawn(process.execPath, [CLI_PATH, ...args], {
    cwd: process.cwd(),
    env: { ...process.env, FORCE_TTY: '1' } as { [key: string]: string },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let output = '';
  const handlers: ((data: string) => void)[] = [];

  proc.stdout?.on('data', (data: Buffer) => {
    const str = data.toString();
    output += str;
    handlers.forEach(h => h(str));
  });

  proc.stderr?.on('data', (data: Buffer) => {
    const str = data.toString();
    output += str;
    handlers.forEach(h => h(str));
  });

  return {
    proc,
    write: (data: string) => proc.stdin?.write(data),
    kill: () => proc.kill(),
    get output() { return output; },
    onData: (handler) => handlers.push(handler),
  };
}

function waitForOutput(proc: FakeTtyProcess, pattern: string | RegExp, timeout = 5000): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`Timeout waiting for "${pattern}". Got: ${proc.output}`));
    }, timeout);

    const matches = typeof pattern === 'string'
      ? proc.output.includes(pattern)
      : pattern.test(proc.output);
    if (matches) {
      clearTimeout(timer);
      resolve(proc.output);
      return;
    }

    proc.onData(() => {
      const matches = typeof pattern === 'string'
        ? proc.output.includes(pattern)
        : pattern.test(proc.output);
      if (matches) {
        clearTimeout(timer);
        resolve(proc.output);
      }
    });
  });
}

function waitForExit(proc: FakeTtyProcess, timeout = 5000): Promise<number> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`Timeout waiting for exit. Got: ${proc.output}`));
    }, timeout);

    proc.proc.on('exit', (code) => {
      clearTimeout(timer);
      resolve(code ?? 0);
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('entity name matching integration', () => {
  const testId = Date.now();
  let testClient: Client;
  let testProject: Project;

  beforeAll(async () => {
    // Create test data
    testClient = await addClient(`NameMatch Client ${testId}`);
    testProject = await addProject(`NameMatch Project ${testId}`, testClient.id);
  });

  afterAll(async () => {
    const supabase = getSupabaseClient();

    // Stop any running timer
    const running = await getRunningTimer();
    if (running) {
      await stopTimer();
    }

    // Clean up test data - delete in correct order due to foreign keys
    await supabase.from('time_entries').delete().eq('client_id', testClient.id);
    await supabase.from('projects').delete().eq('id', testProject.id);
    await supabase.from('clients').delete().eq('id', testClient.id);

    // Clean up any clients that might have been created during tests
    await supabase.from('clients').delete().like('name', `%NonExistent${testId}%`);
  });

  describe('entity.name-match.not-found', () => {
    /** @spec {entity.name-match.not-found} */
    it('should prompt "Client doesn\'t exist. Create it?" for non-existent client in project add', async () => {
      const nonExistentClient = `NonExistent${testId}`;
      const proc = spawnCli(['project', 'add', 'SomeProject', '--client', nonExistentClient]);

      try {
        // Wait for the prompt about non-existent client
        await waitForOutput(proc, `Client "${nonExistentClient}" doesn't exist. Create it?`);

        // The prompt appeared, which is what we're testing
        expect(proc.output).toContain(`Client "${nonExistentClient}" doesn't exist. Create it?`);

        // Answer 'n' to cancel
        proc.write('n');
        proc.write(ENTER);

        await waitForExit(proc);
      } finally {
        proc.kill();
      }
    }, 10000);

    /** @spec {entity.name-match.not-found} */
    it('should prompt "Client doesn\'t exist. Create it?" for non-existent client in start command', async () => {
      const nonExistentClient = `NonExistentStart${testId}`;

      // Stop any running timer first
      const running = await getRunningTimer();
      if (running) {
        await stopTimer();
      }

      const proc = spawnCli(['start', '--client', nonExistentClient]);

      try {
        // Wait for the prompt about non-existent client
        await waitForOutput(proc, `Client "${nonExistentClient}" doesn't exist. Create it?`);

        // The prompt appeared, which is what we're testing
        expect(proc.output).toContain(`Client "${nonExistentClient}" doesn't exist. Create it?`);

        // Answer 'n' to cancel
        proc.write('n');
        proc.write(ENTER);

        await waitForExit(proc);
      } finally {
        proc.kill();
      }
    }, 10000);

    /** @spec {entity.name-match.not-found} */
    it('should prompt "Project doesn\'t exist. Create it?" for non-existent project in start command', async () => {
      const nonExistentProject = `NonExistentProj${testId}`;

      // Stop any running timer first
      const running = await getRunningTimer();
      if (running) {
        await stopTimer();
      }

      const proc = spawnCli(['start', '--client', testClient.name, '--project', nonExistentProject]);

      try {
        // Wait for the prompt about non-existent project
        await waitForOutput(proc, `Project "${nonExistentProject}" doesn't exist. Create it?`);

        // The prompt appeared, which is what we're testing
        expect(proc.output).toContain(`Project "${nonExistentProject}" doesn't exist. Create it?`);

        // Answer 'n' to cancel
        proc.write('n');
        proc.write(ENTER);

        await waitForExit(proc);
      } finally {
        proc.kill();
      }
    }, 10000);

    /** @spec {entity.name-match.not-found} */
    it('should prompt "Task doesn\'t exist. Create it?" for non-existent task in start command', async () => {
      const nonExistentTask = `NonExistentTask${testId}`;

      // Stop any running timer first
      const running = await getRunningTimer();
      if (running) {
        await stopTimer();
      }

      const proc = spawnCli(['start', '--client', testClient.name, '--project', testProject.name, '--task', nonExistentTask]);

      try {
        // Wait for the prompt about non-existent task
        await waitForOutput(proc, `Task "${nonExistentTask}" doesn't exist. Create it?`);

        // The prompt appeared, which is what we're testing
        expect(proc.output).toContain(`Task "${nonExistentTask}" doesn't exist. Create it?`);

        // Answer 'n' to cancel
        proc.write('n');
        proc.write(ENTER);

        await waitForExit(proc);
      } finally {
        proc.kill();
      }
    }, 10000);

    /** @spec {entity.name-match.not-found} */
    it('should create entity when user confirms', async () => {
      const newClientName = `NewClient${testId}`;
      const newProjectName = `NewProject${testId}`;
      const supabase = getSupabaseClient();

      // Stop any running timer first
      const running = await getRunningTimer();
      if (running) {
        await stopTimer();
      }

      // Clean up in case test was run before
      await supabase.from('projects').delete().eq('name', newProjectName);
      await supabase.from('clients').delete().eq('name', newClientName);

      const proc = spawnCli(['project', 'add', newProjectName, '--client', newClientName]);

      try {
        // Wait for the client creation prompt
        await waitForOutput(proc, `Client "${newClientName}" doesn't exist. Create it?`);
        await sleep(100);

        // Confirm creation
        proc.write('y');
        proc.write(ENTER);

        // Wait for success message
        await waitForOutput(proc, `Client "${newClientName}" created`, 5000);
        await waitForOutput(proc, `Project "${newProjectName}" created`, 5000);

        await waitForExit(proc);

        // Verify client was created in database
        const { data: client } = await supabase
          .from('clients')
          .select('*')
          .eq('name', newClientName)
          .single();
        expect(client).toBeDefined();
        expect(client?.name).toBe(newClientName);

        // Verify project was created in database
        const { data: project } = await supabase
          .from('projects')
          .select('*')
          .eq('name', newProjectName)
          .single();
        expect(project).toBeDefined();
        expect(project?.name).toBe(newProjectName);
      } finally {
        proc.kill();
        // Clean up
        await supabase.from('projects').delete().eq('name', newProjectName);
        await supabase.from('clients').delete().eq('name', newClientName);
      }
    }, 15000);
  });

  describe('entity.name-match.found', () => {
    /** @spec {entity.name-match.found} */
    it('should use existing client without prompting when found', async () => {
      // Stop any running timer first
      const running = await getRunningTimer();
      if (running) {
        await stopTimer();
      }

      const proc = spawnCli(['start', '--client', testClient.name]);

      try {
        // Wait for timer started message (should not prompt since client exists)
        await waitForOutput(proc, `Started timer for ${testClient.name}`, 10000);

        // Verify no prompt was shown
        expect(proc.output).not.toContain("doesn't exist. Create it?");

        await waitForExit(proc);

        // Verify timer is running for the correct client
        const timerStatus = await getRunningTimer();
        expect(timerStatus).not.toBeNull();
        expect(timerStatus?.client_id).toBe(testClient.id);
      } finally {
        proc.kill();
        // Clean up timer
        const running = await getRunningTimer();
        if (running) {
          await stopTimer();
        }
      }
    }, 10000);

    /** @spec {entity.name-match.found} */
    it('should use existing project without prompting when found', async () => {
      // Stop any running timer first
      const running = await getRunningTimer();
      if (running) {
        await stopTimer();
      }

      const proc = spawnCli(['start', '--client', testClient.name, '--project', testProject.name]);

      try {
        // Wait for timer started message (should not prompt since project exists)
        await waitForOutput(proc, `Started timer for ${testClient.name} > ${testProject.name}`, 10000);

        // Verify no prompt was shown
        expect(proc.output).not.toContain("doesn't exist. Create it?");

        await waitForExit(proc);

        // Verify timer is running for the correct project
        const timerStatus = await getRunningTimer();
        expect(timerStatus).not.toBeNull();
        expect(timerStatus?.project_id).toBe(testProject.id);
      } finally {
        proc.kill();
        // Clean up timer
        const running = await getRunningTimer();
        if (running) {
          await stopTimer();
        }
      }
    }, 10000);
  });
});
