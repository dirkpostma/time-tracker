import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { getSupabaseClient } from '../db/client.js';
import { addClient, Client } from './client.js';
import { addProject, Project } from './project.js';
import { getRunningTimer, stopTimer } from './timeEntry.js';
import { saveLastUsed } from '../config.js';
import path from 'path';

const CLI_PATH = path.join(process.cwd(), 'dist', 'index.js');
const ARROW_DOWN = '\x1b[B';
const ENTER = '\r';

interface FakeTtyProcess {
  proc: ChildProcess;
  write: (data: string) => void;
  kill: () => void;
  output: string;
  onData: (handler: (data: string) => void) => void;
}

function spawnCli(): FakeTtyProcess {
  // Use FORCE_TTY env var to make inquirer think it's a TTY
  const proc = spawn(process.execPath, [CLI_PATH], {
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

    // Check if already matched
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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('interactive mode integration', () => {
  const testId = Date.now();
  let testClient: Client;
  let testClient2: Client;
  let testProject: Project;

  beforeAll(async () => {
    // Create test data
    testClient = await addClient(`IntTest Client A ${testId}`);
    testClient2 = await addClient(`IntTest Client B ${testId}`);
    testProject = await addProject(`IntTest Project ${testId}`, testClient.id);
  });

  afterAll(async () => {
    const supabase = getSupabaseClient();

    // Stop any running timer
    const running = await getRunningTimer();
    if (running) {
      await stopTimer();
    }

    // Clean up test data
    await supabase.from('time_entries').delete().eq('client_id', testClient.id);
    await supabase.from('time_entries').delete().eq('client_id', testClient2.id);
    await supabase.from('projects').delete().eq('id', testProject.id);
    await supabase.from('clients').delete().eq('id', testClient.id);
    await supabase.from('clients').delete().eq('id', testClient2.id);
  });

  beforeEach(async () => {
    // Stop any running timer before each test
    const running = await getRunningTimer();
    if (running) {
      await stopTimer();
    }
    // Clear last-used config to avoid interference from other tests
    saveLastUsed({});
  });

  it('starts timer by selecting client and accepting defaults', async () => {
    const proc = spawnCli();

    try {
      // Wait for client selection prompt, accept first client
      await waitForOutput(proc, 'Select client');
      await sleep(100);
      proc.write(ENTER);

      // Wait for project selection, accept first option (could be a project or [Skip])
      await waitForOutput(proc, 'Select project');
      await sleep(100);
      proc.write(ENTER);

      // If a project was selected, we'll see task selection
      // If [Skip] was selected, we'll go straight to description
      // Either way, keep pressing enter until we see "Timer started"
      await sleep(200);
      proc.write(ENTER); // task or description
      await sleep(200);
      proc.write(ENTER); // description if task was shown

      // Wait for timer started message
      await waitForOutput(proc, 'Timer started', 10000);

      // Verify timer is running
      const running = await getRunningTimer();
      expect(running).not.toBeNull();
    } finally {
      proc.kill();
    }
  }, 15000);

  it('stops running timer via interactive menu', async () => {
    // First start a timer
    const supabase = getSupabaseClient();
    await supabase.from('time_entries').insert({
      client_id: testClient.id,
      project_id: testProject.id,
      started_at: new Date().toISOString(),
    });

    const proc = spawnCli();

    try {
      // Wait for "What would you like to do" menu
      await waitForOutput(proc, 'What would you like to do');
      await sleep(100);

      // "Stop timer" should be first option
      proc.write(ENTER);

      // Wait for confirmation
      await waitForOutput(proc, 'Timer stopped');

      // Verify timer is stopped
      const running = await getRunningTimer();
      expect(running).toBeNull();
    } finally {
      proc.kill();
    }
  }, 15000);

  it('cancels without changes when timer is running', async () => {
    // Start a timer
    const supabase = getSupabaseClient();
    const { data: entry } = await supabase.from('time_entries').insert({
      client_id: testClient.id,
      started_at: new Date().toISOString(),
    }).select().single();

    const proc = spawnCli();

    try {
      // Wait for menu
      await waitForOutput(proc, 'What would you like to do');
      await sleep(100);

      // Navigate to Cancel (third option)
      proc.write(ARROW_DOWN); // Switch
      await sleep(50);
      proc.write(ARROW_DOWN); // Cancel
      await sleep(50);
      proc.write(ENTER);

      // Give it time to exit
      await sleep(500);

      // Verify timer is still running
      const running = await getRunningTimer();
      expect(running).not.toBeNull();
      expect(running?.id).toBe(entry?.id);
    } finally {
      proc.kill();
    }
  }, 15000);
});
