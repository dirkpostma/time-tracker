import { input } from '@inquirer/prompts';
import { getConfig, saveConfig, getConfigPath } from '../config.js';

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

  saveConfig({ supabaseUrl: url, supabaseKey: key });
  console.log(`\nConfiguration saved to ${getConfigPath()}`);
}
