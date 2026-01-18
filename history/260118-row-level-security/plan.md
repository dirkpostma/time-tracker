# Feature: Row Level Security (RLS)

## Goal

Enable per-user data isolation so each authenticated user can only access their own time tracking data.

## Requirements

- Add `user_id` column to all tables (clients, projects, tasks, time_entries)
- Enable RLS on all tables
- Create policies for full CRUD (SELECT, INSERT, UPDATE, DELETE) on own data
- Use Supabase Auth `auth.uid()` for user identification
- Tests must authenticate as real users (no service role bypass)

## Design Decisions

- **user_id on all tables**: While clients is the root entity, adding user_id to all tables provides explicit ownership, simpler RLS policies, and supports future scenarios (e.g., shared projects)
- **DEFAULT auth.uid()**: Database automatically sets user_id from authenticated session - no application code changes needed
- **No soft deletes**: Keep current hard delete behavior; RLS handles access control
- **Tests use real auth**: Tests authenticate as the test user to verify RLS works correctly in realistic conditions

## Implementation Steps

1. [ ] Create migration to add `user_id` column to all tables
   - Add `user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL`
   - Add index on user_id for each table

2. [ ] Create migration to enable RLS and add policies
   - Enable RLS on clients, projects, tasks, time_entries
   - Create SELECT policy: `user_id = auth.uid()`
   - Create INSERT policy: `user_id = auth.uid()`
   - Create UPDATE policy: `user_id = auth.uid()`
   - Create DELETE policy: `user_id = auth.uid()`

3. [ ] Update tests to use authenticated client
   - Tests must sign in as test user before operations
   - Verify RLS policies work correctly
   - Add tests for access denial scenarios

4. [ ] Update data-model spec to include user_id

## Files to Create/Modify

- `supabase/migrations/XXXXXX_add_user_id.sql` - Add user_id columns
- `supabase/migrations/XXXXXX_enable_rls.sql` - RLS policies
- `specs/core/data-model.md` - Add user_id to spec
- `test/**/*.test.ts` - Update tests to authenticate as user

## Testing Strategy

- All tests authenticate as test user (not service role)
- Existing CRUD tests verify user can access their own data
- Add isolation tests:
  - Create data as User A
  - Attempt to read/modify as User B
  - Verify access denied

## Verification Checklist

- [ ] All existing tests pass (with authenticated user)
- [ ] New RLS isolation tests pass
- [ ] Manual verification in Supabase Studio
- [ ] Data model spec updated
