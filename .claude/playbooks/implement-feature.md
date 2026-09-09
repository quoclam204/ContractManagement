# Feature Implementation Playbook

## Purpose
Standardized process for implementing new features in the ContractManagement project following AI-Driven Development principles.

## Usage
Use this playbook at the start of any new feature work to ensure consistent, high-quality implementation.

## Detailed Steps

### 1. Understand Requirements
- Read the task/issue description carefully
- Identify acceptance criteria and definition of done
- Clarify any ambiguities before proceeding
- Link to the original task/issue in your work

### 2. Run Contract Command (for Contract module features)
- Execute `/contract` command to inspect:
  - Requirements from task description
  - Database schema for Contract tables
  - Workflow module as reference implementation
  - Existing Contract code
  - EF Core configurations and patterns
- Wait for explicit approval before proceeding to coding

### 3. Break Down Work
- Use `/implement-feature` command to break feature into specific tasks
- Each task should be small, testable, and independent
- Identify files that need to be created or modified
- Determine if database changes are needed (check database.sql first)

### 4. Implement Following Patterns
- **Contract module**: Follow Workflow module patterns exactly
- **Domain first**: Start with domain entities and business logic
- **Application next**: Implement DTOs, interfaces, use cases
- **Infrastructure then**: EF Core configurations, repository implementations
- **API last**: Controllers and endpoint implementations
- **Tests alongside**: Write unit tests as you implement each piece

### 5. Coding Standards
- Follow existing code style and conventions
- Use meaningful names for variables, methods, classes
- Keep methods small and focused (single responsibility)
- Write self-documenting code with clear intent
- Add XML documentation for public APIs
- Handle errors appropriately (don't swallow exceptions)
- Avoid hard-coded values (use configuration/constants)
- Follow .NET 9 and C# 12 best practices

### 6. Testing Strategy
- Write unit tests for all new logic
- Test happy path, edge cases, and error conditions
- Mock external dependencies appropriately
- Ensure tests are fast, reliable, and maintainable
- Run tests frequently during implementation
- Aim for high test coverage on complex logic

### 7. Review Process
- Run `/review` command to check for:
  - Architectural compliance
  - Coding standard adherence
  - Database schema compatibility
  - Test coverage and quality
- Address all review findings before proceeding
- Wait for explicit approval on review

### 8. Prepare for Commit
- Ensure solution builds successfully: `dotnet build`
- Run all relevant tests: `/test` command
- Verify no test regressions or new failures
- Check that implementation fully satisfies requirements
- Confirm no TODOs or incomplete implementations remain

### 9. Commit Discipline
- Make small, focused commits
- Use conventional commit messages:
  - `feat(contract): add contract entity`
  - `fix(contract): resolve contract status transition bug`
  - `docs(contract): update contract lifecycle documentation`
  - `refactor(contract): simplify contract validation logic`
  - `test(contract): add unit tests for contract approval`
- Each commit should represent one logical change
- Avoid large commits that bundle unrelated changes
- Do not amend commits that have already been pushed (unless in personal branch)

### 10. Create Pull Request
- Use `/pull-request` playbook to prepare PR
- Ensure all quality gates are met before creating PR
- Follow the pull-request playbook steps exactly

## Quality Gates
Do not proceed to next step unless:
- Step 2: Contract command completed and approved (for Contract features)
- Step 6: All unit tests pass and cover new logic
- Step 7: Review command shows no critical findings and is approved
- Step 8: Solution builds and all relevant tests pass
- Step 9: Commits are small, focused, and use conventional messages

## Contract-Specific Notes
When implementing Contract module features:
- Verify Contract entities match database.sql exactly
- Check that status values follow 0=Draft,1=PendingApproval,2=Approved,3=Signed,4=Active,5=Expiring,6=Renewed,7=Terminated
- Ensure workflow binding follows established patterns from Workflow module
- Validate that Contract module follows same structure as Workflow module
- Confirm architectural principles are not violated
- Check for proper use of DTOs, services, interfaces, and controllers
- Ensure tests cover new Contract functionality
- Look for any database schema incompatibilities
- Verify no unintended changes to other modules

## Important Reminders
- AI-Driven Development means following the process, not skipping steps
- The Contract command exists to prevent architectural violations
- Review is not optional - it ensures quality and consistency
- Small, frequent commits are easier to review and revert if needed
- Testing is an investment that pays off in reduced bugs and regressions
- Documentation helps future developers understand your implementation