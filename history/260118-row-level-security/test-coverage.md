# Test Coverage Report - 2026-01-18

## Summary
- Specs analyzed: 1
- Total scenarios: 35
- Covered: 0 (0%)
- Gaps: 35

## By Spec

### specs/core/row-level-security.md

**Test files discovered:**
- `packages/repositories/src/supabase/client.test.ts`
- `packages/repositories/src/supabase/project.test.ts`
- `packages/repositories/src/supabase/task.test.ts`
- `packages/repositories/src/supabase/timeEntry.test.ts`
- `packages/repositories/src/supabase/auth.test.ts`
- `packages/cli/src/auth.integration.test.ts`

**Note:** No dedicated RLS test file exists yet.

| Scenario | Status | Test Location |
|----------|--------|---------------|
| All entities have user_id column referencing auth.users(id) | Gap | - |
| user_id defaults to auth.uid() | Gap | - |
| user_id is NOT NULL | Gap | - |
| RLS enabled on clients table | Gap | - |
| RLS enabled on projects table | Gap | - |
| RLS enabled on tasks table | Gap | - |
| RLS enabled on time_entries table | Gap | - |
| SELECT policy: clients_select_own (user_id = auth.uid()) | Gap | - |
| INSERT policy: clients_insert_own (user_id = auth.uid()) | Gap | - |
| UPDATE policy: clients_update_own (user_id = auth.uid()) | Gap | - |
| DELETE policy: clients_delete_own (user_id = auth.uid()) | Gap | - |
| SELECT policy: projects_select_own (user_id = auth.uid()) | Gap | - |
| INSERT policy: projects_insert_own (user_id = auth.uid()) | Gap | - |
| UPDATE policy: projects_update_own (user_id = auth.uid()) | Gap | - |
| DELETE policy: projects_delete_own (user_id = auth.uid()) | Gap | - |
| SELECT policy: tasks_select_own (user_id = auth.uid()) | Gap | - |
| INSERT policy: tasks_insert_own (user_id = auth.uid()) | Gap | - |
| UPDATE policy: tasks_update_own (user_id = auth.uid()) | Gap | - |
| DELETE policy: tasks_delete_own (user_id = auth.uid()) | Gap | - |
| SELECT policy: time_entries_select_own (user_id = auth.uid()) | Gap | - |
| INSERT policy: time_entries_insert_own (user_id = auth.uid()) | Gap | - |
| UPDATE policy: time_entries_update_own (user_id = auth.uid()) | Gap | - |
| DELETE policy: time_entries_delete_own (user_id = auth.uid()) | Gap | - |
| Authenticated user can read own data | Gap | - |
| Authenticated user can create own data | Gap | - |
| Authenticated user can update own data | Gap | - |
| Authenticated user can delete own data | Gap | - |
| Authenticated user cannot see other users' data | Gap | - |
| Authenticated user cannot modify other users' data | Gap | - |
| Queries automatically filter to authenticated user's data only | Gap | - |
| Unauthenticated requests: all operations denied | Gap | - |
| Unauthenticated requests: no rows affected on write operations | Gap | - |
| Service role bypasses RLS (admin/migration operations only) | Gap | - |
| Tests authenticate as real users to verify RLS behavior | Gap | - |
| Standard CRUD tests run as authenticated user | Gap | - |
| Isolation tests verify cross-user access is denied | Gap | - |

## Notes

- **RLS not yet implemented**: The spec defines requirements but no migrations exist with `user_id` columns or RLS policies
- **Existing tests don't verify RLS**: Repository tests run CRUD operations but don't authenticate as specific users or verify data isolation
- **Implementation pending**: The plan at `history/260118-row-level-security.md` shows all implementation steps are unchecked
