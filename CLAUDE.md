# CLAUDE.md

Time tracking app with CLI and mobile (iOS) interfaces.

## Data Model

**Client > Project > Task (optional) > TimeEntry** stored in Supabase.

## Commands

```bash
npm run build          # Build CLI
npm test -- --run      # Run tests
npx supabase start     # Start local DB
```

## Key Locations

| What | Where |
|------|-------|
| CLI specs | `specs/cli/` |
| Mobile specs | `specs/mobile/` |
| **Mobile next features** | `specs/mobile/next-features.md` |
| Local dev setup | `docs/local-development.md` |
| Mobile dev setup | `docs/mobile-development.md` |
| **Mobile env vars** | `docs/mobile-development.md#environment-variables` |
| **Maestro testing tips** | `docs/maestro-testing-learnings.md` |

## Development Rules

- **Always test against local Docker Supabase**, not cloud
- **Write failing test first**, then implement
- **Ask before committing** - never commit automatically
- Use `/start-feature <name>` for new features

## Test User

```
Email: test@example.com
Password: Test1234
```
