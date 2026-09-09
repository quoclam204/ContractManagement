# Review Command

## Purpose
Review current changes/diff without modifying files.

## Usage
Use this command to check your changes for architectural violations, correctness, and completeness before committing.

## What It Does
1. Reviews staged changes (git diff --cached)
2. Checks for architecture violations using architecture reviewer principles
3. Examines Contract module specific requirements
4. Validates database/EF Core compatibility
5. Checks for coding convention compliance
6. Reviews test coverage and quality
7. Verifies git commit standards
8. Reports findings without modifying any files

## Review Areas
- **Architecture**: Layer dependencies, module boundaries, dependency direction
- **Contract Module**: Entity correctness, state machine, workflow binding, events
- **Database**: Schema compatibility, EF Core configurations, concurrency handling
- **Coding**: Naming conventions, async/await, dependency injection, controller thinness
- **Testing**: Test presence, quality, coverage for changes made
- **Git**: Conventional commits, unrelated changes, secrets, file modifications

## Output Format
Provides findings classified by severity:
- **CRITICAL**: Will cause build/runtime failure or data loss
- **HIGH**: Will cause incorrect behavior or violate business rules
- **MEDIUM**: Affects maintainability or performance
- **LOW**: Minor issues (naming, refactoring suggestions)
- **INFO**: Informational notes

Each finding includes:
- Severity level
- Clear description
- File location (if applicable)
- Specific recommendation

## Example
Before committing changes to implement a Contract feature:
1. Make your changes
2. Stage them with git add
3. Run this review command
4. Address any HIGH or CRITICAL findings
5. Then proceed to commit

This ensures you maintain architectural integrity and code quality throughout development.
