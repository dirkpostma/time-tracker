-- Add client_id to time_entries (SET NULL on client delete to prevent data loss)
ALTER TABLE time_entries ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Populate client_id from project for existing entries
UPDATE time_entries
SET client_id = projects.client_id
FROM projects
WHERE time_entries.project_id = projects.id;

-- Delete orphaned entries (entries with project_id that doesn't exist)
-- These would fail the NOT NULL constraint anyway
DELETE FROM time_entries WHERE client_id IS NULL;

-- Make client_id required
ALTER TABLE time_entries ALTER COLUMN client_id SET NOT NULL;

-- Now change to CASCADE (optional - or keep SET NULL for safety)
ALTER TABLE time_entries DROP CONSTRAINT time_entries_client_id_fkey;
ALTER TABLE time_entries ADD CONSTRAINT time_entries_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Make project_id optional
ALTER TABLE time_entries ALTER COLUMN project_id DROP NOT NULL;

-- Add index for client_id
CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON time_entries(client_id);
