# Review Command

## Purpose
Review code for architectural compliance, coding standards, database fidelity, and overall quality before committing.

## Usage
Use this command before creating a commit or pull request to ensure your changes meet project standards and follow established patterns.

## What It Does
1. Runs `dotnet build` to ensure solution compiles
2. Checks for architectural compliance:
   - Clean Architecture layer separation
   - Modular Monolith boundary integrity
   - Domain layer isolation (zero outward dependencies)
   - Proper dependency flow
3. Verifies coding standards adherence:
   - Naming conventions
   - Code structure and organization
   - Comment quality
   - Formatting consistency
4. Validates database fidelity (especially for Contract module):
   - EF Core configurations match database.sql exactly
   - No schema invention or unauthorized changes
   - Constraints and indexes preserved
   - Data types and nullability correct
5. For Contract module work:
   - Checks adherence to Workflow module reference patterns
   - Verifies Contract module responsibilities from 02_Task_Nguoi2_Contract.md
   - Ensures proper status handling (0-7 values)
   - Validates workflow binding and approval integration
   - Confirms lifecycle events are implemented correctly
6. Reviews test coverage and quality:
   - Checks that new logic is tested
   - Verifies test naming and structure
   - Looks for appropriate use of mocks
   - Ensures tests follow Arrange-Act-Assert pattern
7. Examines changes for correctness:
   - Verifies implementation matches requirements
   - Checks for TODOs or incomplete implementations
   - Looks for error handling and edge case handling
8. Provides specific, actionable feedback for improvement

## Output
Provides:
- Build status (success/failure with errors if any)
- Architectural compliance report
- Coding standards adherence report
- Database fidelity check (Contract module specific if applicable)
- Contract module specific review (if applicable)
- Test coverage and quality assessment
- Specific findings with file:line references
- Clear pass/fail status with recommendations
- List of any issues that need to be addressed before proceeding

## Example
Before committing Contract feature work:
1. Run this review command
2. Review the output showing:
   - Build success/failure status
   - Architectural compliance (any layer violations?)
   - Coding standards (naming, formatting, etc.)
   - Database fidelity (do entities match database.sql?)
   - Contract module specific (following Workflow patterns? proper status handling?)
   - Test coverage (is new logic tested?)
   - Specific findings: e.g., "Domain layer has outward dependency to Infrastructure at ContractManagement.Domain.Entities.Contract:25"
3. Address all findings before proceeding
4. Run review command again to verify fixes
5. Once review passes, proceed with commit and pull request preparation

## Contract-Specific Review Focus
When reviewing Contract module work, pay special attention to:
- Entity properties matching database.sql column-for-column
- Status values using correct byte type and 0-7 range
- Foreign key relationships matching database.sql exactly
- Indexes matching database.sql exactly
- Constraints (PK, FK, unique, check) preserved
- RowVersion concurrency token implemented
- Workflow binding from ContractTemplateVersion.WorkflowDefinitionId
- Approval integration via events
- Lifecycle events for each status transition
- Following Workflow module patterns exactly in structure and naming
- Architectural layer separation maintained
- Domain layer has zero outward dependencies
- Proper use of DTOs, services, interfaces, and controllers

## Enforcement
This command helps enforce:
- Architectural integrity of the Clean Architecture and Modular Monolith
- Fidelity to the permanent database.sql schema
- Adherence to established patterns (especially Workflow as reference)
- Code quality and maintainability
- Test coverage and reliability
- Readiness for pull request submission

## Important Notes
- This command does NOT modify any files - it only reads and analyzes
- Always run this command before creating commits or pull requests
- Address ALL findings before considering work complete
- For Contract module work, this is especially critical due to database permanence
- Use findings to improve code quality and maintain architectural integrity
- Review is not optional - it's a quality gate that protects the project