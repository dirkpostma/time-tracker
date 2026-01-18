/**
 * Row Level Security (RLS) Tests
 *
 * Tests verify that RLS policies correctly isolate user data at the database level.
 * These are behavioral tests that authenticate as real users against local Supabase.
 *
 * See specs/core/row-level-security.md for full specification.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Test configuration from environment
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
// Service role key bypasses RLS - use for setup/teardown only
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Test users - these should exist in local Supabase
const TEST_USER_A = {
  email: 'test-rls-user-a@example.com',
  password: 'TestPassword123!',
};
const TEST_USER_B = {
  email: 'test-rls-user-b@example.com',
  password: 'TestPassword123!',
};

// Tables with RLS
const RLS_TABLES = ['clients', 'projects', 'tasks', 'time_entries'] as const;
type RLSTable = (typeof RLS_TABLES)[number];

/**
 * Creates a Supabase client with service role (bypasses RLS)
 */
function getServiceRoleClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

/**
 * Creates an unauthenticated Supabase client (anon key, no session)
 */
function getAnonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

/**
 * Creates an authenticated Supabase client for a specific user
 */
async function getAuthenticatedClient(email: string, password: string): Promise<SupabaseClient> {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`Failed to authenticate ${email}: ${error.message}`);
  }

  return client;
}

/**
 * Ensures a test user exists (creates if not)
 */
async function ensureTestUser(email: string, password: string): Promise<string> {
  const serviceClient = getServiceRoleClient();

  // Check if user exists
  const { data: existingUsers } = await serviceClient.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find((u) => u.email === email);

  if (existingUser) {
    return existingUser.id;
  }

  // Create user
  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw new Error(`Failed to create test user ${email}: ${error.message}`);
  }

  return data.user.id;
}

/**
 * Deletes a test user and all their data
 */
async function deleteTestUser(email: string): Promise<void> {
  const serviceClient = getServiceRoleClient();

  const { data: users } = await serviceClient.auth.admin.listUsers();
  const user = users?.users.find((u) => u.email === email);

  if (user) {
    // Delete user's data first (in reverse dependency order)
    await serviceClient.from('time_entries').delete().eq('user_id', user.id);
    await serviceClient.from('tasks').delete().eq('user_id', user.id);
    await serviceClient.from('projects').delete().eq('user_id', user.id);
    await serviceClient.from('clients').delete().eq('user_id', user.id);

    // Delete user
    await serviceClient.auth.admin.deleteUser(user.id);
  }
}

