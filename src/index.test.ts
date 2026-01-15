import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { getSupabaseClient } from './repositories/supabase/connection.js';

describe('tt CLI', () => {
  it('should show help', () => {
    const output = execSync('node dist/index.js --help').toString();
    expect(output).toContain('Time tracking CLI');
    expect(output).toContain('--help');
    expect(output).toContain('--version');
  });

  it('should show version', () => {
    const output = execSync('node dist/index.js --version').toString();
    expect(output).toContain('1.0.0');
  });

  it('should have client command', () => {
    const output = execSync('node dist/index.js client --help').toString();
    expect(output).toContain('add');
    expect(output).toContain('list');
  });
});

describe('tt client', () => {
  const testClientName = `CLI Test Client ${Date.now()}`;

  afterAll(async () => {
    // Clean up test data
    const client = getSupabaseClient();
    await client.from('clients').delete().eq('name', testClientName);
  });

  it('should add a client', () => {
    const output = execSync(`node dist/index.js client add "${testClientName}"`).toString();
    expect(output).toContain(testClientName);
    expect(output).toContain('created');
  });

  it('should list clients', () => {
    const output = execSync('node dist/index.js client list').toString();
    expect(output).toContain(testClientName);
  });
});

describe('tt project', () => {
  const testClientName = `CLI Project Test Client ${Date.now()}`;
  const testProjectName = `CLI Test Project ${Date.now()}`;

  afterAll(async () => {
    const supabase = getSupabaseClient();
    await supabase.from('projects').delete().eq('name', testProjectName);
    await supabase.from('clients').delete().eq('name', testClientName);
  });

  it('should have project command', () => {
    const output = execSync('node dist/index.js project --help').toString();
    expect(output).toContain('add');
    expect(output).toContain('list');
  });

  it('should add a project', () => {
    // First create client
    execSync(`node dist/index.js client add "${testClientName}"`);

    const output = execSync(`node dist/index.js project add "${testProjectName}" --client "${testClientName}"`).toString();
    expect(output).toContain(testProjectName);
    expect(output).toContain('created');
  });

  it('should list projects', () => {
    const output = execSync('node dist/index.js project list').toString();
    expect(output).toContain(testProjectName);
  });
});

describe('tt task', () => {
  const testClientName = `CLI Task Test Client ${Date.now()}`;
  const testProjectName = `CLI Task Test Project ${Date.now()}`;

  afterAll(async () => {
    const supabase = getSupabaseClient();
    await supabase.from('projects').delete().eq('name', testProjectName);
    await supabase.from('clients').delete().eq('name', testClientName);
  });

  it('should have task command', () => {
    const output = execSync('node dist/index.js task --help').toString();
    expect(output).toContain('list');
  });

  it('should list tasks (empty)', () => {
    // First create client and project
    execSync(`node dist/index.js client add "${testClientName}"`);
    execSync(`node dist/index.js project add "${testProjectName}" --client "${testClientName}"`);

    const output = execSync(`node dist/index.js task list --client "${testClientName}" --project "${testProjectName}"`).toString();
    expect(output).toContain('No tasks found');
  });
});

describe('tt time tracking', () => {
  const testClientName = `CLI Time Test Client ${Date.now()}`;
  const testProjectName = `CLI Time Test Project ${Date.now()}`;
  let testClientId: string;

  beforeAll(async () => {
    // Create client first so we can use its ID for cleanup
    execSync(`node dist/index.js client add "${testClientName}"`);
    const supabase = getSupabaseClient();
    const { data: client } = await supabase.from('clients').select('id').eq('name', testClientName).single();
    testClientId = client?.id;
  });

  afterAll(async () => {
    const supabase = getSupabaseClient();
    // Only clean up this test's data
    if (testClientId) {
      await supabase.from('time_entries').delete().eq('client_id', testClientId);
    }
    await supabase.from('projects').delete().eq('name', testProjectName);
    await supabase.from('clients').delete().eq('name', testClientName);
  });

  it('should have start, stop, status commands', () => {
    const output = execSync('node dist/index.js --help').toString();
    expect(output).toContain('start');
    expect(output).toContain('stop');
    expect(output).toContain('status');
  });

  it('should start a timer', () => {
    // Create project (client already created in beforeAll)
    execSync(`node dist/index.js project add "${testProjectName}" --client "${testClientName}"`);

    const output = execSync(`node dist/index.js start --client "${testClientName}" --project "${testProjectName}"`).toString();
    expect(output).toContain('Started timer');
  });

  it('should show status with running timer', () => {
    const output = execSync('node dist/index.js status').toString();
    expect(output).toContain(testProjectName);
    expect(output).toContain(testClientName);
  });

  it('should stop the timer', () => {
    const output = execSync('node dist/index.js stop').toString();
    expect(output).toContain('Timer stopped');
  });

  it('should error when starting timer while one is running (non-TTY)', () => {
    // Start a timer first
    execSync(`node dist/index.js start --client "${testClientName}" --project "${testProjectName}"`);

    // Try to start another without --force (non-TTY should error)
    try {
      execSync(`node dist/index.js start --client "${testClientName}"`);
      expect.fail('Should have thrown');
    } catch (error: unknown) {
      const stderr = (error as { stderr?: Buffer }).stderr?.toString() || '';
      expect(stderr).toContain('Timer already running');
      expect(stderr).toContain('--force');
    }

    // Clean up
    execSync('node dist/index.js stop');
  });

  it('should switch timers with --force flag', () => {
    // Start first timer
    execSync(`node dist/index.js start --client "${testClientName}" --project "${testProjectName}"`);

    // Start second timer with --force
    const output = execSync(`node dist/index.js start --client "${testClientName}" --force`).toString();

    expect(output).toContain('Stopped timer');
    expect(output).toContain('Started timer');

    // Clean up - stop the timer we just started
    execSync('node dist/index.js stop');
  });
});
