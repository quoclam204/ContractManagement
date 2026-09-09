# Test Command

## Purpose
Run appropriate build and tests and report failures.

## Usage
Use this command to verify that your changes don't break existing functionality and that new code works correctly.

## What It Does
1. Runs `dotnet build` to ensure solution compiles
2. Executes relevant unit tests based on what was changed
3. Runs integration tests for database-related changes
4. Checks test results and reports failures
5. Provides clear pass/fail status
6. Does not modify any files

## Test Selection Logic
- If Contract module files changed: runs Contract unit tests
- If Workflow module files changed: runs Workflow unit tests
- If Database/EF Core changes: runs database-integration tests
- If API/Controller changes: runs relevant API tests
- If Architecture rules potentially affected: runs architecture tests
- Runs ALL tests if scope is unclear or wide-ranging

## Specific Test Paths
- Unit tests: `tests/ContractManagement.UnitTests/`
- Integration tests: `tests/ContractManagement.IntegrationTests/`
- Contract tests: `tests/ContractManagement.UnitTests/Contracts/` (when exist)
- Workflow tests: `tests/ContractManagement.UnitTests/Workflow/`

## Output
Provides:
- Build status (success/failure with errors if any)
- Test run summary (passed/failed/skipped counts)
- List of any failed tests with error messages
- Overall pass/fail status
- Recommendations for next steps

## Example
After implementing a Contract feature:
1. Build the solution: `dotnet build`
2. Run this test command
3. If all pass, proceed to review and commit
4. If any fail, fix them before proceeding

This ensures you maintain a green build and test suite throughout development.