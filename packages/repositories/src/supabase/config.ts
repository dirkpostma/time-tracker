/**
 * Config module for storing Supabase credentials.
 *
 * Priority:
 * 1. Environment variables (SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
 * 2. Config file at ~/.tt/config.json
 *
 * Environment variables take precedence for testing and CI/CD flexibility.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.tt');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface Config {
  supabaseUrl: string;
  supabaseKey: string;
  auth?: AuthTokens;
}

/**
 * Returns the path to the config file.
 */
export function getConfigPath(): string {
  return CONFIG_FILE;
}

/**
 * Loads Supabase configuration.
 * Priority: 1) Environment variables, 2) Config file
 * @param configPath - Optional override for testing
 */
export function getConfig(configPath?: string): Config | null {
  // First, check environment variables (for testing and CI/CD)
  const envUrl = process.env.SUPABASE_URL;
  const envKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (envUrl && envKey) {
    return { supabaseUrl: envUrl, supabaseKey: envKey };
  }

  // Then, check config file
  const filePath = configPath ?? CONFIG_FILE;
  if (!existsSync(filePath)) return null;

  try {
    const content = readFileSync(filePath, 'utf-8');
    const config = JSON.parse(content);

    if (config.supabaseUrl && config.supabaseKey) {
      return config as Config;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves Supabase configuration.
 * @param configPath - Optional override for testing
 */
export function saveConfig(config: Config, configPath?: string): void {
  const filePath = configPath ?? CONFIG_FILE;
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filePath, JSON.stringify(config, null, 2), { mode: 0o600 });
}

/**
 * Gets auth tokens from config file.
 * @param configPath - Optional override for testing
 */
export function getAuthTokens(configPath?: string): AuthTokens | null {
  const filePath = configPath ?? CONFIG_FILE;
  if (!existsSync(filePath)) return null;

  try {
    const content = readFileSync(filePath, 'utf-8');
    const config = JSON.parse(content);
    return config.auth ?? null;
  } catch {
    return null;
  }
}

/**
 * Saves auth tokens to config file.
 * @param configPath - Optional override for testing
 */
export function saveAuthTokens(tokens: AuthTokens, configPath?: string): void {
  const filePath = configPath ?? CONFIG_FILE;
  if (!existsSync(filePath)) {
    throw new Error('Config file not found. Run `tt config` first.');
  }

  const content = readFileSync(filePath, 'utf-8');
  const config = JSON.parse(content);
  config.auth = tokens;
  writeFileSync(filePath, JSON.stringify(config, null, 2), { mode: 0o600 });
}

/**
 * Clears auth tokens from config file.
 * @param configPath - Optional override for testing
 */
export function clearAuthTokens(configPath?: string): void {
  const filePath = configPath ?? CONFIG_FILE;
  if (!existsSync(filePath)) return;

  try {
    const content = readFileSync(filePath, 'utf-8');
    const config = JSON.parse(content);
    delete config.auth;
    writeFileSync(filePath, JSON.stringify(config, null, 2), { mode: 0o600 });
  } catch {
    // Ignore errors when clearing
  }
}
