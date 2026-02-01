-- Seed data for Time Tracker
-- Run with: supabase db reset (includes migrations + seed)
-- Or manually: psql -f seed.sql

-- Clear existing test data (optional - comment out in production)
-- DELETE FROM time_entries;
-- DELETE FROM tasks;
-- DELETE FROM projects;
-- DELETE FROM clients;

-- ============================================
-- Clients
-- ============================================
INSERT INTO clients (id, name) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Acme Corporation'),
  ('c1000000-0000-0000-0000-000000000002', 'TechStart Inc'),
  ('c1000000-0000-0000-0000-000000000003', 'Green Energy Solutions'),
  ('c1000000-0000-0000-0000-000000000004', 'Digital Marketing Pro')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================
-- Projects
-- ============================================
-- Acme Corporation projects
INSERT INTO projects (id, client_id, name) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Website Redesign'),
  ('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Mobile App Development'),
  ('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'API Integration')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- TechStart Inc projects
INSERT INTO projects (id, client_id, name) VALUES
  ('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'MVP Development'),
  ('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'User Research')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Green Energy Solutions projects
INSERT INTO projects (id, client_id, name) VALUES
  ('p1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 'Dashboard Development'),
  ('p1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000003', 'Data Analytics')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Digital Marketing Pro projects
INSERT INTO projects (id, client_id, name) VALUES
  ('p1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000004', 'Campaign Management'),
  ('p1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000004', 'Social Media Integration')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================
-- Tasks
-- ============================================
-- Website Redesign tasks
INSERT INTO tasks (id, project_id, name) VALUES
  ('t1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'Design mockups'),
  ('t1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 'Frontend development'),
  ('t1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000001', 'Testing & QA')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Mobile App Development tasks
INSERT INTO tasks (id, project_id, name) VALUES
  ('t1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000002', 'iOS development'),
  ('t1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000002', 'Android development'),
  ('t1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000002', 'Code review')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- MVP Development tasks
INSERT INTO tasks (id, project_id, name) VALUES
  ('t1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000004', 'Architecture planning'),
  ('t1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000004', 'Core features'),
  ('t1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000004', 'Bug fixes')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Dashboard Development tasks
INSERT INTO tasks (id, project_id, name) VALUES
  ('t1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000006', 'UI components'),
  ('t1000000-0000-0000-0000-000000000011', 'p1000000-0000-0000-0000-000000000006', 'Data visualization'),
  ('t1000000-0000-0000-0000-000000000012', 'p1000000-0000-0000-0000-000000000006', 'Performance optimization')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
