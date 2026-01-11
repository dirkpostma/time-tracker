/**
 * Recent module for storing recently used selections.
 *
 * Purpose: When running `tt` in interactive mode, we want to pre-select
 * the client/project the user chose last time. This saves them from
 * navigating through the list every time they start a timer.
 *
 * Storage: Simple JSON file at ~/.tt-recent.json
 * Format: { "clientId": "uuid", "projectId": "uuid" }
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

export interface Recent {
  clientId?: string;
  projectId?: string;
}

/**
 * Returns the path to the recent file.
 * @param recentPath - Optional override for testing (avoids touching real file)
 */
export function getRecentPath(): string {
  return path.join(os.homedir(), '.tt-recent.json');
}

/**
 * Loads the recently used client/project IDs.
 * Returns empty object if file doesn't exist or is invalid.
 * @param recentPath - Optional override for testing
 */
export function loadRecent(recentPath?: string): Recent {
  const filePath = recentPath ?? getRecentPath();

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
 * Saves the recently used client/project IDs.
 * Called after user selects client/project in interactive mode.
 * @param recentPath - Optional override for testing
 */
export function saveRecent(data: Recent, recentPath?: string): void {
  const filePath = recentPath ?? getRecentPath();
  fs.writeFileSync(filePath, JSON.stringify(data));
}
