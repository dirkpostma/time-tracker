# CLI Auth Implementation Plan

## Goal
Add `tt login`, `tt logout`, `tt whoami` commands to enable user authentication.

## Requirements (from user)
- Login only (no signup in CLI)
- CLI auth first (database RLS comes later)
- Require login for all commands except config/login/logout/whoami

## Files to Create

### `packages/repositories/src/supabase/auth.ts`
Auth repository layer:
- `initAuthSession()` - Load tokens from config, set Supabase session
- `signIn(email, password)` - Authenticate, save tokens
- `signOut()` - Clear session and tokens
- `getCurrentUser()` - Get logged-in user info

### `packages/cli/src/auth.ts`
CLI command handlers:
- `loginCommand()` - Prompt email/password, call signIn
- `logoutCommand()` - Call signOut, show confirmation
- `whoamiCommand()` - Show current user
- `ensureAuth()` - Check auth, exit if not logged in

### Test files
- `packages/repositories/src/supabase/auth.test.ts`
- `packages/cli/src/auth.test.ts`

## Files to Modify

### `packages/repositories/src/supabase/config.ts`
Extend Config interface:
```typescript
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface Config {
  supabaseUrl: string;
  supabaseKey: string;
  auth?: AuthTokens;  // New field
}
```

Add functions:
- `getAuthTokens()` - Read auth tokens from config
- `saveAuthTokens(tokens)` - Save auth tokens to config
- `clearAuthTokens()` - Remove auth from config

### `packages/cli/src/index.ts`
1. Add auth commands (login, logout, whoami)
2. Modify preAction hook:
```typescript
const AUTH_EXEMPT = ['config', 'login', 'logout', 'whoami'];

.hook('preAction', async (cmd) => {
  if (cmd.name() === 'config') return;
  await ensureConfig();
  if (AUTH_EXEMPT.includes(cmd.name())) return;
  await ensureAuth();  // New check
});
```

### `packages/repositories/package.json`
Add export for `./supabase/auth`

## Implementation Order

1. Extend config.ts with auth token functions + tests
2. Create auth.ts repository with Supabase integration + tests
3. Create CLI auth.ts command handlers + tests
4. Register commands and update preAction hook in index.ts
5. Build and manually test full flow

## Token Refresh Strategy
- Use `supabase.auth.setSession()` which handles auto-refresh
- Listen for `TOKEN_REFRESHED` events to persist new tokens
- On expired/invalid tokens: clear storage, require re-login

## Verification
1. Run tests: `npm test`
2. Build: `npm run build`
3. Manual test flow:
   - `tt login` - Should prompt and save tokens
   - `tt whoami` - Should show logged-in user
   - `tt client list` - Should work (requires auth)
   - `tt logout` - Should clear tokens
   - `tt client list` - Should fail with "run tt login"
