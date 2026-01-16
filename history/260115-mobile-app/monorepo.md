# Phase 1: Monorepo Setup

## Folder Structure

```
time-tracker/
├── packages/
│   ├── core/           # Pure business logic (shared)
│   ├── repositories/   # Data access layer (shared)
│   ├── cli/            # CLI application
│   └── mobile/         # Expo mobile app
├── package.json        # Root workspace config
└── tsconfig.base.json  # Shared TS config
```

## Extract @time-tracker/core

Move from `/src/core/`:
- `types.ts` - Domain types
- `timer.ts` - Timer logic
- `validation.ts` - Input validation

## Extract @time-tracker/repositories

Move from `/src/repositories/`:
- `types.ts` - Repository interfaces
- `supabase/` - Supabase implementation

**Critical change:** Modify `connection.ts` for dependency injection:

```typescript
// Before: reads from ~/.tt/config.json (Node.js specific)
// After: client injected via setSupabaseClient()
export function setSupabaseClient(client: SupabaseClient): void;
export function getSupabaseClient(): SupabaseClient;
```

## Migrate CLI

- Move `/src/cli/` to `packages/cli/src/`
- Update imports to use `@time-tracker/core` and `@time-tracker/repositories`
- Add bootstrap code for Supabase client initialization
