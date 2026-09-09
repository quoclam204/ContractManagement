# Git Rules

## No Destructive Operations
- Do not reset, rebase, force-push, or delete branches automatically.
- Such operations can rewrite history and cause data loss for collaborators.

## Small Conventional Commits
- Make small, focused commits that do one thing.
- Use conventional commit messages (e.g., `feat(contract): add contract entity`, `fix(workflow): correct state transition`).

## No Secrets
- Do not commit secrets such as connection strings, passwords, or API keys.
- Use environment variables or secret management tools for sensitive data.

## Do Not Modify Unrelated Files
- Only modify files that are directly related to the current task.
- Avoid formatting changes or unrelated refactors in the same commit as functional changes.

## Commit Discipline
- Ensure tests pass and build succeeds before committing.
- Pull latest changes before pushing to avoid unnecessary merge conflicts.
