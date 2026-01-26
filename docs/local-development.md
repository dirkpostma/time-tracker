# Local Development Setup

## Prerequisites

1. Start local Supabase: `npx supabase start`
2. Verify it's running: `npx supabase status`

## Configuration

The `.env` file is configured for local Docker Supabase:
```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_PUBLISHABLE_KEY=<from supabase status>
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Test1234
```

## Test User Setup

Create a test user in local Supabase (if not exists):
```bash
# Via Supabase Studio
# Go to http://127.0.0.1:54323 > Authentication > Users

# Or via docker psql
docker exec supabase_db_time-tracker psql -U postgres -d postgres -c \
  "INSERT INTO auth.users (email, encrypted_password, ...) ..."
```

## Running Tests

```bash
npm test -- --run              # All tests against local Docker
npm test -- --run auth         # Auth tests only
```

## Supabase Studio

Access at http://127.0.0.1:54323 for:
- Database browser
- User management
- SQL editor
