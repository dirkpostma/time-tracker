# Spec ↔ Test Traceability (Hybrid with spec.md)

## Traceability in Hybrid Model

With specs in dedicated spec.md files, traceability is clear:

```
packages/core/
├── README.md          # Setup, usage
├── spec.md            # req-core-001, req-core-002, ...
└── src/
    ├── timer.ts       # Implementation
    └── timer.test.ts  # Tests reference req-core-*
```

---

## Current Alignment Analysis

### Core Package

| Current Spec | Requirement | Test | Status |
|--------------|-------------|------|--------|
| time-tracking/flow.md | One timer at a time | timer.test.ts:207-230 | ✅ |
| time-tracking/flow.md | Force stop existing | timer.test.ts:232-260 | ✅ |
| time-tracking/flow.md | Stop error if none | timer.test.ts:284-289 | ✅ |
| (none) | Validation rules | validation.test.ts | ⚠️ Needs spec |

### Repositories Package

| Current Spec | Requirement | Test | Status |
|--------------|-------------|------|--------|
| cli/config.md | Config file format | config.test.ts | ✅ |
| (none) | Repository interfaces | client.test.ts, etc. | ⚠️ Needs spec |
| (none) | Supabase connection | connection.test.ts | ⚠️ Needs spec |

### CLI Package

| Current Spec | Requirement | Test | Status |
|--------------|-------------|------|--------|
| cli/commands.md | Command signatures | *.test.ts | ✅ |
| cli/interactive-mode.md | Interactive flow | interactive.test.ts | ✅ |
| time-tracking/recent.md | Recent selections | recent.test.ts | ✅ |
| (none) | Auth commands | auth.test.ts | ⚠️ Needs spec |

### Features (Cross-cutting)

| Current Spec | Requirement | Tests | Status |
|--------------|-------------|-------|--------|
| time-tracking/flow.md | Timer flows | timer.test.ts, timerSwitch.test.ts | ✅ |
| (none) | Auth flows | auth.test.ts, auth.integration.test.ts | ⚠️ Needs spec |

---

## Target State After Migration

### packages/core/spec.md

```markdown
# Core Package Specification

## Timer Rules

### req-core-001: One timer at a time
Only one timer can run at a time.

**Tests:** `src/timer.test.ts`
- "should return error when timer is already running"
- "should stop existing timer when force is true"

### req-core-002: Duration calculation
Duration = floor((endedAt - startedAt) / 60000) minutes.

**Tests:** `src/timer.test.ts`
- "should calculate duration in minutes"
- "should handle fractional minutes by flooring"

## Validation Rules

### req-core-010: Name validation
Names must be non-empty, max 100 chars.

**Tests:** `src/validation.test.ts`
- "should reject empty names"
- "should reject names over 100 chars"
```

### Test File Headers

```typescript
// packages/core/src/timer.test.ts

/**
 * Tests for: packages/core/spec.md
 *
 * Requirements covered:
 * - req-core-001: One timer at a time
 * - req-core-002: Duration calculation
 */

describe('req-core-001: One timer at a time', () => {
  // ...
});
```

---

## Requirement ID Allocation

### Allocated Ranges

| Package | Prefix | Range |
|---------|--------|-------|
| Architecture | req-arch | 001-099 |
| Features | req-feat | 001-099 |
| Core | req-core | 001-099 |
| Repositories | req-repo | 001-099 |
| CLI | req-cli | 001-099 |

### Initial Assignments

**req-core (packages/core/spec.md)**
- req-core-001: One timer at a time
- req-core-002: Duration calculation
- req-core-003: Timer state detection
- req-core-010: Client name validation
- req-core-011: Project name validation
- req-core-012: Task name validation
- req-core-013: Description validation

**req-repo (packages/repositories/spec.md)**
- req-repo-001: Config file location (~/.tt/config.json)
- req-repo-002: Config file permissions (0600)
- req-repo-003: Token refresh on expiry
- req-repo-010: Client CRUD operations
- req-repo-011: Project CRUD operations
- req-repo-012: Task CRUD operations
- req-repo-013: TimeEntry operations

**req-cli (packages/cli/spec.md)**
- req-cli-001: Name matching by exact name
- req-cli-002: Create prompt when not found
- req-cli-003: Auth required for most commands
- req-cli-010: start command
- req-cli-011: stop command
- req-cli-012: status command
- req-cli-020: Interactive mode default
- req-cli-021: Recent selections persistence

**req-feat (specs/features/)**
- req-feat-001: Timer start flow
- req-feat-002: Timer stop flow
- req-feat-003: Timer switch confirmation
- req-feat-010: Login flow
- req-feat-011: Logout flow
- req-feat-012: Session restoration

---

## Verification Commands

After migration, verify traceability:

```bash
# 1. List all requirements in specs
grep -rh "req-" specs/ packages/*/spec.md | grep "^###" | sort

# 2. List all requirements in tests
grep -rh "req-" packages/*/src/*.test.ts | sort | uniq

# 3. Find requirements without tests
# (manual: compare above outputs)

# 4. Find tests without requirements
grep -h "describe\|it(" packages/*/src/*.test.ts | grep -v "req-"
```

---

## Maintaining Traceability

### When Adding Features

1. Add requirement to spec.md
2. Write test referencing requirement
3. Implement

### When Fixing Bugs

1. Check if spec needs updating
2. Add test for bug scenario
3. Fix implementation

### Review Checklist

- [ ] New code has corresponding req-* in spec.md
- [ ] New tests reference req-* in describe block
- [ ] spec.md lists test file for each requirement
