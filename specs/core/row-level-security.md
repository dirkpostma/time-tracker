# Row Level Security Spec

Per-user data isolation using Supabase Row Level Security (RLS).

## Overview

Each user can only access their own data. RLS policies enforce this at the database level, ensuring data isolation regardless of application code.

## Ownership

All entities have a `user_id` column:
- References `auth.users(id)`
- Defaults to `auth.uid()` (current authenticated user)
- NOT NULL - all data must have an owner

See [Data Model](data-model.md) for entity definitions.

## Policies

RLS is enabled on all tables. Each table has four policies:

| Operation | Policy Name           | Condition              |
|-----------|-----------------------|------------------------|
| SELECT    | `{table}_select_own`  | `user_id = auth.uid()` |
| INSERT    | `{table}_insert_own`  | `user_id = auth.uid()` |
| UPDATE    | `{table}_update_own`  | `user_id = auth.uid()` |
| DELETE    | `{table}_delete_own`  | `user_id = auth.uid()` |

Tables with RLS: `clients`, `projects`, `tasks`, `time_entries`

## Behavior

**Authenticated user:**
- Can read, create, update, delete their own data
- Cannot see or modify other users' data
- Queries automatically filter to their data only

**Unauthenticated requests:**
- All operations denied (no rows returned/affected)

**Service role:**
- Bypasses RLS (for admin/migration operations only)
- Not used in normal application flow

## Testing

Tests authenticate as real users to verify RLS behavior:
- Standard CRUD tests run as authenticated user
- Isolation tests verify cross-user access is denied
