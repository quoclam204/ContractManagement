# Code Review Skill for reviewing code in the ContractManagement project, focusing on architectural compliance, coding standards, and best practices.

When reviewing code, focus on these key areas:

## 1. Architectural Compliance
- **Clean Architecture Layers**: Verify proper layer separation (API → Application → Domain, Infrastructure → Application/Domain)
- **Domain Isolation**: Ensure Domain layer has ZERO outward dependencies to Application, Infrastructure, or API layers
- **Dependency Flow**: Check that dependencies only flow inward (API depends on Application/Infrastructure, Application depends on Domain, Infrastructure depends on Application/Domain)
- **Modular Monolith Boundaries**: Verify 8 bounded contexts are maintained with proper interface-based communication
- **Contract Module Specific**: When reviewing Contract module work, ensure it follows Workflow module patterns exactly

## 2. Database Fidelity (CRITICAL)
- **database.sql is PERMANENT**: Verify no unauthorized schema changes
- **EF Core Matching**: Ensure configurations match database.sql exactly (table names, columns, types, constraints, indexes)
- **Constraints Preserved**: Check that PKs, FKs, unique constraints, and check constraints are maintained
- **Data Types Correct**: Verify SQL Server to C# type mappings are accurate
- **Concurrency Tokens**: Confirm RowVersion columns are properly configured
- **No Schema Invention**: Ensure no columns, tables, or relationships were invented

## 3. Coding Standards
- **Naming Conventions**: Check PascalCase/camelCase usage, meaningful names
- **Code Structure**: Verify proper organization, method size, single responsibility
- **Comments**: Ensure comments explain why, not what; check for outdated comments
- **Formatting**: Validate consistent indentation, line length, spacing
- **Nullable References**: Ensure proper handling of nullable reference types (CS8600+)

## 4. Contract-Specific Requirements (when applicable)
- **Status Handling**: Verify contract status uses byte type with values 0-7
- **Workflow Binding**: Check ContractTemplateVersion.WorkflowDefinitionId links to workflow
- **Approval Integration**: Validate approval integration via events
- **Lifecycle Events**: Confirm events for each status transition (Created, Submitted, Approved, Signed, Activated, Expired, Renewed, Terminated)
- **Business Logic**: Ensure domain entities contain appropriate business logic and validation
- **DTO Usage**: Verify DTOs are used for data transfer, not direct entity exposure
- **Service Interfaces**: Check that interfaces are properly defined and implemented
- **Controller Thinness**: Verify controllers delegate to Application layer, minimal business logic

## 5. Testing
- **Test Coverage**: Check that new logic is adequately tested
- **Test Naming**: Verify descriptive test names following Method_StateUnderTest_ExpectedBehavior pattern
- **Test Structure**: Ensure Arrange-Act-Assert pattern is followed
- **Mocking**: Verify appropriate use of mocks for external dependencies
- **Assertions**: Check that assertions are meaningful and test outcomes, not implementation details
- **Edge Cases**: Ensure boundary conditions and error paths are tested

## 6. Pull Request Readiness
- **Build Status**: Confirm solution builds successfully (`dotnet build`)
- **Test Passing**: Verify all relevant tests pass (`/test` command)
- **Commit Quality**: Check for conventional commit messages with appropriate scopes
- **Changes Focused**: Ensure changes are focused on single issue/feature
- **No Unrelated Changes**: Verify no unintended changes to other modules or files
- **Documentation**: Check that relevant documentation is updated if needed
- **TODOs/Incomplete Work**: Ensure no TODOs or incomplete implementations remain

## Review Process
1. **Understand Changes**: Review what files were changed and why
2. **Check Build**: Verify `dotnet build` succeeds
3. **Run Tests**: Confirm `/test` command passes for relevant tests
4. **Architectural Scan**: Look for layer violations and dependency issues
5. **Database Check**: For database-related work, verify fidelity to database.sql
6. **Contract Module Scan**: For Contract work, verify Workflow module patterns followed
7. **Coding Standards Review**: Check naming, formatting, comments, structure
8. **Testing Review**: Verify tests exist and are of good quality
9. **Provide Feedback**: Give specific, actionable feedback with file:line references
10. **Determine Readiness**: Decide if changes are ready for commit/PR or need work

## Common Issues to Look For
- Domain layer referencing Infrastructure or API layers
- EF Core configurations not matching database.sql exactly
- Missing or incorrect constraints (especially status 0-7 check constraint)
- Contract entities not matching database.sql column-for-column
- Missing RowVersion concurrency token
- Controllers with business logic that should be in Application layer
- Inconsistent naming or formatting
- Missing tests for new logic
- Poor test names or structure
- TODOs or incomplete implementations
- Unintended changes to other modules
- Commit messages not following conventional format

## Approval Criteria
Code is approved for commit/PR when:
- Build succeeds
- All relevant tests pass
- No critical architectural violations
- Database fidelity verified (if applicable)
- Coding standards followed
- Contract module work follows Workflow patterns (if applicable)
- Adequate test coverage for new logic
- Feedback has been addressed
- Reviewer determines changes are ready

Remember: When in doubt about database schema, **database.sql is PERMANENT source of truth**. Never violate this rule.