-- Add client_id to time_entries
ALTER TABLE time_entries ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Populate client_id from project for existing entries
UPDATE time_entries
SET client_id = projects.client_id
FROM projects
WHERE time_entries.project_id = projects.id;

-- Make client_id required
ALTER TABLE time_entries ALTER COLUMN client_id SET NOT NULL;

-- Make project_id optional
ALTER TABLE time_entries ALTER COLUMN project_id DROP NOT NULL;

-- Add index for client_id
CREATE INDEX idx_time_entries_client_id ON time_entries(client_id);
