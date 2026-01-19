---
name: pr
description: Create a pull request with proper documentation and support for squash merge. Use when user invokes /pr or asks to create a PR.
---

# PR Skill

When the user invokes `/pr` or asks to create a pull request, follow this workflow.

## Purpose

Create well-documented pull requests that:
- Have clear, descriptive titles and summaries
- Reference the feature plan if available
- Support squash merging for clean git history
- Include verification checklists

## Arguments

- `title` (optional): PR title. If not provided, derive from branch name or plan
- `--draft`: Create as draft PR

## Workflow

### Step 1: Verify Branch Status

```bash
git status
git branch --show-current
```

**Checks:**
- Ensure not on `main` branch
- Ensure all changes are committed
- If uncommitted changes exist, ask user if they want to commit first

### Step 2: Find Related Context

Look for context to build PR description:

1. **Feature Plan**: Check `history/YYMMDD-<branch-name>/plan.md`
2. **Commits**: Get all commits since diverging from main
3. **Changed Files**: List modified files

```bash
# Get base branch
git merge-base main HEAD

# Get commits since base
git log main..HEAD --oneline

# Get changed files
git diff main...HEAD --name-only
```

### Step 3: Generate PR Description

Build the PR description with this structure:

```markdown
## Summary

[2-3 bullet points describing the main changes]
- What was added/changed
- Why this change was made
- Any important implementation decisions

## Changes

[List of key changes organized by area]

### [Area 1]
- Change description

### [Area 2]
- Change description

## Testing

[How this was tested]
- [ ] All tests pass (`npm test -- --run`)
- [ ] Manual testing completed
- [ ] [Feature-specific tests]

## Related

- Plan: `history/YYMMDD-feature-name/plan.md` (if exists)
- [Link to related issues/PRs if any]
```

### Step 4: Push Branch

Ensure branch is pushed to remote:

```bash
git push -u origin <branch-name>
```

### Step 5: Create PR

Use GitHub CLI to create the PR:

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<PR description from Step 3>
EOF
)"
```

**Title conventions:**
- Start with verb: Add, Fix, Update, Remove, Refactor
- Be specific but concise
- Example: "Add timer switch functionality with confirmation prompt"

### Step 6: Configure for Squash Merge

After PR is created, inform user:

> PR created! When merging, use **Squash and merge** to maintain clean git history.
>
> The squash commit message should be:
> - Title: The PR title
> - Body: A clean summary (GitHub will pre-fill from PR description)

### Step 7: Report

Provide the user with:
- PR URL
- PR number
- Reminder about squash merge

## Merge Conventions

When PRs are merged:

1. **Always use Squash and merge** - combines all commits into one
2. **Clean up commit message** - remove "Co-Authored-By" lines from squash message body
3. **Delete branch after merge** - GitHub can do this automatically

## Example Usage

```
User: /pr
Assistant: I'll create a PR for the current branch.

Current branch: `add-timer-switch`
Commits since main: 5 commits
Related plan: `history/260115-timer-switch/plan.md`

Creating PR with title: "Add timer switch functionality with confirmation prompt"

[Creates PR]

Done! PR #42 created: https://github.com/user/repo/pull/42

When merging, use **Squash and merge** to keep a clean git history.
```

```
User: /pr "Fix authentication timeout bug"
Assistant: I'll create a PR with that title.

[Follows workflow with provided title]
```

## Tips

- **Good PR titles** are imperative and specific: "Add X", not "Added X" or "Adding X"
- **Keep PRs focused** - one feature/fix per PR makes review easier
- **Reference the plan** - helps reviewers understand context
- **Squash merging** keeps main history clean - one commit per feature
