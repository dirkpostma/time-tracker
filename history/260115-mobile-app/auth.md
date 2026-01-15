# Phase 2: Database & Auth

## Database Migration

Add `user_id` and Row Level Security:

```sql
-- Add user_id to all tables
ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE projects ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE time_entries ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users manage own clients" ON clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own time_entries" ON time_entries FOR ALL USING (auth.uid() = user_id);
```

## CLI Authentication

New commands:
- `tt login` - Email/password prompt
- `tt logout` - Clear tokens
- `tt whoami` - Show current user

Token storage in `~/.tt/config.json`:
```json
{
  "supabaseUrl": "https://...",
  "supabaseKey": "...",
  "auth": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAt": 1234567890
  }
}
```

> **Security note:** File storage with 0600 permissions is intentional for simplicity. Future enhancement: system keychain.

## Repository Updates

- Get current user from Supabase session
- Include `user_id` in all `create()` calls
