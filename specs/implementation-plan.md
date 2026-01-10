# Implementation Plan

## Tech Stack

- Database: Supabase
- CLI framework: Commander.js
- Prompts: @inquirer/prompts
- Testing: Vitest

## Phase 1: Project Setup

1. Initialize Node.js project with TypeScript
2. Set up Commander.js
3. Set up Vitest
4. Set up build tooling

## Phase 2: Supabase Setup

1. Create Supabase project
2. Create database schema (clients, projects, tasks, time_entries tables)
3. Set up Supabase client in the app
4. Configure environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)

## Phase 3: Client Management

1. Implement `tt client add <name>`
2. Implement `tt client list`

## Phase 4: Project Management

1. Implement `tt project add <name> --client <client>`
2. Implement `tt project list`
3. Implement name matching with prompt to create

## Phase 5: Task Management

1. Implement `tt task list --client <client> --project <project>`

## Phase 6: Time Tracking

1. Implement `tt start --client <client> --project <project> [--task <task>] [--description <description>]`
2. Implement `tt stop [--description <description>]`
3. Implement `tt status`
4. Implement one-timer-at-a-time constraint
5. Implement description overwrite warning
