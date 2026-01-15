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

## Feature Development Workflow

**IMPORTANT: Always start with a planning phase before implementation.**

### 1. Planning Phase (Required)
- Ask clarifying questions to understand requirements fully
- Don't assume - ask about edge cases, error handling, UI/UX preferences
- Document requirements in a spec file (`/specs/<feature>.md`)
- Get user approval on the spec before coding

### 2. Implementation Phase
- Write failing test first
- Implement minimal code to pass
- Refactor if needed
- Never write implementation code without a test

### 3. Verification Phase
- All tests must pass before committing
- Check if tests match the specifications in /specs
- Check if docs need updating (README.md, specs/)

## Questions to Ask Before Implementing

- What is the expected input/output?
- What are the edge cases?
- How should errors be handled?
- Are there performance requirements?
- Does this need CLI commands, or just core logic?
- How does this interact with existing features?
