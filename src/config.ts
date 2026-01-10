/**
 * Config module for persisting user preferences across CLI sessions.
 *
 * Purpose: When running `tt` in interactive mode, we want to pre-select
 * the client/project the user chose last time. This saves them from
 * navigating through the list every time they start a timer.
 *
 * Storage: Simple JSON file at ~/.tt-config.json
 * Format: { "clientId": "uuid", "projectId": "uuid" }
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

export interface LastUsed {
  clientId?: string;
  projectId?: string;
}

/**
 * Returns the path to the config file.
 * @param configPath - Optional override for testing (avoids touching real config)
 */
export function getConfigPath(): string {
  return path.join(os.homedir(), '.tt-config.json');
}

/**
 * Loads the last-used client/project IDs from the config file.
 * Returns empty object if file doesn't exist or is invalid.
 * @param configPath - Optional override for testing
 */
export function loadLastUsed(configPath?: string): LastUsed {
  const filePath = configPath ?? getConfigPath();

  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

/**
 * Saves the last-used client/project IDs to the config file.
 * Called after user selects client/project in interactive mode.
 * @param configPath - Optional override for testing
 */
export function saveLastUsed(data: LastUsed, configPath?: string): void {
  const filePath = configPath ?? getConfigPath();
  fs.writeFileSync(filePath, JSON.stringify(data));
}
