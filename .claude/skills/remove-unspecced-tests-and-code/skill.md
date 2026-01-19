---
name: remove-unspecced-tests-and-code
description: Find and remove tests without matching specs, then remove code no longer covered by tests. Use when user invokes /remove-unspecced-tests-and-code or asks to clean up orphaned tests/code.
---

# Remove Unspecced Tests and Code

When the user invokes `/remove-unspecced-tests-and-code`, follow this workflow.

## Purpose

In a strict TDD workflow:
- **Specs** justify tests
- **Tests** justify code
- Code without this chain of justification should be removed

This skill finds and removes:
1. **Orphaned tests** - tests with `@spec` annotations pointing to non-existent spec IDs
2. **Orphaned code** - code no longer covered by any test

## Prerequisites

- Project should have 100% test coverage (or close to it)
- Tests should use `/** @spec {id} */` annotations to link to specs

## Workflow

### Step 1: Find All @spec Annotations in Tests

```bash
grep -rn '@spec' --include='*.test.ts' . | grep -v node_modules
```

### Step 2: Validate Each @spec Against Specs

For each annotation:
1. Extract the spec ID (e.g., `auth.legacy.oauth1`)
2. Search `specs/**/*.md` for that ID
3. If not found → orphaned test

### Step 3: Report Orphaned Tests

Show user which tests have no matching spec.

### Step 4: Confirm and Remove Orphaned Tests

With user confirmation:
- Remove the `it()` or `test()` block containing the orphaned `@spec`
- Remove empty `describe()` blocks

### Step 5: Run Coverage

```bash
npm test -- --run --coverage
```

### Step 6: Report Uncovered Code

Parse coverage output to find:
- Functions with 0% coverage
- Files with 0% coverage
- Uncovered branches/lines

### Step 7: Handle Uncovered Code

For each uncovered section, show the code and ask the user what to do:

**Option A: Add spec & test**
- Add spec ID to appropriate `specs/*.md` file
- Write test with `@spec` annotation
- Verify test covers the previously uncovered code

**Option B: Remove the code**
- Remove the uncovered code
- Run tests to ensure nothing breaks

Present this choice to the user for each uncovered section using `AskUserQuestion`.

### Step 8: Final Verification

Run tests again to confirm everything still passes.

## Notes

- Always ask for confirmation before removing tests or code
- Run tests after each removal step to catch breakage early
- This skill assumes TDD discipline: all code exists to make a test pass
