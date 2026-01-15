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
