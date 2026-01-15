# Config Spec

## Overview

The `tt config` command manages Supabase credentials for the CLI. Credentials are stored globally so `tt` can run from any directory.

## File Location

- Config file: `~/.tt/config.json`
- Permissions: `0600` (user read/write only)

## Format

```json
{
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseKey": "your-anon-key"
}
```

## Commands

```
tt config              # Interactive setup
tt config --show       # Show current config (key masked)
```

## Priority

Configuration is loaded in this order (first match wins):
1. Environment variables (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`)
2. Config file (`~/.tt/config.json`)

## Credential Validation

When saving credentials via `tt config`, the CLI validates them by making a test API call to Supabase.

### Behavior

1. User enters Supabase URL and key
2. CLI attempts to connect to Supabase (e.g., simple query)
3. If connection succeeds: save credentials and confirm
4. If connection fails: show error, do NOT save credentials

### Error Messages

| Scenario | Error Message |
|----------|---------------|
| Invalid URL format | `Invalid Supabase URL format. Expected: https://<project>.supabase.co` |
| Connection failed (network) | `Could not connect to Supabase. Check your URL and network connection.` |
| Invalid credentials (401/403) | `Invalid Supabase credentials. Check your API key.` |
| Other API error | `Supabase connection failed: <error details>` |

### Example Interaction

```
$ tt config
Supabase URL: https://myproject.supabase.co
Supabase Key: my-anon-key
Validating credentials...
Error: Invalid Supabase credentials. Check your API key.
Credentials not saved.
```

```
$ tt config
Supabase URL: https://myproject.supabase.co
Supabase Key: correct-anon-key
Validating credentials...
Credentials saved to ~/.tt/config.json
```

## Runtime Credential Errors

When running any command with invalid stored credentials:

| Scenario | Error Message |
|----------|---------------|
| Stored credentials invalid | `Supabase authentication failed. Run 'tt config' to update your credentials.` |

## First-Run Setup

When no configuration exists and the user runs any command:

1. Detect missing config before executing the command
2. Prompt: "No configuration found. Set up now? [Y/n]"
3. If yes: run `tt config` flow, then continue with original command
4. If no: exit with message "Run 'tt config' when ready."

### Example

```
$ tt
No configuration found. Set up now? (Y/n) y
Supabase URL: https://myproject.supabase.co
Supabase Key: my-anon-key
Validating credentials...
Credentials saved to ~/.tt/config.json

[continues with interactive mode]
```
