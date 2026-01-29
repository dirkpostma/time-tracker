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
| **Web specs** | `specs/web/` |
| **Mobile next features** | `specs/mobile/next-features.md` |
| Local dev setup | `docs/local-development.md` |
| Mobile dev setup | `docs/mobile-development.md` |
| **Mobile env vars** | `docs/mobile-development.md#environment-variables` |
| **Maestro testing tips** | `docs/maestro-testing-learnings.md` |
| **Marketing website plan** | `plans/marketing-website/README.md` |

## Development Rules

- **Always test against local Docker Supabase**, not cloud
- **Write failing test first**, then implement
- **Ask before committing** - never commit automatically
- Use `/start-feature <name>` for new features
- **Never make up facts** - no fake stats, testimonials, user counts, or social proof on marketing/public pages. Stick to verifiable truths. (Mock data in demo components and showcases is fine.)

## Test User

```
Email: test@example.com
Password: Test1234
```

## Mobile Spec/Test Gap Resolution (Jan 2026)

| Task | Action | Status |
|------|--------|--------|
| Offline Support | Remove feature (spec + implementation) | Done |
| Theme System | Remove feature (implementation + tests) | Done |
| Signup Flow | Add spec (`specs/mobile/signup.md`) | Done |
| History Content Rendering | Add tests (grouping, totals, formatting) | Pending |
| Selection Smart Defaults | Add tests (persistence across restarts) | Pending |
| Notification Behavior | Add tests (permission flow, scheduling) | Pending |
| Timer Display Format | Add tests (HH:MM:SS, tabular-nums) | Pending |
