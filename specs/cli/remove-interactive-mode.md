# CLI Cleanup: Remove Interactive Mode

**Goal:** CLI for automation only. App handles interactive use.

## Files to DELETE

| File | Reason |
|------|--------|
| `packages/cli/src/interactive.ts` | Full interactive mode (`tt` with no args) |
| `packages/cli/src/interactive.test.ts` | Tests for above |
| `packages/cli/src/recent.ts` | "Last used" storage for interactive selections |
| `packages/cli/src/recent.test.ts` | Tests for above |

## Files to MODIFY

### index.ts
Remove all `confirm()` prompts:
- ❌ "Client doesn't exist. Create it?" → Error + exit
- ❌ "Stop timer and start new one?" → Require `--force`
- ❌ "Overwrite description?" → Require `--force` 
- ❌ Default action (interactive mode) → Show help instead

### auth.ts
Replace prompts with flags:
- `tt login --email X --password Y`
- Or: `tt login` reads from env (`TT_EMAIL`, `TT_PASSWORD`)

### config.ts
Replace prompts with flags:
- `tt config --url X --key Y`
- Or: env vars only (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`)

### seed.ts
Already has `--force`, just remove interactive confirm for remote DBs (fail without `--force`)

## Behavior Changes

| Before | After |
|--------|-------|
| `tt` → interactive picker | `tt` → show help |
| `tt start --client X` (new client) → "Create?" prompt | Error: "Client X not found" |
| `tt start` (timer running) → "Stop?" prompt | Error: "Timer running. Use --force" |
| `tt login` → prompts for email/password | `tt login --email X --password Y` |

## Dependencies to Remove

```json
// packages/cli/package.json
- "@inquirer/prompts"
```

## Test Updates Required

1. Remove `interactive.test.ts` and `recent.test.ts`
2. Update `auth.test.ts` - remove prompt mocks, test flag-based login
3. Update `config.test.ts` - remove prompt mocks, test flag-based config
4. Update `timerSwitch.test.ts` - remove interactive mode tests, keep `--force` tests
5. Update any integration tests that use interactive mode
