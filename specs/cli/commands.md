# CLI Commands Spec

Command name: `tt`

## Time Tracking

```
tt start --client <client> [--project <project>] [--task <task>] [--description <description>] [--force]
tt stop [--description <description>]
tt status
```

## Client Management

```
tt client add <name>
tt client list
```

## Project Management

```
tt project add <name> --client <client>
tt project list
```

## Task Management

```
tt task list --client <client> --project <project>
```

## Authentication

```
tt login          # Log in using TT_EMAIL and TT_PASSWORD env vars
tt logout         # Log out and clear session
tt whoami         # Show current logged-in user
```

All commands except `config`, `login`, `logout`, and `whoami` require authentication.

## Default Behavior

```
tt                # Show help (no interactive mode)
```

## Name Matching

- `--client`, `--project`, and `--task` match by name
- If not found, command fails with error message

## Scenarios

### Client Commands

| ID | Scenario | Expected |
|----|----------|----------|
| client.add.success | tt client add <name> | Create client with given name |
| client.list.success | tt client list | Show all clients |

### Project Commands

| ID | Scenario | Expected |
|----|----------|----------|
| project.add.success | tt project add <name> --client <client> | Create project under client |
| project.list.success | tt project list | Show all projects |

### Task Commands

| ID | Scenario | Expected |
|----|----------|----------|
| task.list.success | tt task list --client <c> --project <p> | Show tasks for project |

### Authentication Commands

| ID | Scenario | Expected |
|----|----------|----------|
| auth.login.env-vars | tt login (with TT_EMAIL/TT_PASSWORD set) | Authenticate using env vars |
| auth.login.missing-credentials | tt login (no env vars) | Error: "Missing TT_EMAIL and TT_PASSWORD environment variables" |
| auth.login.missing-email | tt login (only TT_PASSWORD set) | Error: "Missing TT_EMAIL environment variable" |
| auth.login.missing-password | tt login (only TT_EMAIL set) | Error: "Missing TT_PASSWORD environment variable" |
| auth.logout.success | tt logout | Clear session |
| auth.whoami.logged-in | tt whoami (logged in) | Show current user email |
| auth.whoami.not-logged-in | tt whoami (not logged in) | Show "Not logged in" |

### Name Matching

| ID | Scenario | Expected |
|----|----------|----------|
| entity.name-match.found | Entity name exists | Use matched entity |
| entity.name-match.not-found | Entity name doesn't exist | Error: "<Entity> '<name>' not found" |
