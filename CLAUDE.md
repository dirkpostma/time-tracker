# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A CLI application for tracking time spent on projects.

## Data Model

Hierarchy: **Client > Project > Task (optional) > TimeEntry**

- **Client**: Top-level entity (company/individual you work for)
- **Project**: Belongs to a client
- **Task**: Optional, belongs to a project
- **TimeEntry**: Start/end timestamps for work sessions

Storage: Supabase (PostgreSQL)

## Commands

```bash
npm run build      # Build the CLI
npm run dev        # Build in watch mode
npm test           # Run tests in watch mode
npm run test:run   # Run tests once
```

## Development Approach

- Spec-based development. Specs live in `/specs` and define features before implementation.

## Development Workflow

1. Write failing test first
2. Implement minimal code to pass
3. Refactor if needed
4. Never write implementation code without a test
5. All tests must pass before committing
