# Time Tracker CLI

A command-line tool for tracking time spent on projects.

## Quick Start (Local Development)

```bash
# 1. Clone and install
git clone <repo-url>
cd time-tracker
npm install

# 2. Start local database (requires Docker)
npm run db:start

# 3. Build and run
npm run build
./dist/index.js
```

That's it! No Supabase account needed for local development.

## Data Structure

- **Client** - Company or individual you work for
- **Project** - Belongs to a client (optional)
- **Task** - Belongs to a project (optional)
- **TimeEntry** - Time session with start/end timestamps

## Commands

### Interactive Mode

```bash
tt                    # Launch interactive mode (arrow-key selection)
```

When a timer is running, shows options to Stop/Switch/Cancel.
When no timer, walks through: Client > Project > Task > Description.

### Time Tracking

```bash
tt start --client <client> [--project <project>] [--task <task>] [--description <desc>]
tt stop [--description <description>]
tt status
```

### Entity Management

```bash
tt client add <name>
tt client list

tt project add <name> --client <client>
tt project list

tt task list --client <client> --project <project>
```

Names are matched by string. If not found, prompts to create.

### Configuration

```bash
tt config            # Interactive credential setup (validates before saving)
tt config --show     # Show current config (key masked)
```

Credentials are stored in `~/.tt/config.json` with secure permissions (0600).

### Examples

```bash
# Start tracking time for a client
tt start --client "Acme Corp"

# Start with project and description
tt start --client "Acme Corp" --project "Website" --description "Working on homepage"

# Check current timer
tt status

# Stop and add/update description
tt stop --description "Finished header section"
```

## Architecture

The codebase is structured for sharing between CLI and future mobile app:

```
src/
├── core/                    # Pure business logic (shareable)
│   ├── types.ts            # Shared types (Client, Project, Task, TimeEntry)
│   ├── validation.ts       # Input validation functions
│   └── timer.ts            # Timer state and operations
├── repositories/           # Data access layer (shareable)
│   ├── types.ts            # Repository interfaces
│   └── supabase/           # Supabase implementations
├── cli/                    # CLI-specific code
│   └── commands/           # Command handlers
├── config.ts               # Credential management
├── recent.ts               # Last-used selections
└── index.ts                # CLI entry point
```

**Core layer** - Pure functions with no I/O, easy to test, can be used by CLI, mobile app, or API.

**Repository layer** - Interface-based data access. Currently implements Supabase, but can be swapped.

**CLI layer** - Thin wrappers that handle user interaction and output formatting.

## Development

### Prerequisites

- Node.js 18+
- Docker (for local Supabase)
- Supabase CLI (`brew install supabase/tap/supabase`)

### Local Database

```bash
npm run db:start    # Start local Supabase (PostgreSQL + API in Docker)
npm run db:stop     # Stop Docker containers
npm run db:reset    # Reset database and re-run migrations
```

### Running Tests

```bash
npm run db:start    # Start local Supabase first
npm run test:run    # Run tests once
npm test            # Run tests in watch mode
```

### Building

```bash
npm run build       # Compile TypeScript to dist/
npm run dev         # Watch mode
```

### Install Globally

```bash
npm run install:global   # Build and install `tt` command globally
```

For development (auto-updates on rebuild):
```bash
npm link
```

## Production Setup

To use with a hosted Supabase instance:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the database to be provisioned

### 2. Get Credentials

1. In your Supabase project, go to **Settings > API**
2. Copy the **Project URL** and **anon key** (publishable key)

### 3. Deploy Migrations

```bash
# Set credentials temporarily to run migrations
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_PUBLISHABLE_KEY=your-anon-key
npm run db:deploy
```

### 4. Configure CLI

```bash
tt config
```

Enter your Supabase URL and key when prompted. Credentials are validated before saving.

### 5. Run from Anywhere

```bash
tt                   # Works from any directory
```

## License

MIT
