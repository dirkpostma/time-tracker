# Time Tracker CLI

A command-line tool for tracking time spent on projects.

## Data Structure

- **Client** - Company or individual you work for
- **Project** - Belongs to a client
- **Task** - Optional, belongs to a project
- **TimeEntry** - Time session on a project/task

## Commands

```
tt start --client <client> --project <project> [--task <task>] [--description <description>]
tt stop [--description <description>]
tt status

tt client add <name>
tt client list

tt project add <name> --client <client>
tt project list

tt task list --client <client> --project <project>
```

Names are matched by string. If not found, prompts to create.

## Development

### Prerequisites

- Node.js 18+
- Docker (for local Supabase)
- Supabase CLI (`brew install supabase/tap/supabase`)

### Environment Setup

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

Get these values from your Supabase project dashboard under Settings > API.

**Note:** Tests use local Supabase (configured in `vitest.config.ts`), so `.env` is only needed for running the CLI against production.

### Local Database Setup

Start the local Supabase instance (runs PostgreSQL and API in Docker):

```bash
npm run db:start
```

This starts PostgreSQL on port 54322 and Supabase API on port 54321, then runs all migrations.

Other database commands:

```bash
npm run db:stop     # Stop Docker containers
npm run db:reset    # Reset database and re-run migrations
npm run db:deploy   # Deploy migrations to production
```

### Running Tests

```bash
npm run db:start    # Start local Supabase first
npm run test:run    # Run tests once
npm test            # Run tests in watch mode
```

### Workflow

```bash
# Development
npm run db:start         # Start local Supabase
npm run test:run         # Run tests locally

# After changes pass
npm run db:deploy        # Deploy migrations to production
```
