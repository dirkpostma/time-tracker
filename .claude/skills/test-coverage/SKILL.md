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

### Step 3: Launch Analysis Subagents

For each spec file, launch a Task subagent (in parallel) that:

1. **Reads the spec file** - Understand what the spec describes
2. **Extracts testable scenarios** - Identify:
   - Behaviors described
   - Examples shown
   - Error cases mentioned
   - Constraints/rules specified
3. **Discovers related test files** by:
   - Searching for test files with matching names/keywords
   - Searching test content for references to spec concepts
   - Looking at directory structure and naming patterns
4. **Reads discovered test files** - Extract test descriptions (`describe`/`it` blocks)
5. **Returns coverage analysis** - For each scenario: covered or gap

**Subagent Prompt Template:**

```
Analyze test coverage for spec: {spec-path}

1. Read the spec file
2. Extract all testable scenarios (behaviors, examples, error cases, constraints)
3. Find related test files by:
   - Searching for test files matching spec concepts (Glob: **/*.test.ts, **/*.spec.ts)
   - Grepping for spec-related keywords in test files
4. Read the discovered test files
5. For each scenario, determine if it's covered by existing tests

Return a structured analysis:
- Spec file path
- Discovered test file(s)
- List of scenarios with status (covered/gap) and test location if covered
```

Launch subagents in parallel using the Task tool with `subagent_type: "general-purpose"`.

### Step 4: Collect Results

Wait for all subagents to complete. Merge their coverage analyses into a unified report.

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

### specs/core/row-level-security.md
**Test file:** `packages/repositories/src/supabase/rls.test.ts`

| Scenario | Status | Test Location |
|----------|--------|---------------|
| User can only read own data | Covered | rls.test.ts:45 |
| INSERT requires user_id match | Gap | - |

### specs/cli/interactive-mode.md
**Test file:** `src/cli/__tests__/interactive.test.ts`

| Scenario | Status | Test Location |
|----------|--------|---------------|
| ... | ... | ... |
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

- Subagents run in parallel for efficiency
- Each subagent is self-contained (reads spec, finds tests, analyzes)
- Report is saved to the feature folder for use by `/write-tests`
- Feature folder structure: `history/YYMMDD-<feature-name>/`
