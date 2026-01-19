# Monorepo Setup Plan

## Goal
Convert single-package project to npm workspaces monorepo structure.

## Current State
- Single package with `src/core/`, `src/repositories/`, `src/cli/`
- Clean separation already exists
- 40 TypeScript files, ~6,130 lines
- ESM modules with relative imports

## Target Structure
```
time-tracker/
├── packages/
│   ├── core/           # @time-tracker/core
│   ├── repositories/   # @time-tracker/repositories
│   └── cli/            # @time-tracker/cli
├── package.json        # Workspaces config
├── tsconfig.base.json  # Shared TS config
└── vitest.workspace.ts # Shared test config
```

## Steps

### 1. Create root workspace config
- Update root `package.json` with `workspaces: ["packages/*"]`
- Remove current dependencies (will move to packages)
- Keep root scripts for convenience (`npm test`, `npm run build`)

### 2. Create tsconfig.base.json
- Extract shared compiler options
- Each package extends this base

### 3. Create packages/core
- Move `src/core/*.ts` to `packages/core/src/`
- Create `packages/core/package.json` with name `@time-tracker/core`
- Create `packages/core/tsconfig.json` extending base
- No external dependencies (pure logic)

### 4. Create packages/repositories
- Move `src/repositories/*.ts` to `packages/repositories/src/`
- Create package.json with `@supabase/supabase-js` dependency
- Add dependency on `@time-tracker/core`
- Update imports from relative to `@time-tracker/core`

### 5. Create packages/cli
- Move `src/cli/*.ts` to `packages/cli/src/`
- Create package.json with `commander`, `@inquirer/prompts`, `dotenv`
- Add dependencies on `@time-tracker/core` and `@time-tracker/repositories`
- Update imports to use package names
- Keep `bin` config for `tt` command

### 6. Update imports across all packages
- Replace `../../core/` with `@time-tracker/core`
- Replace `../repositories/` with `@time-tracker/repositories`

### 7. Configure vitest workspace
- Create `vitest.workspace.ts` at root
- Keep `fileParallelism: false` (timer singleton)

### 8. Install and verify
- Run `npm install` from root
- Run `npm test` - all tests pass
- Run `npm run build` - compiles all packages
- Run `npm run cli -- status` - CLI works

## Files to Create
- `package.json` (update)
- `tsconfig.base.json` (new)
- `vitest.workspace.ts` (new)
- `packages/core/package.json`
- `packages/core/tsconfig.json`
- `packages/repositories/package.json`
- `packages/repositories/tsconfig.json`
- `packages/cli/package.json`
- `packages/cli/tsconfig.json`

## Files to Move
- `src/core/*` → `packages/core/src/*`
- `src/repositories/*` → `packages/repositories/src/*`
- `src/cli/*` → `packages/cli/src/*`

## Verification
1. `npm install` - installs all workspace dependencies
2. `npm run build` - builds all packages
3. `npm test` - all tests pass
4. `npm run cli -- status` - CLI works
5. `npm run cli -- client list` - data access works
