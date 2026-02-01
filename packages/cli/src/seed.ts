/**
 * Seed command - populate database with test data
 * 
 * SAFETY: Only runs on local databases by default.
 * Use --force to seed remote databases (with confirmation).
 */

import { createClient } from '@supabase/supabase-js';
import { confirm } from '@inquirer/prompts';
import { getConfig } from '@time-tracker/repositories/supabase/config';

/**
 * Check if a Supabase URL is local (safe to seed without confirmation)
 */
export function isLocalDatabase(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    // Local development patterns
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local') ||
      hostname === 'host.docker.internal'
    );
  } catch {
    return false;
  }
}

/**
 * Check if URL looks like production
 */
export function looksLikeProduction(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('prod') || lower.includes('production');
}

interface SeedClient {
  id: string;
  name: string;
}

interface SeedProject {
  id: string;
  client_id: string;
  name: string;
}

interface SeedTask {
  id: string;
  project_id: string;
  name: string;
}

// Use proper UUID format (hex only - no letters beyond a-f)
const SEED_CLIENTS: SeedClient[] = [
  { id: '01000001-0001-4001-8001-000000000001', name: 'Acme Corporation' },
  { id: '01000001-0001-4001-8001-000000000002', name: 'TechStart Inc' },
  { id: '01000001-0001-4001-8001-000000000003', name: 'Green Energy Solutions' },
  { id: '01000001-0001-4001-8001-000000000004', name: 'Digital Marketing Pro' },
];

const SEED_PROJECTS: SeedProject[] = [
  // Acme Corporation
  { id: '02000001-0001-4001-8001-000000000001', client_id: '01000001-0001-4001-8001-000000000001', name: 'Website Redesign' },
  { id: '02000001-0001-4001-8001-000000000002', client_id: '01000001-0001-4001-8001-000000000001', name: 'Mobile App Development' },
  { id: '02000001-0001-4001-8001-000000000003', client_id: '01000001-0001-4001-8001-000000000001', name: 'API Integration' },
  // TechStart Inc
  { id: '02000001-0001-4001-8001-000000000004', client_id: '01000001-0001-4001-8001-000000000002', name: 'MVP Development' },
  { id: '02000001-0001-4001-8001-000000000005', client_id: '01000001-0001-4001-8001-000000000002', name: 'User Research' },
  // Green Energy Solutions
  { id: '02000001-0001-4001-8001-000000000006', client_id: '01000001-0001-4001-8001-000000000003', name: 'Dashboard Development' },
  { id: '02000001-0001-4001-8001-000000000007', client_id: '01000001-0001-4001-8001-000000000003', name: 'Data Analytics' },
  // Digital Marketing Pro
  { id: '02000001-0001-4001-8001-000000000008', client_id: '01000001-0001-4001-8001-000000000004', name: 'Campaign Management' },
  { id: '02000001-0001-4001-8001-000000000009', client_id: '01000001-0001-4001-8001-000000000004', name: 'Social Media Integration' },
];

const SEED_TASKS: SeedTask[] = [
  // Website Redesign
  { id: '03000001-0001-4001-8001-000000000001', project_id: '02000001-0001-4001-8001-000000000001', name: 'Design mockups' },
  { id: '03000001-0001-4001-8001-000000000002', project_id: '02000001-0001-4001-8001-000000000001', name: 'Frontend development' },
  { id: '03000001-0001-4001-8001-000000000003', project_id: '02000001-0001-4001-8001-000000000001', name: 'Testing & QA' },
  // Mobile App Development
  { id: '03000001-0001-4001-8001-000000000004', project_id: '02000001-0001-4001-8001-000000000002', name: 'iOS development' },
  { id: '03000001-0001-4001-8001-000000000005', project_id: '02000001-0001-4001-8001-000000000002', name: 'Android development' },
  { id: '03000001-0001-4001-8001-000000000006', project_id: '02000001-0001-4001-8001-000000000002', name: 'Code review' },
  // MVP Development
  { id: '03000001-0001-4001-8001-000000000007', project_id: '02000001-0001-4001-8001-000000000004', name: 'Architecture planning' },
  { id: '03000001-0001-4001-8001-000000000008', project_id: '02000001-0001-4001-8001-000000000004', name: 'Core features' },
  { id: '03000001-0001-4001-8001-000000000009', project_id: '02000001-0001-4001-8001-000000000004', name: 'Bug fixes' },
  // Dashboard Development
  { id: '03000001-0001-4001-8001-000000000010', project_id: '02000001-0001-4001-8001-000000000006', name: 'UI components' },
  { id: '03000001-0001-4001-8001-000000000011', project_id: '02000001-0001-4001-8001-000000000006', name: 'Data visualization' },
  { id: '03000001-0001-4001-8001-000000000012', project_id: '02000001-0001-4001-8001-000000000006', name: 'Performance optimization' },
];

