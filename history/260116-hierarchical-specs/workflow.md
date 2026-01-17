# Development Workflow (Hybrid Specs)

## Core Principle

```
Idea → Spec → Test → Implementation
```

**Where specs live:**
- Cross-cutting → `/specs/`
- Package-specific → `packages/*/spec.md`

---

## Finding the Right Spec

| I want to... | Look in |
|--------------|---------|
| Understand the system | `specs/README.md` |
| See how layers connect | `specs/architecture/layers.md` |
| See data model | `specs/architecture/data-model.md` |
| Understand a feature flow | `specs/features/*.md` |
| See core requirements | `packages/core/spec.md` |
| See repository interfaces | `packages/repositories/spec.md` |
| See CLI commands | `packages/cli/spec.md` |
| See Supabase details | `packages/repositories/src/supabase/spec.md` |

---

## Workflow Stages

### 1. Requirements (Issue)

```bash
bd create "Feature name" --type feature --description "What and why"
```

### 2. Specification

**Before writing code, update the relevant spec:**

| Change Type | Update Location |
|-------------|-----------------|
| New entity/field | `specs/architecture/data-model.md` + `packages/core/spec.md` |
| New business rule | `packages/core/spec.md` |
| New repository method | `packages/repositories/spec.md` |
| New CLI command | `packages/cli/spec.md` |
| New feature flow | `specs/features/*.md` |
| Architecture change | `specs/architecture/*.md` |

**Spec update checklist:**
- [ ] Added requirement ID (req-xxx-nnn)
- [ ] Described expected behavior
- [ ] Noted edge cases
- [ ] Listed affected tests

### 3. Test (TDD)

Write tests BEFORE implementation:

```typescript
/**
 * Tests for req-core-001 (packages/core/spec.md)
 */
describe('req-core-001: One timer at a time', () => {
  it('should return error when starting timer while one is running', () => {
    // ...
  });
});
```

**Test location matches package:**

| Package | Test Files |
|---------|------------|
| core | `packages/core/src/*.test.ts` |
| repositories | `packages/repositories/src/**/*.test.ts` |
| cli | `packages/cli/src/*.test.ts` |

### 4. Implementation

Only after spec exists and test fails:

1. Write minimal code to pass test
2. Refactor if needed
3. Verify spec requirements are met

### 5. Verification

Before marking complete:

- [ ] All tests pass
- [ ] Spec requirements have corresponding tests
- [ ] Implementation matches spec
- [ ] spec.md updated if API changed

---

## Requirement ID Format

```
req-{package}-{number}

req-core-001    # Core package requirement
req-repo-001    # Repository requirement
req-cli-001     # CLI requirement
req-feat-001    # Feature requirement (in specs/features/)
req-arch-001    # Architecture requirement
```

All lowercase for consistency and cross-OS compatibility.

---

## claude.md Updates

Replace the Documentation Strategy section with:

```markdown
## Specifications

**Hybrid approach** — specs live in two places:

| Type | Location | Purpose |
|------|----------|---------|
| Architecture | `specs/architecture/` | System design, data model |
| Features | `specs/features/` | End-to-end flows |
| Package specs | `packages/*/spec.md` | Requirements, colocated with code |

### Workflow

1. **Find relevant spec** — Architecture in `/specs/`, packages in spec.md
2. **Update spec first** — Add requirement ID (req-xxx-nnn)
3. **Write failing test** — Reference requirement ID
4. **Implement** — Make test pass
5. **Verify** — Spec ↔ test ↔ code aligned

### Navigation

| Looking for... | Go to |
|----------------|-------|
| System overview | `specs/README.md` |
| Data model | `specs/architecture/data-model.md` |
| Feature flow | `specs/features/*.md` |
| Package requirements | `packages/*/spec.md` |

### Updating Specs

| Change | Update |
|--------|--------|
| Entity fields | `specs/architecture/data-model.md` + `packages/core/spec.md` |
| Business rules | `packages/core/spec.md` |
| Repository methods | `packages/repositories/spec.md` |
| CLI commands | `packages/cli/spec.md` |
| Feature flows | `specs/features/*.md` |
```

---

## Example: Adding "Pause Timer" Feature

### Step 1: Create Issue
```bash
bd create "Pause timer" --type feature --description "Allow pausing without stopping"
```

### Step 2: Update Specs

**specs/features/time-tracking.md** (add section):
```markdown
## Pause/Resume

### req-feat-010: Pause running timer
- Pausing sets `paused_at` timestamp on TimeEntry
- Cannot pause already paused timer
- Cannot pause stopped timer

### req-feat-011: Resume paused timer
- Resuming clears `paused_at`
- Total duration excludes paused time
```

**packages/core/spec.md** (add to Timer Rules):
```markdown
### req-core-020: Pause timer
Timer can be paused. Paused timers track `paused_at` timestamp.

### req-core-021: Resume timer
Resuming adjusts duration calculation to exclude paused time.
```

**packages/cli/spec.md** (add commands):
```markdown
tt pause    # Pause running timer
tt resume   # Resume paused timer
```

### Step 3: Write Tests

```typescript
// packages/core/src/timer.test.ts
describe('req-core-020: Pause timer', () => {
  it('should set paused_at when pausing running timer', async () => {
    // ...
  });

  it('should error when pausing already paused timer', async () => {
    // ...
  });
});
```

### Step 4: Implement

Write code to make tests pass.

### Step 5: Verify

- [ ] Tests pass
- [ ] All req-* have tests
- [ ] Implementation matches specs
