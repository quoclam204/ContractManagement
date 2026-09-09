# Git Rules

## Branching Strategy

### Main Branches
- **main**: Production-ready code only
  - Direct commits to main are prohibited
  - Only updated via pull requests from feature branches
  - Represents what is currently in production
  
- **develop** (optional): Integration branch for features
  - If used, represents latest integrated development work
  - Updated via pull requests from feature branches
  - Used as base for feature branches in some workflows
  - If not used, feature branches branch directly from main

### Feature Branches
- **Naming**: `feature/`, `bugfix/`, `hotfix/`, `release/`, `docs/`
- **Examples**: 
  - `feature/contract-entity-implementation`
  - `bugfix/contract-status-transition-fix`
  - `hotfix/production-db-connection-issue`
  - `release/v1.2.0`
  - `docs/api-documentation-update`
- **Lifecycle**: 
  - Branch from main (or develop if used)
  - Work on specific issue/feature
  - Submit pull request to main (or develop if used)
  - Delete branch after merge (unless preserving for specific reason)
- **Duration**: Should be short-lived (days, not weeks)

### Commit Rules

#### Commit Frequency
- Commit early, commit often
- Each commit should represent one logical change
- Avoid large commits that bundle unrelated changes
- If a commit touches multiple unrelated areas, consider splitting

#### Commit Message Format (Conventional Commits)
```
<type>(<scope>): <short description>
 
<optional body>
 
<optional footer>
```

##### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect meaning (whitespace, formatting, missing semi-colons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process or auxiliary tools/libraries
- `revert`: Reverts a previous commit

##### Scope
- Optional; specifies part of codebase affected
- Examples: `contract`, `workflow`, `api`, `database`, `contract-type`
- Use parentheses: `feat(contract): add contract entity`
- If no scope applies, omit parentheses: `fix: resolve null reference exception`

##### Description
- Short description in imperative mood ("add" not "added")
- Max 50 characters for subject line
- Be specific and descriptive
- Examples: "add contract entity", "fix contract status transition logic", "add unit tests for contract validation"

##### Body
- Optional; provides detailed explanation
- Wrap at 72 characters
- Explain the what and why, not the how
- Include motivation for change and contrast with previous behavior

##### Footer
- Optional; for referencing issues and breaking changes
- Reference issues: `Fixes #123`, `Related to #456`
- Breaking changes: Start with `BREAKING CHANGE:` followed by description
- Multiple footers separated by blank line

#### Commit Examples
```
feat(contract): add contract entity
 
Add Contract entity matching database.sql exactly.
Includes all properties: Id, ContractNumber, ContractTypeId, TemplateVersionUsedId,
PartnerId, OwnerId, Title, Value, SignedDate, EffectiveDate, ExpiryDate, Status,
FileUrl, ParentContractId, CreatedAt, UpdatedAt, RowVersion.
 
Implements basic validation and domain events for lifecycle transitions.
```

```
fix(contract): resolve contract status transition infinite loop
 
Fix infinite loop in Contract domain service when attempting to transition
from Approved to Approved status. Added guard clause to prevent processing
when status is already the target status.
 
Prevents unnecessary processing and potential stack overflow in recursive
scenarios.
 
Closes #123
```

```
docs(contract): update contract lifecycle documentation
 
Update CONTRACT.md document with detailed contract lifecycle information.
Include status transition diagram and business rules for each transition.
 
References task 02_Task_Nguoi2_Contract.md for detailed requirements.
```

```
refactor(workflow): simplify approval step validation
 
Extract approval step validation logic into separate private method.
Improve readability and enable unit testing of validation logic independently.
 
No functional changes intended.
```

```
test(contract): add unit tests for contract approval validation
 
Add comprehensive unit tests for ContractDomainService approval validation.
Test all status transitions and edge cases.
 
Includes tests for valid transitions, invalid transitions, and boundary cases.
 
Coverage increase: +15% for Contract domain services.
```

#### Commit Best Practices
- Make commits atomic and focused
- Separate whitespace/format changes from functional changes
- Don't commit commented-out code or debugging statements
- Test before committing (run local build and tests)
- Write commit message before staging changes to ensure accuracy
- Use `git add -p` to stage changes interactively when needed
- Avoid `git commit -a` when possible; be explicit about what's included
- Sign commits when required by policy (`-s` flag)

## Merge Strategies

### Preferred: Squash and Merge
- Squash all commits from feature branch into single commit on main
- Keeps main history clean and readable
- Each main commit represents one feature/fix
- Commit message becomes the PR title/description
- Use when feature branch has multiple intermediate commits

### Alternative: Merge Commit
- Create explicit merge commit preserving feature branch history
- Maintains detailed history of feature development
- Use when feature branch represents significant work with valuable intermediate steps
- Requires careful branch hygiene to avoid cluttering main

### Avoid: Rebasing Main
- Do not rebase main or other shared branches
- Rebasing shared branches rewrites public history
- Causes confusion and potential data loss for other developers
- Only rebase private feature branches that haven't been shared

## Tagging and Releases

### Tag Format
- Use semantic versioning: `vMAJOR.MINOR.PATCH`
- Examples: `v1.0.0`, `v1.2.3`, `v2.0.0-rc1`
- Tags are immutable; do not move or delete published tags

### Release Process
1. Complete all features for release in feature branches
2. Submit and approve pull requests to main
3. Ensure main passes all tests and builds
4. Create release branch from main if needed for stabilization
5. Run final testing on release candidate
6. Tag release commit with appropriate version
7. Deploy tag to appropriate environment
8. Document release notes

