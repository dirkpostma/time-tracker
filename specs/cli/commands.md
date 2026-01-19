# CLI Commands Spec

Command name: `tt`

## Time Tracking

```
tt start --client <client> [--project <project>] [--task <task>] [--description <description>]
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
tt login          # Log in with email/password
tt logout         # Log out and clear session
tt whoami         # Show current logged-in user
```

All commands except `config`, `login`, `logout`, and `whoami` require authentication.

## Interactive Mode

See `interactive-mode.md` for details.

```
tt                # Launch interactive selection flow
```

## Name Matching

- `--client`, `--project`, and `--task` match by name
- If not found, prompt user: "<Entity> 'X' doesn't exist. Create it? [y/n]"

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
| auth.login.success | tt login | Prompt for email/password, authenticate |
| auth.logout.success | tt logout | Clear session |
| auth.whoami.logged-in | tt whoami (logged in) | Show current user email |
| auth.whoami.not-logged-in | tt whoami (not logged in) | Show "Not logged in" |

### Name Matching

| ID | Scenario | Expected |
|----|----------|----------|
| entity.name-match.found | Entity name exists | Use matched entity |
| entity.name-match.not-found | Entity name doesn't exist | Prompt "<Entity> 'X' doesn't exist. Create it? [y/n]" |
