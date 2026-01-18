# Write Spec Skill

When the user invokes `/write-spec [plan-file]` or asks to convert a plan to specs, follow this workflow.

## Purpose

Specs drive Test-Driven Development (TDD). Tests are written against specs, then implementation follows. This ensures:
- Tests verify intended behavior, not implementation details
- Specs serve as the source of truth for what the system should do
- Clear separation between "what" (specs) and "how" (code)

## Arguments

- `plan-file` (optional): Path to plan file. If not provided, use most recent file in `history/`

## Workflow

### Step 1: Identify the Plan

If plan file provided:
- Read the specified file

If no plan file provided:
- Find most recent `.md` file in `history/` (or `history/*/README.md`)
- Confirm with user: "I found `history/YYMMDD-feature.md`. Use this plan?"

### Step 2: Analyze Plan Content

Read the plan and identify concepts that need spec documentation:

**Data Model Changes:**
- New tables or columns
- Changed relationships
- New constraints

**Feature Behaviors:**
- New CLI commands
- Changed workflows
- New user interactions

**System Properties:**
- Security policies
- Performance requirements
- Integration behaviors

### Step 3: Propose Spec Structure

Determine which spec files to create or update:

**Domains:**
- `specs/core/` - Data model, database, security
- `specs/cli/` - Commands, arguments, output formats
- `specs/time-tracking/` - Timer behavior, reports

Present to user:
- "Based on this plan, I'll create/update these specs:"
- List each file with a one-line description
- Ask: "Does this look right, or should I adjust?"

### Step 4: Write Each Spec

For each spec file:

**Data Model Specs** (use table format):
```markdown
# [Entity/Feature] Spec

[One-line overview]

## [Entity Name]

| Field | Type | Notes |
|-------|------|-------|
| field | type | notes |
```

**Feature Specs** (use behavior + examples format):
```markdown
# [Feature Name] Spec

## Overview
[What this feature does - one paragraph]

## Behavior
[Detailed behavior description - what happens, not how]

## Example Interactions
[Terminal examples showing inputs and outputs]
```

**Security/System Specs**:
```markdown
# [Topic] Spec

## Overview
[What this covers]

## Policies
[The rules/constraints]

## Behavior
[How it affects the system]
```

### Step 5: Cross-Reference

Check if other specs need updates:
- Does `data-model.md` need new columns?
- Do command specs reference new behaviors?
- Are there links needed between specs?

Update related specs as needed.

### Step 6: Verify

Checklist:
- [ ] All concepts from the plan are documented
- [ ] Specs are descriptive (what), not prescriptive (how)
- [ ] Tables used for structured data
- [ ] Examples provided for behaviors
- [ ] Cross-references added where relevant

## Output

After completing:
1. New/updated spec files in `specs/`
2. Summary of changes made
3. Any gaps or questions for user

## Example Usage

```
User: /write-spec
Assistant: I found `history/260118-row-level-security.md`. Use this plan?
User: Yes
Assistant: Based on this plan, I'll create/update:
- `specs/core/data-model.md` - Add user_id to all entities
- `specs/core/row-level-security.md` - Document RLS policies

Does this look right?
User: Yes
Assistant: [Creates/updates specs]
Done! Created `row-level-security.md` and updated `data-model.md`.
```

## Spec Conventions

- **Specs drive tests**: Write specs first, then tests against specs, then implementation
- **Be descriptive, not prescriptive**: Specs say what should happen, not how to implement
- **Use tables for data**: Field/Type/Notes format for entities
- **Include examples**: Show concrete terminal interactions (these become test cases)
- **Keep focused**: One concern per spec file
- **Reference related specs**: Link to related documentation
