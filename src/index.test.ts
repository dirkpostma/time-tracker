import { describe, it, expect, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { getSupabaseClient } from './db/client.js';

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
