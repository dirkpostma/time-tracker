-- Enable pgcrypto extension for password verification
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add user_id to clients table for multi-tenancy (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- For existing data, assign orphaned clients to test user
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@example.com' LIMIT 1;
  IF test_user_id IS NOT NULL THEN
    UPDATE clients SET user_id = test_user_id WHERE user_id IS NULL;
  END IF;
END $$;

-- Make user_id required (if not already)
DO $$
BEGIN
  ALTER TABLE clients ALTER COLUMN user_id SET NOT NULL;
EXCEPTION WHEN others THEN
  NULL; -- Column may already be NOT NULL
END $$;

-- Create index for user_id lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to make idempotent
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
DROP POLICY IF EXISTS "Users can view projects of their clients" ON projects;
DROP POLICY IF EXISTS "Users can insert projects for their clients" ON projects;
DROP POLICY IF EXISTS "Users can update projects of their clients" ON projects;
DROP POLICY IF EXISTS "Users can delete projects of their clients" ON projects;
DROP POLICY IF EXISTS "Users can view tasks of their projects" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks for their projects" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks of their projects" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks of their projects" ON tasks;
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can insert their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON time_entries;

-- RLS policies for clients (owned by user)
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for projects (owned via client)
CREATE POLICY "Users can view projects of their clients"
  ON projects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients WHERE clients.id = projects.client_id AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert projects for their clients"
  ON projects FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM clients WHERE clients.id = projects.client_id AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can update projects of their clients"
  ON projects FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM clients WHERE clients.id = projects.client_id AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete projects of their clients"
  ON projects FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM clients WHERE clients.id = projects.client_id AND clients.user_id = auth.uid()
  ));

-- RLS policies for tasks (owned via project -> client)
CREATE POLICY "Users can view tasks of their projects"
  ON tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    JOIN clients ON clients.id = projects.client_id
    WHERE projects.id = tasks.project_id AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert tasks for their projects"
  ON tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    JOIN clients ON clients.id = projects.client_id
    WHERE projects.id = tasks.project_id AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can update tasks of their projects"
  ON tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects
    JOIN clients ON clients.id = projects.client_id
    WHERE projects.id = tasks.project_id AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tasks of their projects"
  ON tasks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    JOIN clients ON clients.id = projects.client_id
    WHERE projects.id = tasks.project_id AND clients.user_id = auth.uid()
  ));

-- RLS policies for time_entries (owned via client)
CREATE POLICY "Users can view their own time entries"
  ON time_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients WHERE clients.id = time_entries.client_id AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own time entries"
  ON time_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM clients WHERE clients.id = time_entries.client_id AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own time entries"
  ON time_entries FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM clients WHERE clients.id = time_entries.client_id AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own time entries"
  ON time_entries FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM clients WHERE clients.id = time_entries.client_id AND clients.user_id = auth.uid()
  ));

-- Create the delete_user_account function that also verifies password
-- This runs with elevated privileges (SECURITY DEFINER) to access auth tables
CREATE OR REPLACE FUNCTION delete_user_account(password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  current_user_id uuid;
  stored_password text;
BEGIN
  -- Get the current user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify password using crypt function (pgcrypto)
  SELECT encrypted_password INTO stored_password
  FROM auth.users
  WHERE id = current_user_id;

  IF stored_password IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Use crypt to verify password
  IF NOT (stored_password = crypt(password, stored_password)) THEN
    RAISE EXCEPTION 'Incorrect password';
  END IF;

  -- Delete all user data (cascades to projects, tasks, time_entries)
  DELETE FROM clients WHERE clients.user_id = current_user_id;

  -- Delete the auth user
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(text) TO authenticated;
