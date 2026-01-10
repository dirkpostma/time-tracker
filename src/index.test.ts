import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

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
});