## Repository Hygiene

### Clean Working Directory
- Commit or stash changes before switching branches
- Avoid accumulating unused branches
- Delete feature branches after merge (unless specifically preserved)
- Keep remote tracking branches pruned

### Ignored Files
- Maintain comprehensive `.gitignore` file
- Ignore build artifacts, temporary files, IDE settings
- Ignore user-specific files (`*.user`, `.vs/`, `.vscode/`)
- Ignore package directories (`bin/`, `obj/`, `node_modules/`)
- Ignore logs and test results
- Ignore sensitive files (`appsettings.*.json`, `.env`, `*.pfx`, `*.p12`)
- Never commit secrets or sensitive data

### Large Files
- Use Git LFS for large binary files when necessary
- Consider alternative storage for very large files
- Avoid committing large files that bloat repository

## Contract-Specific Git Rules

### Database Files
- **NEVER** commit database.sql changes without explicit approval
- **NEVER** commit migration files without explicit approval
- Database.sql is PERMANENT source of truth - treat it as such
- If database changes are approved, follow strict process:
  1. Update database.sql with approved changes
  2. Update EF Core configurations to match exactly
  3. Commit both changes together in same commit
  4. Include clear justification in commit message
  5. Ensure commit passes all tests and review

### Contract Module Work
- For Contract module work, ALWAYS start with `/contract` command
- Wait for explicit approval before creating feature branch
- Ensure work follows Workflow module patterns exactly
- Verify database fidelity to database.sql before committing
- Run `/test` command before committing
- Run `/review` command before creating pull request
- Use conventional commits with appropriate scope (e.g., `feat(contract):`, `fix(contract):`)
- Keep commits focused on single logical change
- Do not amend commits that have been pushed (unless in personal branch)
- Squash commits if necessary before creating PR (follow team conventions)

### Workflow Module Reference
- When implementing Contract module features, treat Workflow module as reference
- Do not modify Workflow module unless fixing bugs
- If extending Workflow module functionality, follow same patterns
- Ensure Contract module implementations mirror Workflow module structure
- Maintain consistency in naming conventions and patterns

### Pull Request Requirements
Before creating pull request:
1. Solution builds successfully: `dotnet build`
2. All relevant tests pass: `/test` command
3. No test regressions introduced
4. Commit history is clean and uses conventional commits
5. Changes are focused on single issue/feature
6. No unrelated refactoring or formatting changes included
7. Ready to respond to review feedback
8. For Contract module: `/contract` command was run and approved
9. For Contract module: Workflow module patterns followed exactly
10. For Contract module: Database fidelity to database.sql verified

## Enforcement
These git rules are enforced through:
- Pull request checks and reviews
- Build and test validation in CI/CD
- Team adherence to branching and commit conventions
- Automated checks where possible (commit message validation, etc.)
- Code review process (`/review` command)
- Contract-specific checks via `/contract` command

## Common Git Commands Reference

### Daily Workflow
```bash
# Start work on new feature
git checkout main
git pull origin main
git checkout -b feature/contract-entity-implementation

# Make changes
# ... edit files ...

# Stage changes
git add ContractManagement.Domain/Entities/Contract.cs
git add ContractManagement.Application/Features/Contracts/CreateContractHandler.cs

# Commit with conventional message
git commit -m "feat(contract): add contract entity
 
Add Contract entity matching database.sql exactly."

# Push to remote
git push origin feature/contract-entity-implementation

# Create pull request via GitHub/GitLab/UI
```

### Before Committing
```bash
# Check what would be committed
git diff --staged

# See uncommitted changes
git diff

# Check build
dotnet build

# Run tests
dotnet test
```

### Before Creating PR
```bash
# Ensure branch is up to date with main
git checkout main
git pull origin main
git checkout feature/contract-entity-implementation
git rebase main  # or merge main, depending on team preference

# Squash commits if needed (interactive rebase)
git rebase -i main
# Mark commits as "fixup" or "squash" as appropriate

# Final checks
dotnet build
dotnet test
# Run /review command
# Run /contract command (for Contract module work)
```

### After PR Approval
```bash
# Merge via GitHub/GitLab/UI (typically squash and merge)
# Delete feature branch
git branch -d feature/contract-entity-implementation
git push origin --delete feature/contract-entity-implementation

# Or delete after merge via platform
```

### Emergency Fixes (Hotfix)
```bash
# For critical production issues
git checkout main
git pull origin main
git checkout -b hotfix/production-issue-fix
# ... make fix ...
git commit -m "fix(contract): resolve production deadlock in contract approval"
git push origin hotfix/production-issue-fix
# Create pull request for review
# After approval and merge:
git checkout main
git pull origin main
git branch -d hotfix/production-issue-fix
git push origin --delete hotfix/production-issue-fix
```

## Important Reminders
- **Branching is cheap; use it liberally for isolation**
- **Commits are permanent; make them meaningful**
- **Branches should be short-lived and focused**
- **Main branch is sacred; protect it with pull requests and reviews**
- **Database.sql is PERMANENT; never change it without explicit approval**
- **For Contract module work: `/contract` command is mandatory first step**
- **Conventional commits make history readable and useful**
- **Pull requests are for review, not just a merge mechanism**
- **Delete feature branches after merge to keep repository clean**
- **Never force push to shared branches (main, develop)**
- **Test before you commit; build before you push**