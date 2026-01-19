/**
 * CLI command handlers for configuration operations.
 * These are thin wrappers that:
 * - Parse CLI input
 * - Call config functions
 * - Format and print output
 * - Handle errors with user-friendly messages
 */

import { input, confirm } from '@inquirer/prompts';
import { createClient } from '@supabase/supabase-js';
import { getConfig, saveConfig, getConfigPath, Config } from '@time-tracker/repositories/supabase/config';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates Supabase credentials by attempting a test connection.
 */
export async function validateCredentials(url: string, key: string): Promise<ValidationResult> {
  // Check URL format
  if (!url.match(/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\/?$/)) {
    return {
      valid: false,
      error: 'Invalid Supabase URL format. Expected: https://<project>.supabase.co',
    };
  }

  try {
    const client = createClient(url, key);
    // Make a simple query to test connection
    const { error } = await client.from('clients').select('id').limit(1);

    if (error) {
      // Check for auth errors
      if (error.message.includes('Invalid API key') || error.code === 'PGRST301' || error.code === '401') {
        return {
          valid: false,
          error: 'Invalid Supabase credentials. Check your API key.',
        };
      }
      return {
        valid: false,
        error: `Supabase connection failed: ${error.message}`,
      };
    }

    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('fetch failed') || message.includes('ENOTFOUND') || message.includes('network')) {
      return {
        valid: false,
        error: 'Could not connect to Supabase. Check your URL and network connection.',
      };
    }
    return {
      valid: false,
      error: `Supabase connection failed: ${message}`,
    };
  }
}

/**
 * Shows current configuration with masked key.
 */
export async function showConfig(): Promise<void> {
  const config = getConfig();

  if (!config) {
    console.log('No configuration found. Run `tt config` to set up.');
    return;
  }

  // Mask the key, showing only first 8 and last 4 chars
  const key = config.supabaseKey;
  const maskedKey = key.length > 12
    ? `${key.slice(0, 8)}****${key.slice(-4)}`
    : '****';

  console.log(`Supabase URL: ${config.supabaseUrl}`);
  console.log(`Supabase Key: ${maskedKey}`);
  console.log(`Config file:  ${getConfigPath()}`);
}

export async function configCommand(): Promise<void> {
  const existing = getConfig();

  console.log('Configure time-tracker credentials\n');

  const url = await input({
    message: 'Supabase URL:',
    default: existing?.supabaseUrl,
  });

  const key = await input({
    message: 'Supabase Publishable Key:',
    default: existing?.supabaseKey,
  });

  console.log('Validating credentials...');
  const result = await validateCredentials(url, key);

  if (!result.valid) {
    console.error(`Error: ${result.error}`);
    console.log('Credentials not saved.');
    return;
  }

  saveConfig({ supabaseUrl: url, supabaseKey: key });
  console.log(`\nConfiguration saved to ${getConfigPath()}`);
}

/**
 * Ensures configuration exists, prompting user to set up if missing.
 * Returns the config or exits if user declines setup.
 */
export async function ensureConfig(): Promise<Config> {
  const config = getConfig();

  if (config) {
    return config;
  }

  const shouldSetup = await confirm({
    message: 'No configuration found. Set up now?',
    default: true,
  });

  if (!shouldSetup) {
    console.log("Run 'tt config' when ready.");
    process.exit(0);
  }

  await configCommand();

  const newConfig = getConfig();
  if (!newConfig) {
    console.log("Configuration not saved. Run 'tt config' when ready.");
    process.exit(1);
  }

  return newConfig;
}