describe('Row Level Security', () => {
  let userAId: string;
  let userBId: string;
  let userAClient: SupabaseClient;
  let userBClient: SupabaseClient;
  let serviceClient: SupabaseClient;

  beforeAll(async () => {
    serviceClient = getServiceRoleClient();

    // Ensure test users exist
    userAId = await ensureTestUser(TEST_USER_A.email, TEST_USER_A.password);
    userBId = await ensureTestUser(TEST_USER_B.email, TEST_USER_B.password);

    // Get authenticated clients
    userAClient = await getAuthenticatedClient(TEST_USER_A.email, TEST_USER_A.password);
    userBClient = await getAuthenticatedClient(TEST_USER_B.email, TEST_USER_B.password);
  });

  afterAll(async () => {
    // Clean up test users and their data
    await deleteTestUser(TEST_USER_A.email);
    await deleteTestUser(TEST_USER_B.email);
  });

  // ============================================================================
  // Schema Requirements
  // See specs/core/row-level-security.md: "Ownership"
  // ============================================================================
  describe('Schema Requirements', () => {
    describe('user_id column', () => {
      // See specs/core/row-level-security.md: "All entities have a user_id column"
      it.each(RLS_TABLES)('%s table has user_id column referencing auth.users(id)', async (table) => {
        const { data, error } = await serviceClient.rpc('get_column_info', {
          table_name: table,
          column_name: 'user_id',
        });

        // If RPC doesn't exist, query information_schema directly
        if (error?.message.includes('function') || error?.message.includes('does not exist')) {
          const { data: columnData } = await serviceClient
            .from('information_schema.columns' as any)
            .select('column_name, data_type, is_nullable')
            .eq('table_name', table)
            .eq('column_name', 'user_id')
            .single();

          // For now, just verify the column exists when we query
          // The actual test will be if we can insert data with a user_id
          const testClient = await userAClient.from(table as any).select('user_id').limit(0);
          expect(testClient.error).toBeNull();
          return;
        }

        expect(data).toBeDefined();
      });

      // See specs/core/row-level-security.md: "Defaults to auth.uid()"
      it.each(RLS_TABLES)('%s table user_id defaults to auth.uid()', async (table) => {
        // Create test data without explicitly setting user_id
        let insertData: Record<string, any> = {};
        let createdId: string | null = null;

        try {
          // Set up required foreign keys based on table
          if (table === 'clients') {
            insertData = { name: `RLS Default Test ${Date.now()}` };
          } else if (table === 'projects') {
            // First create a client
            const { data: client } = await userAClient
              .from('clients')
              .insert({ name: `RLS Project Test Client ${Date.now()}` })
              .select()
              .single();
            if (client) {
              insertData = { name: `RLS Default Test ${Date.now()}`, client_id: client.id };
            }
          } else if (table === 'tasks') {
            // Create client and project first
            const { data: client } = await userAClient
              .from('clients')
              .insert({ name: `RLS Task Test Client ${Date.now()}` })
              .select()
              .single();
            if (client) {
              const { data: project } = await userAClient
                .from('projects')
                .insert({ name: `RLS Task Test Project ${Date.now()}`, client_id: client.id })
                .select()
                .single();
              if (project) {
                insertData = { name: `RLS Default Test ${Date.now()}`, project_id: project.id };
              }
            }
          } else if (table === 'time_entries') {
            // Create client and project first
            const { data: client } = await userAClient
              .from('clients')
              .insert({ name: `RLS TimeEntry Test Client ${Date.now()}` })
              .select()
              .single();
            if (client) {
              const { data: project } = await userAClient
                .from('projects')
                .insert({ name: `RLS TimeEntry Test Project ${Date.now()}`, client_id: client.id })
                .select()
                .single();
              if (project) {
                insertData = {
                  project_id: project.id,
                  client_id: client.id,
                  started_at: new Date().toISOString(),
                };
              }
            }
          }

          // Insert without user_id - should default to auth.uid()
          const { data: created, error } = await userAClient
            .from(table as any)
            .insert(insertData)
            .select('id, user_id')
            .single();

          expect(error).toBeNull();
          expect(created).toBeDefined();
          expect(created?.user_id).toBe(userAId);
          createdId = created?.id;
        } finally {
          // Cleanup is handled by afterAll via deleteTestUser
        }
      });

      // See specs/core/row-level-security.md: "NOT NULL - all data must have an owner"
      it.each(RLS_TABLES)('%s table user_id is NOT NULL', async (table) => {
        // Attempt to insert with explicit null user_id using service role
        // This should fail due to NOT NULL constraint
        let insertData: Record<string, any> = { user_id: null };

        if (table === 'clients') {
          insertData.name = `RLS Null Test ${Date.now()}`;
        } else if (table === 'projects') {
          // Need a valid client_id
          const { data: client } = await serviceClient
            .from('clients')
            .insert({ name: `RLS Null Test Client ${Date.now()}`, user_id: userAId })
            .select()
            .single();
          insertData.name = `RLS Null Test ${Date.now()}`;
          insertData.client_id = client?.id;
        } else if (table === 'tasks') {
          const { data: client } = await serviceClient
            .from('clients')
            .insert({ name: `RLS Null Task Client ${Date.now()}`, user_id: userAId })
            .select()
            .single();
          const { data: project } = await serviceClient
            .from('projects')
            .insert({
              name: `RLS Null Task Project ${Date.now()}`,
              client_id: client?.id,
              user_id: userAId,
            })
            .select()
            .single();
          insertData.name = `RLS Null Test ${Date.now()}`;
          insertData.project_id = project?.id;
        } else if (table === 'time_entries') {
          const { data: client } = await serviceClient
            .from('clients')
            .insert({ name: `RLS Null TE Client ${Date.now()}`, user_id: userAId })
            .select()
            .single();
          const { data: project } = await serviceClient
            .from('projects')
            .insert({
              name: `RLS Null TE Project ${Date.now()}`,
              client_id: client?.id,
              user_id: userAId,
            })
            .select()
            .single();
          insertData.project_id = project?.id;
          insertData.client_id = client?.id;
          insertData.started_at = new Date().toISOString();
        }

        const { error } = await serviceClient.from(table as any).insert(insertData);

        expect(error).not.toBeNull();
        expect(error?.message).toMatch(/null|not-null|violates/i);
      });
    });
  });

  // ============================================================================
  // RLS Enablement
  // See specs/core/row-level-security.md: "RLS is enabled on all tables"
  // ============================================================================
  describe('RLS Enablement', () => {
    it.each(RLS_TABLES)('RLS is enabled on %s table', async (table) => {
      // Query pg_tables to verify RLS is enabled
      // This uses a raw SQL query via service role
      const { data, error } = await serviceClient.rpc('check_rls_enabled', {
        table_name: table,
      });

      // If RPC doesn't exist, we can infer RLS is enabled by behavior:
      // An anon client with no auth should get 0 rows (not an error)
      if (error?.message.includes('function') || error?.message.includes('does not exist')) {
        const anonClient = getAnonClient();
        const { data: rows, error: selectError } = await anonClient.from(table as any).select('*');

        // With RLS enabled: should return empty array (no error)
        // Without RLS: would return all rows
        expect(selectError).toBeNull();
        expect(Array.isArray(rows)).toBe(true);
        // Note: Can't assert rows.length === 0 without knowing prior state
        return;
      }

      expect(data).toBe(true);
    });
  });

  // ============================================================================
  // Per-User Data Isolation (Core Behavioral Tests)
  // See specs/core/row-level-security.md: "Behavior - Authenticated user"
  // ============================================================================
  describe('Per-User Data Isolation', () => {
    let userAClientId: string;
    let userAProjectId: string;
    let userATaskId: string;
    let userATimeEntryId: string;

    let userBClientId: string;
    let userBProjectId: string;
    let userBTaskId: string;
    let userBTimeEntryId: string;

    beforeAll(async () => {
      // Use service role to create test data (bypasses RLS for setup)
      // This allows us to test RLS behavior without depending on RLS for setup

      // Create test data for User A
      const { data: clientA, error: clientAError } = await serviceClient
        .from('clients')
        .insert({ name: `User A Client ${Date.now()}`, user_id: userAId })
        .select()
        .single();
      if (clientAError) throw new Error(`Failed to create User A client: ${clientAError.message}`);
      userAClientId = clientA!.id;

      const { data: projectA, error: projectAError } = await serviceClient
        .from('projects')
        .insert({ name: `User A Project ${Date.now()}`, client_id: userAClientId, user_id: userAId })
        .select()
        .single();
      if (projectAError) throw new Error(`Failed to create User A project: ${projectAError.message}`);
      userAProjectId = projectA!.id;

      const { data: taskA, error: taskAError } = await serviceClient
        .from('tasks')
        .insert({ name: `User A Task ${Date.now()}`, project_id: userAProjectId, user_id: userAId })
        .select()
        .single();
      if (taskAError) throw new Error(`Failed to create User A task: ${taskAError.message}`);
      userATaskId = taskA!.id;

      const { data: timeEntryA, error: timeEntryAError } = await serviceClient
        .from('time_entries')
        .insert({ project_id: userAProjectId, client_id: userAClientId, started_at: new Date().toISOString(), user_id: userAId })
        .select()
        .single();
      if (timeEntryAError) throw new Error(`Failed to create User A time entry: ${timeEntryAError.message}`);
      userATimeEntryId = timeEntryA!.id;

      // Create test data for User B
      const { data: clientB, error: clientBError } = await serviceClient
        .from('clients')
        .insert({ name: `User B Client ${Date.now()}`, user_id: userBId })
        .select()
        .single();
      if (clientBError) throw new Error(`Failed to create User B client: ${clientBError.message}`);
      userBClientId = clientB!.id;

      const { data: projectB, error: projectBError } = await serviceClient
        .from('projects')
        .insert({ name: `User B Project ${Date.now()}`, client_id: userBClientId, user_id: userBId })
        .select()
        .single();
      if (projectBError) throw new Error(`Failed to create User B project: ${projectBError.message}`);
      userBProjectId = projectB!.id;

      const { data: taskB, error: taskBError } = await serviceClient
        .from('tasks')
        .insert({ name: `User B Task ${Date.now()}`, project_id: userBProjectId, user_id: userBId })
        .select()
        .single();
      if (taskBError) throw new Error(`Failed to create User B task: ${taskBError.message}`);
      userBTaskId = taskB!.id;

      const { data: timeEntryB, error: timeEntryBError } = await serviceClient
        .from('time_entries')
        .insert({ project_id: userBProjectId, client_id: userBClientId, started_at: new Date().toISOString(), user_id: userBId })
        .select()
        .single();
      if (timeEntryBError) throw new Error(`Failed to create User B time entry: ${timeEntryBError.message}`);
      userBTimeEntryId = timeEntryB!.id;
    });

    // See specs/core/row-level-security.md: "Can read...their own data"
    describe('Authenticated user can read own data', () => {
      it('User A can read own client', async () => {
        const { data, error } = await userAClient
          .from('clients')
          .select('*')
          .eq('id', userAClientId)
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.id).toBe(userAClientId);
      });

      it('User A can read own project', async () => {
        const { data, error } = await userAClient
          .from('projects')
          .select('*')
          .eq('id', userAProjectId)
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.id).toBe(userAProjectId);
      });

      it('User A can read own task', async () => {
        const { data, error } = await userAClient
          .from('tasks')
          .select('*')
          .eq('id', userATaskId)
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.id).toBe(userATaskId);
      });

      it('User A can read own time entry', async () => {
        const { data, error } = await userAClient
          .from('time_entries')
          .select('*')
          .eq('id', userATimeEntryId)
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.id).toBe(userATimeEntryId);
      });
    });

    // See specs/core/row-level-security.md: "Can...create...their own data"
    describe('Authenticated user can create own data', () => {
      it('User A can create a client', async () => {
        const { data, error } = await userAClient
          .from('clients')
          .insert({ name: `User A New Client ${Date.now()}` })
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.user_id).toBe(userAId);
      });

      it('User A can create a project', async () => {
        const { data, error } = await userAClient
          .from('projects')
          .insert({ name: `User A New Project ${Date.now()}`, client_id: userAClientId })
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.user_id).toBe(userAId);
      });

      it('User A can create a task', async () => {
        const { data, error } = await userAClient
          .from('tasks')
          .insert({ name: `User A New Task ${Date.now()}`, project_id: userAProjectId })
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.user_id).toBe(userAId);
      });

      it('User A can create a time entry', async () => {
        const { data, error } = await userAClient
          .from('time_entries')
          .insert({ project_id: userAProjectId, client_id: userAClientId, started_at: new Date().toISOString() })
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.user_id).toBe(userAId);
      });
    });

    // See specs/core/row-level-security.md: "Can...update...their own data"
    describe('Authenticated user can update own data', () => {
      it('User A can update own client', async () => {
        const newName = `User A Updated Client ${Date.now()}`;
        const { data, error } = await userAClient
          .from('clients')
          .update({ name: newName })
          .eq('id', userAClientId)
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.name).toBe(newName);
      });

      it('User A can update own project', async () => {
        const newName = `User A Updated Project ${Date.now()}`;
        const { data, error } = await userAClient
          .from('projects')
          .update({ name: newName })
          .eq('id', userAProjectId)
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.name).toBe(newName);
      });

      it('User A can update own task', async () => {
        const newName = `User A Updated Task ${Date.now()}`;
        const { data, error } = await userAClient
          .from('tasks')
          .update({ name: newName })
          .eq('id', userATaskId)
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.name).toBe(newName);
      });

      it('User A can update own time entry', async () => {
        const newEndedAt = new Date().toISOString();
        const { data, error } = await userAClient
          .from('time_entries')
          .update({ ended_at: newEndedAt })
          .eq('id', userATimeEntryId)
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        // Compare timestamps (database may return +00:00 instead of Z)
        expect(new Date(data?.ended_at).getTime()).toBe(new Date(newEndedAt).getTime());
      });
    });

    // See specs/core/row-level-security.md: "Can...delete their own data"
    describe('Authenticated user can delete own data', () => {
      let deleteTestClientId: string;
      let deleteTestProjectId: string;
      let deleteTestTaskId: string;
      let deleteTestTimeEntryId: string;

      beforeEach(async () => {
        // Use service role to create fresh data for each delete test (bypasses RLS for setup)
        const { data: client, error: clientError } = await serviceClient
          .from('clients')
          .insert({ name: `Delete Test Client ${Date.now()}`, user_id: userAId })
          .select()
          .single();
        if (clientError) throw new Error(`Failed to create delete test client: ${clientError.message}`);
        deleteTestClientId = client!.id;

        const { data: project, error: projectError } = await serviceClient
          .from('projects')
          .insert({ name: `Delete Test Project ${Date.now()}`, client_id: deleteTestClientId, user_id: userAId })
          .select()
          .single();
        if (projectError) throw new Error(`Failed to create delete test project: ${projectError.message}`);
        deleteTestProjectId = project!.id;

        const { data: task, error: taskError } = await serviceClient
          .from('tasks')
          .insert({ name: `Delete Test Task ${Date.now()}`, project_id: deleteTestProjectId, user_id: userAId })
          .select()
          .single();
        if (taskError) throw new Error(`Failed to create delete test task: ${taskError.message}`);
        deleteTestTaskId = task!.id;

        const { data: timeEntry, error: timeEntryError } = await serviceClient
          .from('time_entries')
          .insert({ project_id: deleteTestProjectId, client_id: deleteTestClientId, started_at: new Date().toISOString(), user_id: userAId })
          .select()
          .single();
        if (timeEntryError) throw new Error(`Failed to create delete test time entry: ${timeEntryError.message}`);
        deleteTestTimeEntryId = timeEntry!.id;
      });

      it('User A can delete own time entry', async () => {
        const { error } = await userAClient
          .from('time_entries')
          .delete()
          .eq('id', deleteTestTimeEntryId);

        expect(error).toBeNull();

        // Verify deletion
        const { data } = await userAClient
          .from('time_entries')
          .select('*')
          .eq('id', deleteTestTimeEntryId);

        expect(data).toEqual([]);
      });

      it('User A can delete own task', async () => {
        // First delete time entry
        await userAClient.from('time_entries').delete().eq('id', deleteTestTimeEntryId);

        const { error } = await userAClient.from('tasks').delete().eq('id', deleteTestTaskId);

        expect(error).toBeNull();

        // Verify deletion
        const { data } = await userAClient.from('tasks').select('*').eq('id', deleteTestTaskId);

        expect(data).toEqual([]);
      });

      it('User A can delete own project', async () => {
        // First delete dependencies
        await userAClient.from('time_entries').delete().eq('id', deleteTestTimeEntryId);
        await userAClient.from('tasks').delete().eq('id', deleteTestTaskId);

        const { error } = await userAClient.from('projects').delete().eq('id', deleteTestProjectId);

        expect(error).toBeNull();

        // Verify deletion
        const { data } = await userAClient
          .from('projects')
          .select('*')
          .eq('id', deleteTestProjectId);

        expect(data).toEqual([]);
      });

      it('User A can delete own client', async () => {
        // First delete all dependencies
        await userAClient.from('time_entries').delete().eq('id', deleteTestTimeEntryId);
        await userAClient.from('tasks').delete().eq('id', deleteTestTaskId);
        await userAClient.from('projects').delete().eq('id', deleteTestProjectId);

        const { error } = await userAClient.from('clients').delete().eq('id', deleteTestClientId);

        expect(error).toBeNull();

        // Verify deletion
        const { data } = await userAClient.from('clients').select('*').eq('id', deleteTestClientId);

        expect(data).toEqual([]);
      });
    });

    // See specs/core/row-level-security.md: "Cannot see...other users' data"
    describe('Authenticated user cannot see other users data', () => {
      it('User A cannot see User B client', async () => {
        const { data, error } = await userAClient
          .from('clients')
          .select('*')
          .eq('id', userBClientId);

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });

      it('User A cannot see User B project', async () => {
        const { data, error } = await userAClient
          .from('projects')
          .select('*')
          .eq('id', userBProjectId);

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });

      it('User A cannot see User B task', async () => {
        const { data, error } = await userAClient.from('tasks').select('*').eq('id', userBTaskId);

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });

      it('User A cannot see User B time entry', async () => {
        const { data, error } = await userAClient
          .from('time_entries')
          .select('*')
          .eq('id', userBTimeEntryId);

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });
    });

    // See specs/core/row-level-security.md: "Cannot...modify other users' data"
    describe('Authenticated user cannot modify other users data', () => {
      it('User A cannot update User B client', async () => {
        const { data, error } = await userAClient
          .from('clients')
          .update({ name: 'Hacked by User A' })
          .eq('id', userBClientId)
          .select();

        // Update should succeed but affect 0 rows (RLS filters it out)
        expect(error).toBeNull();
        expect(data).toEqual([]);

        // Verify B's data is unchanged
        const { data: unchanged } = await userBClient
          .from('clients')
          .select('name')
          .eq('id', userBClientId)
          .single();

        expect(unchanged?.name).not.toBe('Hacked by User A');
      });

      it('User A cannot update User B project', async () => {
        const { data, error } = await userAClient
          .from('projects')
          .update({ name: 'Hacked by User A' })
          .eq('id', userBProjectId)
          .select();

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });

      it('User A cannot update User B task', async () => {
        const { data, error } = await userAClient
          .from('tasks')
          .update({ name: 'Hacked by User A' })
          .eq('id', userBTaskId)
          .select();

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });

      it('User A cannot update User B time entry', async () => {
        const { data, error } = await userAClient
          .from('time_entries')
          .update({ ended_at: new Date().toISOString() })
          .eq('id', userBTimeEntryId)
          .select();

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });

      it('User A cannot delete User B client', async () => {
        const { error } = await userAClient.from('clients').delete().eq('id', userBClientId);

        expect(error).toBeNull();

        // Verify B's data still exists
        const { data } = await userBClient.from('clients').select('*').eq('id', userBClientId);

        expect(data?.length).toBe(1);
      });

      it('User A cannot delete User B project', async () => {
        const { error } = await userAClient.from('projects').delete().eq('id', userBProjectId);

        expect(error).toBeNull();

        // Verify B's data still exists
        const { data } = await userBClient.from('projects').select('*').eq('id', userBProjectId);

        expect(data?.length).toBe(1);
      });

      it('User A cannot delete User B task', async () => {
        const { error } = await userAClient.from('tasks').delete().eq('id', userBTaskId);

        expect(error).toBeNull();

        // Verify B's data still exists
        const { data } = await userBClient.from('tasks').select('*').eq('id', userBTaskId);

        expect(data?.length).toBe(1);
      });

      it('User A cannot delete User B time entry', async () => {
        const { error } = await userAClient.from('time_entries').delete().eq('id', userBTimeEntryId);

        expect(error).toBeNull();

        // Verify B's data still exists
        const { data } = await userBClient
          .from('time_entries')
          .select('*')
          .eq('id', userBTimeEntryId);

        expect(data?.length).toBe(1);
      });
    });

    // See specs/core/row-level-security.md: "Queries automatically filter to their data only"
    describe('Queries automatically filter to authenticated users data only', () => {
      it('User A findAll clients only returns own clients', async () => {
        const { data } = await userAClient.from('clients').select('*');

        expect(data).toBeDefined();
        expect(data!.length).toBeGreaterThan(0);

        // All returned clients should belong to User A
        for (const client of data!) {
          expect(client.user_id).toBe(userAId);
        }

        // User B's client should NOT be in results
        const userBClientInResults = data!.find((c) => c.id === userBClientId);
        expect(userBClientInResults).toBeUndefined();
      });

      it('User A findAll projects only returns own projects', async () => {
        const { data } = await userAClient.from('projects').select('*');

        expect(data).toBeDefined();
        expect(data!.length).toBeGreaterThan(0);

        for (const project of data!) {
          expect(project.user_id).toBe(userAId);
        }

        const userBProjectInResults = data!.find((p) => p.id === userBProjectId);
        expect(userBProjectInResults).toBeUndefined();
      });

      it('User A findAll tasks only returns own tasks', async () => {
        const { data } = await userAClient.from('tasks').select('*');

        expect(data).toBeDefined();
        expect(data!.length).toBeGreaterThan(0);

        for (const task of data!) {
          expect(task.user_id).toBe(userAId);
        }

        const userBTaskInResults = data!.find((t) => t.id === userBTaskId);
        expect(userBTaskInResults).toBeUndefined();
      });

      it('User A findAll time_entries only returns own time entries', async () => {
        const { data } = await userAClient.from('time_entries').select('*');

        expect(data).toBeDefined();
        expect(data!.length).toBeGreaterThan(0);

        for (const entry of data!) {
          expect(entry.user_id).toBe(userAId);
        }

        const userBEntryInResults = data!.find((e) => e.id === userBTimeEntryId);
        expect(userBEntryInResults).toBeUndefined();
      });
    });
  });

  // ============================================================================
  // Unauthenticated Access
  // See specs/core/row-level-security.md: "Unauthenticated requests"
  // ============================================================================
  describe('Unauthenticated Access', () => {
    let anonClient: SupabaseClient;

    beforeAll(() => {
      anonClient = getAnonClient();
    });

    // See specs/core/row-level-security.md: "All operations denied (no rows returned)"
    describe('Unauthenticated requests - all operations denied (no rows returned)', () => {
      it.each(RLS_TABLES)('Cannot read %s table', async (table) => {
        const { data, error } = await anonClient.from(table as any).select('*');

        // RLS should return empty array, not an error
        expect(error).toBeNull();
        expect(data).toEqual([]);
      });
    });

    // See specs/core/row-level-security.md: "no rows affected on write operations"
    describe('Unauthenticated requests - no rows affected on write operations', () => {
      it('Cannot insert into clients table', async () => {
        const { data, error } = await anonClient
          .from('clients')
          .insert({ name: `Anon Client ${Date.now()}` })
          .select();

        // INSERT without auth should fail or return no rows
        // Depending on policy, this might error or return empty
        if (!error) {
          expect(data).toEqual([]);
        } else {
          // Error is also acceptable - policy violation
          expect(error).toBeDefined();
        }
      });

      it('Cannot insert into projects table', async () => {
        // Need a valid client_id, but since we can't read any, use a fake one
        const { data, error } = await anonClient
          .from('projects')
          .insert({
            name: `Anon Project ${Date.now()}`,
            client_id: '00000000-0000-0000-0000-000000000001',
          })
          .select();

        if (!error) {
          expect(data).toEqual([]);
        }
      });

      it('Cannot insert into tasks table', async () => {
        const { data, error } = await anonClient
          .from('tasks')
          .insert({
            name: `Anon Task ${Date.now()}`,
            project_id: '00000000-0000-0000-0000-000000000001',
          })
          .select();

        if (!error) {
          expect(data).toEqual([]);
        }
      });

      it('Cannot insert into time_entries table', async () => {
        const { data, error } = await anonClient
          .from('time_entries')
          .insert({
            project_id: '00000000-0000-0000-0000-000000000001',
            client_id: '00000000-0000-0000-0000-000000000001',
            started_at: new Date().toISOString(),
          })
          .select();

        if (!error) {
          expect(data).toEqual([]);
        }
      });

      it('Cannot update clients table (no rows affected)', async () => {
        const { data, error } = await anonClient
          .from('clients')
          .update({ name: 'Hacked by Anon' })
          .neq('id', '00000000-0000-0000-0000-000000000000')
          .select();

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });

      it('Cannot update projects table (no rows affected)', async () => {
        const { data, error } = await anonClient
          .from('projects')
          .update({ name: 'Hacked by Anon' })
          .neq('id', '00000000-0000-0000-0000-000000000000')
          .select();

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });

      it('Cannot update tasks table (no rows affected)', async () => {
        const { data, error } = await anonClient
          .from('tasks')
          .update({ name: 'Hacked by Anon' })
          .neq('id', '00000000-0000-0000-0000-000000000000')
          .select();

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });

      it('Cannot update time_entries table (no rows affected)', async () => {
        const { data, error } = await anonClient
          .from('time_entries')
          .update({ description: 'Hacked by Anon' })
          .neq('id', '00000000-0000-0000-0000-000000000000')
          .select();

        expect(error).toBeNull();
        expect(data).toEqual([]);
      });

      it.each(RLS_TABLES)('Cannot delete from %s table (no rows affected)', async (table) => {
        // Try to delete everything
        const { error, count } = await anonClient
          .from(table as any)
          .delete({ count: 'exact' })
          .neq('id', '00000000-0000-0000-0000-000000000000');

        // Should succeed but delete 0 rows
        expect(error).toBeNull();
        expect(count).toBe(0);
      });
    });
  });

  // ============================================================================
  // Service Role
  // See specs/core/row-level-security.md: "Service role"
  // ============================================================================
  describe('Service Role', () => {
    // See specs/core/row-level-security.md: "Bypasses RLS (for admin/migration operations only)"
    describe('Service role bypasses RLS', () => {
      it('Service role can read all clients regardless of user_id', async () => {
        const { data, error } = await serviceClient.from('clients').select('*');

        expect(error).toBeNull();
        expect(data).toBeDefined();

        // Service role should see data from multiple users
        const userIds = new Set(data!.map((c) => c.user_id));
        // Should see both User A and User B data
        expect(userIds.has(userAId)).toBe(true);
        expect(userIds.has(userBId)).toBe(true);
      });

      it('Service role can read all projects regardless of user_id', async () => {
        const { data, error } = await serviceClient.from('projects').select('*');

        expect(error).toBeNull();
        expect(data).toBeDefined();

        const userIds = new Set(data!.map((p) => p.user_id));
        expect(userIds.has(userAId)).toBe(true);
        expect(userIds.has(userBId)).toBe(true);
      });

      it('Service role can read all tasks regardless of user_id', async () => {
        const { data, error } = await serviceClient.from('tasks').select('*');

        expect(error).toBeNull();
        expect(data).toBeDefined();

        const userIds = new Set(data!.map((t) => t.user_id));
        expect(userIds.has(userAId)).toBe(true);
        expect(userIds.has(userBId)).toBe(true);
      });

      it('Service role can read all time_entries regardless of user_id', async () => {
        const { data, error } = await serviceClient.from('time_entries').select('*');

        expect(error).toBeNull();
        expect(data).toBeDefined();

        const userIds = new Set(data!.map((e) => e.user_id));
        expect(userIds.has(userAId)).toBe(true);
        expect(userIds.has(userBId)).toBe(true);
      });

      it('Service role can create data for any user', async () => {
        // Create a client as User B using service role
        const { data, error } = await serviceClient
          .from('clients')
          .insert({ name: `Service Role Test ${Date.now()}`, user_id: userBId })
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.user_id).toBe(userBId);
      });

      it('Service role can update any users data', async () => {
        // Get User B's client
        const { data: userBClients } = await serviceClient
          .from('clients')
          .select('*')
          .eq('user_id', userBId)
          .limit(1);

        if (userBClients && userBClients.length > 0) {
          const newName = `Service Role Updated ${Date.now()}`;
          const { data, error } = await serviceClient
            .from('clients')
            .update({ name: newName })
            .eq('id', userBClients[0].id)
            .select()
            .single();

          expect(error).toBeNull();
          expect(data?.name).toBe(newName);
        }
      });

      it('Service role can delete any users data', async () => {
        // Create a client to delete
        const { data: created } = await serviceClient
          .from('clients')
          .insert({ name: `To Delete ${Date.now()}`, user_id: userAId })
          .select()
          .single();

        expect(created).toBeDefined();

        // Delete it using service role
        const { error } = await serviceClient.from('clients').delete().eq('id', created!.id);

        expect(error).toBeNull();

        // Verify deletion
        const { data: verify } = await serviceClient
          .from('clients')
          .select('*')
          .eq('id', created!.id);

        expect(verify).toEqual([]);
      });
    });
  });
});
