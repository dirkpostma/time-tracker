import { input } from '@inquirer/prompts';
import { createClient } from '@supabase/supabase-js';
import { getConfig, saveConfig, getConfigPath } from '../config.js';

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
      // Other errors might be OK (e.g., table doesn't exist yet)
      // As long as we connected, credentials are valid
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return { valid: true };
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
