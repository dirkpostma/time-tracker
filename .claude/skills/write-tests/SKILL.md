---
name: write-tests
description: Write tests for identified coverage gaps. Use when user invokes /write-tests or asks to write tests for spec gaps.
---

# Write Tests Skill

When the user invokes `/write-tests [coverage-report]` or asks to write tests for coverage gaps, follow this workflow.

## Purpose

Writes tests to fill gaps identified by `/test-coverage`. Uses Task tool with subagents for parallel test writing when multiple gaps exist.

## Arguments

- `feature-folder` (optional): Path to feature folder (e.g., `history/260118-row-level-security/`). If omitted, uses most recent folder in `history/`.
- `spec-path` (optional): Write tests for specific spec only.

## Workflow

### Step 1: Load Coverage Report

If feature folder provided:
- Read `{feature-folder}/test-coverage.md`

If no feature folder provided:
- Find most recent folder in `history/` (by date prefix YYMMDD)
- Confirm with user: "I found `history/260118-row-level-security/`. Use this folder?"
- Read `{feature-folder}/test-coverage.md`

If no coverage report exists in the folder:
- Suggest: "No coverage report found. Run `/test-coverage` first?"

### Step 2: Parse Gap Analysis

Extract from the coverage report:
- List of specs with gaps
- For each spec: the scenarios marked as "Gap"
- The target test file for each spec

If `spec-path` argument provided:
- Filter to only gaps for that spec

### Step 3: Group Gaps by Test File

Organize gaps by target test file:

```
test-file-1.test.ts:
  - Gap 1 from spec A
  - Gap 2 from spec A

test-file-2.test.ts:
  - Gap 1 from spec B
```

### Step 4: Launch Writing Subagents

For each test file with gaps, launch a Task subagent (in parallel) with:

**Subagent Prompt Template:**

```
Write tests to fill coverage gaps in: {test-file-path}

Context:
- Spec file: {spec-path}
- Read the spec sections relevant to these gaps

Gaps to cover:
{list of gap scenarios}

Instructions:
1. Read the existing test file to understand patterns and style
2. Read the spec file for detailed requirements
3. Write tests for each gap scenario
4. Follow these conventions:
   - NEVER hardcode secrets - use process.env.VAR_NAME for API keys, passwords, tokens
   - Reference spec in comments: // See specs/path.md: "scenario description"
   - Match exact error messages from spec examples
   - Follow existing patterns in the test file
   - Use proper mocking and cleanup
5. Add tests to the existing test file (don't create new files unless necessary)
6. If new env vars are needed, add them to .env.example

Return the tests you wrote and where you added them.
```

Launch subagents in parallel using the Task tool with `subagent_type: "general-purpose"`.

### Step 5: Collect Results

Wait for all subagents to complete. Collect:
- Tests written
- Files modified
- Any issues encountered

### Step 6: Verify

Run the test suite to validate all tests pass:

```bash
npm test -- --run
```

If tests fail:
- Report which tests failed
- Ask user how to proceed

### Step 7: Report

Show user:
1. Summary of tests written
2. Files modified
3. Test results (pass/fail)

## Key Conventions

When writing tests, subagents must follow:

- **NEVER hardcode secrets**: Always use `process.env.VAR_NAME` for API keys, passwords, tokens. Check `.env.example` for available vars and add new ones if needed.
- **Reference specs in comments**: `// See specs/cli/interactive-mode.md: "When timer IS running"`
- **Match exact error messages**: Use the same messages shown in spec examples
- **Follow existing patterns**: Match describe/it structure, setup/teardown, mocking
- **Proper cleanup**: Reset state between tests
- **Create new test file only when**: No suitable file exists for the spec

## Example Usage

```
User: /write-tests
Assistant: I found `history/260118-row-level-security/`. Use this folder?
User: Yes
Assistant: Reading coverage report from `history/260118-row-level-security/test-coverage.md`...
I'll write tests for 7 identified gaps...
[Groups gaps, launches subagents, collects results]

Wrote tests for:
- specs/core/row-level-security.md (2 tests)
- specs/cli/interactive-mode.md (5 tests)

Running tests...
All tests pass!

Modified files:
- packages/repositories/src/supabase/rls.test.ts
- src/cli/__tests__/interactive.test.ts
```

```
User: /write-tests --spec-path specs/core/row-level-security.md
Assistant: I found `history/260118-row-level-security/`. Use this folder?
User: Yes
Assistant: Writing tests for RLS gaps only...
[Writes tests for 2 RLS gaps]
Done! Added 2 tests to rls.test.ts. All tests pass.
```

## Notes

- Subagents run in parallel for efficiency
- Each subagent handles one test file
- Tests follow TDD conventions (exact error messages, proper mocking)
- Always verify tests pass before reporting success
- Coverage report is read from feature folder: `history/YYMMDD-<feature-name>/test-coverage.md`
- Run `/test-coverage` again after to verify gaps are filled
