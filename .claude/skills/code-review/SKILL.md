# Code Review Skill

This skill reviews changes in the ContractManagement project without modifying files.

## Review Areas

### Architecture
- Check for dependency violations (e.g., Domain referencing Application, Infrastructure, or API)
- Verify correct layer placement of new files
- Identify unnecessary abstractions (e.g., introducing repositories, CQRS, mediators, facades unless justified)
- Detect duplicated functionality (e.g., creating services/entities/interfaces that already exist)

### Contract
- Validate state transitions against the defined status values (0=Draft,1=PendingApproval,2=Approved,3=Signed,4=Active,5=Expiring,6=Renewed,7=Terminated)
- Check for correct workflow binding during submission
- Ensure validation is present where required
- Verify contract lifecycle events are correctly implemented

### EF Core
- Review relationships for correctness (matching foreign keys in database.sql)
- Verify configuration matches table/column names, types, nullability
- Check for missing indexes that exist in the database
- Identify potential concurrency issues (respect RowVersion)
- Look for N+1 query risks
- Ensure no accidental schema changes are introduced via EF Core configurations

### API
- Ensure controllers remain thin (only handle HTTP concerns, delegate to Application layer)
- Validate HTTP status codes are appropriate
- Confirm validation is present (via DTOs or MediatR pipelines)
- Check for consistent DTO usage

### Tests
- Identify missing important test cases (e.g., edge cases, error conditions)
- Check for weak assertions (e.g., only checking not null)
- Detect tests that only verify implementation details rather than behavior

### Git
- Ensure no unrelated changes are included in the commit
- Check for generated files that should not be committed
- Verify no secrets are committed
- Prevent large unnecessary refactors in functional commits

## Finding Classification
- **CRITICAL**: Issues that will cause build failure, runtime failure, or data loss (e.g., dependency violations, missing required fields, incorrect foreign keys)
- **HIGH**: Issues that will cause incorrect behavior or violate business rules (e.g., invalid state transitions, missing validation)
- **MEDIUM**: Issues that affect maintainability or performance (e.g., unnecessary abstractions, potential N+1 queries)
- **LOW**: Minor issues (e.g., naming improvements, minor refactoring suggestions)
- **INFO**: Informational notes (e.g., suggesting reuse of existing abstractions)

## Important
Do not modify files during review. This skill is for identification and reporting only.
