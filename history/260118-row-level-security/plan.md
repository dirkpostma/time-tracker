# Feature: Row Level Security

## Goal

Implement per-user data isolation using Supabase RLS policies so each user can only access their own clients, projects, tasks, and time entries.

## Requirements

- Add `user_id` column to all tables (clients, projects, tasks, time_entries)
- User ID references `auth.users(id)` and defaults to `auth.uid()`
- Enable RLS on all tables
- Create CRUD policies for owner-only access
- Service role bypasses RLS for admin operations
- Unauthenticated requests get no data

## Design Decisions

- **Denormalized user_id**: Each table has its own `user_id` for simpler policies (no joins needed)
- **auth.uid()**: Use Supabase's built-in authenticated user ID
- **Default user_id**: Column defaults to `auth.uid()` so inserts don't need to specify it
- **Standard policies**: Simple owner-based access, no special edge cases

## Implementation Steps

1. [ ] Create migration to add user_id columns to all tables
2. [ ] Create migration to enable RLS and add policies
3. [ ] Write integration tests for RLS behavior
4. [ ] Update application code to handle authenticated sessions

## Files to Create/Modify

- `supabase/migrations/YYYYMMDDHHMMSS_add_user_id_columns.sql` - Add user_id to all tables
- `supabase/migrations/YYYYMMDDHHMMSS_enable_rls_policies.sql` - Enable RLS and create policies
- `tests/rls.test.ts` - Integration tests for RLS behavior

## Migration Details

### Add user_id columns

```sql
-- Add user_id to all tables
ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL;
ALTER TABLE projects ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL;
ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL;
ALTER TABLE time_entries ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL;

-- Add indexes for user_id queries
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
```

### Enable RLS and policies

```sql
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY clients_select_own ON clients FOR SELECT USING (user_id = auth.uid());
CREATE POLICY clients_insert_own ON clients FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY clients_update_own ON clients FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY clients_delete_own ON clients FOR DELETE USING (user_id = auth.uid());

-- Projects policies
CREATE POLICY projects_select_own ON projects FOR SELECT USING (user_id = auth.uid());
CREATE POLICY projects_insert_own ON projects FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY projects_update_own ON projects FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY projects_delete_own ON projects FOR DELETE USING (user_id = auth.uid());

-- Tasks policies
CREATE POLICY tasks_select_own ON tasks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY tasks_insert_own ON tasks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY tasks_update_own ON tasks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY tasks_delete_own ON tasks FOR DELETE USING (user_id = auth.uid());

-- Time entries policies
CREATE POLICY time_entries_select_own ON time_entries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY time_entries_insert_own ON time_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY time_entries_update_own ON time_entries FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY time_entries_delete_own ON time_entries FOR DELETE USING (user_id = auth.uid());
```

## Testing Strategy

- **Positive tests**: Authenticated user can CRUD their own data
- **Isolation tests**: User A cannot see/modify User B's data
- **Unauthenticated tests**: Anonymous requests get no data
- Run against local Docker Supabase with real auth

## Verification Checklist

- [ ] All tests pass
- [ ] RLS policies work as expected
- [ ] Existing tests still pass with authenticated sessions
- [ ] No regressions introduced
