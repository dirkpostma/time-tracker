---
name: test-coverage
description: Analyze specs vs tests and report gaps. Use when user invokes /test-coverage or asks to analyze test coverage against specs.
---

# Test Coverage Skill

When the user invokes `/test-coverage [spec-path]` or asks to analyze test coverage, follow this workflow.

## Purpose

Analyzes specs and existing tests to produce a coverage gap report. This is the "analysis" phase that identifies what tests are missing before writing them.

## Arguments

- `spec-path` (optional): Path to specific spec file. If omitted, analyze all specs in `specs/`.
- `feature-folder` (optional): Path to feature folder (e.g., `history/260118-row-level-security/`). If omitted, uses most recent folder in `history/`.

## Workflow

### Step 1: Identify Feature Folder

If feature folder provided:
- Use the specified folder

If no feature folder provided:
- Find most recent folder in `history/` (by date prefix YYMMDD)
- Confirm with user: "I found `history/260118-row-level-security/`. Use this folder?"

The coverage report will be saved to this folder.

### Step 2: Identify Target Specs

If spec path provided:
- Use the specified file

If no spec path provided:
- Scan all `specs/**/*.md` files
- List found specs and confirm with user

### Step 3: Extract IDs and Match Tests

For each spec file, perform ID-based matching (no subagent needed):

1. **Parse scenario tables** - Extract all IDs from tables with `| ID |` column
2. **Grep test files for @spec annotations** - Search for `@spec {id}` in test files
3. **Match IDs to determine coverage** - ID found in test = covered, not found = gap

**Implementation:**

```bash
# Extract IDs from spec file (lines containing | ID | pattern rows)
grep -E '^\| [a-z]+\.[a-z]+\.[a-z-]+ \|' specs/cli/config.md | cut -d'|' -f2 | tr -d ' '

# Search for @spec annotations in test files
grep -r '@spec config.validation.invalid-url' packages/
```

**Matching Logic:**

For each spec ID:
1. Search all test files for `@spec {id}`
2. If found: mark as "Covered" with test file:line location
3. If not found: mark as "Gap"

This is faster and more reliable than semantic matching.

### Step 4: Collect Results

Merge the ID-based coverage analyses into a unified report.

### Step 5: Generate Coverage Report

Create a report file at `{feature-folder}/test-coverage.md` with format:

```markdown
# Test Coverage Report - YYYY-MM-DD

## Summary
- Specs analyzed: X
- Total scenarios: Y
- Covered: Z (%)
- Gaps: N

## By Spec

### specs/cli/config.md

| ID | Scenario | Status | Test Location |
|----|----------|--------|---------------|
| config.validation.invalid-url | Invalid URL format | Covered | config.test.ts:36 |
| config.validation.network-error | Connection failed | Covered | config.test.ts:77 |
| config.firstrun.user-confirms | User confirms setup | Gap | - |

### specs/cli/interactive-mode.md

| ID | Scenario | Status | Test Location |
|----|----------|--------|---------------|
| interactive.running.stop | Stop timer | Covered | interactive.test.ts:230 |
| interactive.running.switch | Switch timer | Covered | interactive.test.ts:247 |
```

### Step 6: Present Results

Show user:
1. Summary statistics
2. Location of full report
3. List of gaps (if any)

## Example Usage

```
User: /test-coverage
Assistant: I found `history/260118-row-level-security/`. Use this folder?
User: Yes
Assistant: I'll analyze all specs for test coverage...
[Scans specs/, launches subagents, collects results]
Done! Created `history/260118-row-level-security/test-coverage.md`

Summary:
- Specs analyzed: 5
- Total scenarios: 42
- Covered: 35 (83%)
- Gaps: 7

Run `/write-tests` to fill the gaps.
```

```
User: /test-coverage specs/core/row-level-security.md
Assistant: I found `history/260118-row-level-security/`. Use this folder?
User: Yes
Assistant: I'll analyze test coverage for the RLS spec...
[Launches single subagent, collects results]
Done! Report at `history/260118-row-level-security/test-coverage.md`

RLS Coverage: 4/6 scenarios covered (67%)
Gaps:
- DELETE policy not tested
- Cross-user access denial not tested
```

## Notes

- ID-based matching is fast and deterministic (no AI semantic matching needed)
- Spec IDs follow pattern: `{domain}.{feature}.{scenario}` (e.g., `config.validation.invalid-url`)
- Tests link to specs via `/** @spec {id} */` JSDoc comments above `it()` blocks
- Report is saved to the feature folder for use by `/write-tests`
- Feature folder structure: `history/YYMMDD-<feature-name>/`
