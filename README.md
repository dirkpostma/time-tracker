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
