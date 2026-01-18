# Start Feature Skill

When the user invokes `/start-feature [feature-name]` or asks to start a new feature, follow this workflow.

## Arguments

- `feature-name`: Short kebab-case name for the feature (e.g., `user-auth`, `export-csv`)

## Workflow

### Step 1: Get Feature Name

If no feature name provided, ask the user:
- "What's a short name for this feature? (kebab-case, e.g., `user-auth`)"

### Step 2: Create Feature Branch

```bash
git checkout main
git pull
git checkout -b <feature-name>
```

If branch already exists, ask user whether to:
- Switch to existing branch
- Create a new branch with different name

### Step 3: Gather Requirements

Ask clarifying questions to understand the feature:

**Core Questions:**
- What is the main goal/outcome of this feature?
- What is the expected input/output?
- How should errors be handled?

**Scope Questions:**
- Does this need CLI commands, or just core logic?
- Are there any UI/UX preferences?
- How does this interact with existing features?

**Edge Cases:**
- What edge cases should we handle?
- Are there performance requirements?
- Any security considerations?

Keep asking until requirements are clear. Don't assume - clarify.

### Step 4: Create Plan File

Determine plan structure based on complexity:

**Small feature** (single concern, <5 files affected):
- Create `history/YYMMDD-<feature-name>.md`

**Large feature** (multiple concerns, >5 files):
- Create `history/YYMMDD-<feature-name>/README.md`
- Add additional files as needed (e.g., `auth.md`, `testing.md`)

Use today's date in YYMMDD format.

### Step 5: Write the Plan

The plan should include:

```markdown
# Feature: <Feature Name>

## Goal
[One sentence describing the outcome]

## Requirements
- [Requirement 1]
- [Requirement 2]
- ...

## Design Decisions
- [Decision 1 and rationale]
- [Decision 2 and rationale]

## Implementation Steps
1. [ ] Step 1 - [description]
2. [ ] Step 2 - [description]
...

## Files to Create/Modify
- `path/to/file.ts` - [what changes]

## Testing Strategy
- [How to test this feature]

## Verification Checklist
- [ ] All tests pass
- [ ] Feature works as expected
- [ ] Documentation updated (if needed)
- [ ] No regressions introduced
```

### Step 6: Get Approval

Present the plan to the user and ask:
- "Does this plan look good? Any changes needed?"

Wait for explicit approval before proceeding to implementation.

### Step 7: Commit the Plan

```bash
git add history/
git commit -m "Plan: <feature-name>"
```

## Output

After completing the workflow:
1. User is on the feature branch
2. Plan file exists in `history/`
3. Plan is committed
4. Ready to start implementation

## Example Usage

```
User: /start-feature user-preferences
Assistant: I'll help you start the user-preferences feature...
[Follows workflow above]
```

## Notes

- Keep plans focused and <100 lines per file
- For large features, split by concern
- Always get user approval before implementation
- Reference `/specs/` for existing architecture decisions
