# Bug Fix Playbook

## Purpose
Standardized process for diagnosing, fixing, and verifying bugs in the ContractManagement project while maintaining architectural integrity.

## Usage
Use this playbook when you need to fix a bug in any part of the system.

## Detailed Steps

### 1. Reproduce and Understand the Bug
- Clearly define the bug symptoms and steps to reproduce
- Gather error messages, logs, and screenshots if applicable
- Determine the scope and impact of the bug
- Check if similar issues have been reported before
- Write a failing test that reproduces the bug (if possible)

### 2. Isolate the Problem
- Use debugging tools to trace the issue
- Check logs for relevant information
- Determine which layer/module the bug originates in:
  - API layer (controllers, middleware)
  - Application layer (use cases, validation)
  - Domain layer (entities, business logic)
  - Infrastructure layer (EF Core, external services)
  - Database (schema, data, constraints)
- For Contract module bugs, consider if it's related to:
  - Contract lifecycle/state transitions
  - Workflow binding or approval integration
  - Database mapping or constraints
  - Data validation or business rules

### 3. Consult Relevant Documentation
- Check architecture documentation for layer responsibilities
- Review database.sql for schema expectations
- Look at existing tests for similar functionality
- Examine the Workflow module for reference patterns (if Contract-related)
- Review any relevant RFCs, design documents, or comments

### 4. Diagnose the Root Cause
- Identify the exact source of the bug:
  - Incorrect business logic
  - Database mapping mismatch
  - Missing validation
  - Exception handling issues
  - Race conditions or concurrency problems
  - Configuration or environment issues
  - Third-party library or framework issues
- For database-related bugs:
  - Verify EF Core configuration matches database.sql
  - Check for missing or incorrect constraints
  - Validate data types and nullability
  - Review index usage and query performance
- For Contract module bugs:
  - Validate status transitions (0-7) follow business rules
  - Check workflow binding from template versions
  - Verify approval integration points
  - Ensure lifecycle events are fired correctly

### 5. Plan the Fix
- Determine the minimal change needed to fix the bug
- Consider if the fix affects multiple layers/modules
- Evaluate potential side effects or regressions
- Ensure the fix follows established patterns:
  - Contract module: Follow Workflow module patterns
  - Database: Maintain fidelity to database.sql
  - Architecture: Preserve layer separation
- Write additional tests to verify the fix works correctly
- Update existing tests if they were testing incorrect behavior

### 6. Implement the Fix
- Make the smallest possible change that resolves the issue
- Follow coding conventions and existing code style
- Maintain consistency with surrounding code
- For Contract module fixes:
  - Ensure entities still match database.sql exactly
  - Preserve workflow binding patterns
  - Maintain proper status transition logic
  - Keep architectural layer separation intact
- For database-related fixes:
  - Never change database.sql without explicit approval
  - Only fix EF Core configurations to match database.sql
  - Do not add shadow properties or unmapped columns
  - Preserve all existing constraints and indexes
- Add comments explaining non-obvious fixes
- Update XML documentation if needed

### 7. Test the Fix Thoroughly
- Run the failing test from step 1 - it should now pass
- Write additional tests to cover edge cases
- Run related unit tests to ensure no regressions
- Run integration tests if database or external services involved
- For Contract module fixes:
  - Test all status transitions (0-7) still work correctly
  - Verify workflow binding and approval integration
  - Check contract lifecycle events fire appropriately
  - Test validation rules and business logic
- Run full test suite for the affected module
- Verify the fix doesn't break existing functionality

### 8. Review Process
- Run `/review` command to check:
  - Architectural compliance (especially for Contract module)
  - Database schema fidelity (if DB-related)
  - Coding standard adherence
  - Test coverage and quality
  - That the fix actually addresses the root cause
- Address all review findings before considering work complete
- Wait for explicit approval on review output

### 9. Prepare for Commit
- Ensure solution builds successfully: `dotnet build`
- Run all relevant tests: `/test` command
- Verify the original bug is fixed and no regressions exist
- Check that implementation follows established patterns
- Confirm no unnecessary changes were made

### 10. Commit Discipline
- Make focused commits that isolate the fix
- Use conventional commit messages:
  - `fix(contract): resolve contract status transition infinite loop`
  - `fix(database): correct EF Core mapping for contract value precision`
  - `fix(api): handle null contract template version in controller`
  - `fix(workflow): correct approval step decision mapping`
- Each commit should represent one logical change (the fix + tests)
- Reference the issue/bug number in commit messages if available
- Do not amend commits that have already been pushed (unless in personal branch)

### 11. Create Pull Request
- Use `/pull-request` playbook to prepare PR
- Ensure all quality gates are met before creating PR
- Be prepared to explain the root cause and fix clearly

## Quality Gates
Do not proceed to next step unless:
- Step 2: Problem is isolated and root cause identified
- Step 5: Fix is planned and follows established patterns
- Step 7: Fix is tested thoroughly and related tests pass
- Step 8: Review shows no critical findings and is approved
- Step 9: Solution builds and all relevant tests pass
- Step 10: Commits are focused and use conventional messages

## Contract-Specific Bug Fix Guidelines
When fixing Contract module bugs:
- Verify Contract entities still match database.sql exactly
- Check that status values remain 0-7 with correct semantics
- Ensure workflow binding from template versions is preserved
- Confirm approval integration points still function
- Validate that lifecycle events are still fired correctly
- Look for database mapping issues (most common source of bugs)
- Check for missing validation on contract properties
- Verify state transition logic follows business rules
- Ensure architectural layer separation is maintained
- Confirm Domain layer still has zero outward dependencies
- Check that DTOs, services, controllers follow established patterns

## Database-Related Bug Fix Rules
These rules are PERMANENT for database-related fixes:
1. **database.sql is PERMANENT source of truth** - never change it without approval
2. **Only fix EF Core configurations** to match database.sql
3. **Do not add shadow properties** for audit fields or computed values
4. **Do not remove existing constraints** or indexes without approval
5. **Preserve all data types** exactly as defined in database.sql
6. **Maintain primary key and foreign key relationships**
7. **Keep unique constraints** and check constraints intact
8. **Preserve RowVersion columns** for optimistic concurrency
9. **Do not invent new tables, columns, or relationships**
10. **Ensure configurations match database.sql exactly** after fix

## Important Reminders
- Diagnose before fixing - jumping to solutions often creates more bugs
- The Contract command helps ensure you follow patterns for Contract bugs
- database.sql is PERMANENT - this is your anchor for database work
- Small, focused fixes are easier to verify and less likely to cause regressions
- Tests are your safety net - write them before and after fixing
- Review protects architectural integrity - don't skip it
- Document assumptions and non-obvious fixes for future maintainers