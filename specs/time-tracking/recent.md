# Recent Spec

Stores recently used selections for smart defaults in interactive mode.

## File Location

```
~/.tt-recent.json
```

## Format

```json
{
  "clientId": "uuid",
  "projectId": "uuid"
}
```

## Fields

| Field | Type | Description |
|-------|------|-------------|
| clientId | uuid | Last selected client in interactive mode |
| projectId | uuid | Last selected project in interactive mode |

## Behavior

- **Saved** after starting a timer via interactive mode
- **Loaded** when interactive mode starts, to pre-select last-used options
- If file doesn't exist or is invalid, defaults to empty (no pre-selection)
- File is created automatically on first use