export async function seedDatabase(options: { force?: boolean } = {}): Promise<void> {
  // Get config from file or env
  const config = getConfig();
  if (!config) {
    throw new Error('Supabase not configured. Run `tt config` first or set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY environment variables.');
  }
  
  const { supabaseUrl } = config;
  const isLocal = isLocalDatabase(supabaseUrl);
  const isProdLike = looksLikeProduction(supabaseUrl);
  
  // Safety check for non-local databases
  if (!isLocal) {
    console.log(`\n⚠️  WARNING: Target database is NOT local!`);
    console.log(`   URL: ${supabaseUrl}\n`);
    
    if (isProdLike) {
      console.log(`🚨 DANGER: URL contains 'prod' - this looks like a production database!\n`);
    }
    
    if (!options.force) {
      throw new Error(
        'Refusing to seed non-local database without --force flag.\n' +
        'This is a safety measure to prevent accidental data loss.\n\n' +
        'If you really want to seed this database, run:\n' +
        '  tt seed --force'
      );
    }
    
    // Even with --force, require interactive confirmation
    const confirmed = await confirm({
      message: isProdLike 
        ? '🚨 DANGER: This looks like PRODUCTION! Are you absolutely sure?' 
        : 'Are you sure you want to seed this remote database?',
      default: false,
    });
    
    if (!confirmed) {
      console.log('Aborted.');
      return;
    }
  }
  
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);
  
  // Authenticate as test user for RLS
  console.log('Authenticating as test user...');
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'Test1234',
  });
  
  if (authError) {
    throw new Error(`Authentication failed: ${authError.message}. Make sure test@example.com user exists.`);
  }
  console.log('✓ Authenticated\n');

  // Clean up old test data first
  console.log('Cleaning up old test data...');
  const { error: deleteClientsError } = await supabase
    .from('clients')
    .delete()
    .not('id', 'in', `(${SEED_CLIENTS.map(c => `"${c.id}"`).join(',')})`);
  
  if (deleteClientsError) {
    console.log(`  Note: ${deleteClientsError.message}`);
  } else {
    console.log('  ✓ Cleaned up old clients');
  }

  console.log('\nSeeding database with test data...\n');

  // Seed clients
  console.log('Adding clients...');
  for (const client of SEED_CLIENTS) {
    const { error } = await supabase
      .from('clients')
      .upsert(client, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ✗ ${client.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${client.name}`);
    }
  }

  // Seed projects
  console.log('\nAdding projects...');
  for (const project of SEED_PROJECTS) {
    const { error } = await supabase
      .from('projects')
      .upsert(project, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ✗ ${project.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${project.name}`);
    }
  }

  // Seed tasks
  console.log('\nAdding tasks...');
  for (const task of SEED_TASKS) {
    const { error } = await supabase
      .from('tasks')
      .upsert(task, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ✗ ${task.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${task.name}`);
    }
  }

  console.log('\n✓ Seed complete!');
  console.log(`  ${SEED_CLIENTS.length} clients`);
  console.log(`  ${SEED_PROJECTS.length} projects`);
  console.log(`  ${SEED_TASKS.length} tasks`);
}
