# Testing Rules

## Build After Changes
- Always build the solution after making changes to ensure no compilation errors.
- Use `dotnet build` or the IDE's build command.

## Run Relevant Unit Tests
- Run unit tests related to the changes before committing.
- For Contract module changes, run tests in `tests/Unit/Contracts` and any related integration tests.

## Add Contract Tests
- When implementing Contract functionality, add unit tests for:
  - State transitions (e.g., draft -> pending approval -> approved -> executed)
  - Submission logic (validation, business rules)
  - Use case interactions
  - Controller endpoints (if applicable)
- Follow the existing test structure and naming conventions in the Workflow module test projects.

## Test Coverage
- Aim for high test coverage on complex business logic.
- Do not sacrifice readability for coverage; write meaningful tests.

## Mocking
- Use mocking frameworks (e.g., Moq) for dependencies in unit tests.
- Keep mocks simple and focused on the behavior being tested.

## Integration Tests
- For database-related changes, write integration tests that use a test database.
- Ensure tests clean up after themselves to avoid state leakage.
