#!/usr/bin/env node

/**
 * FORCE_TTY: Enables interactive mode testing without a real terminal.
 *
 * Problem: inquirer prompts check `process.stdin.isTTY` and refuse to run
 * when stdin is a pipe (e.g., in tests or CI).
 *
 * Solution: Set FORCE_TTY=1 to override isTTY checks. This allows integration
 * tests to spawn the CLI with piped stdin and send arrow keys / enter to
 * simulate user interaction.
 *
 * Usage: FORCE_TTY=1 node dist/index.js
 */
if (process.env.FORCE_TTY === '1') {
  Object.defineProperty(process.stdin, 'isTTY', { value: true });
  Object.defineProperty(process.stdout, 'isTTY', { value: true });
}

import { program } from './cli/index.js';

program.parse();
