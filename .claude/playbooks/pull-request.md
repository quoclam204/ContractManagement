# Pull Request Playbook

## Purpose
Workflow for preparing a clean PR.

## Usage
Use this playbook when preparing a pull request for review in the ContractManagement project.

## Detailed Steps

### 1. Ensure Work is Complete
- Verify all requirements from the task/issue are met
- Confirm acceptance criteria are satisfied
- Check that the implementation is complete and correct
- Ensure no TODOs or incomplete implementations remain
- Verify the solution addresses the original problem completely

### 2. Local Validation
- Build the solution: `dotnet build` (must succeed)
- Run all relevant tests: use `test` command
- Verify no test regressions
- Confirm new functionality works as expected
- Test edge cases and error conditions
- Ensure performance is acceptable (if applicable)
- Do not proceed if build fails or tests fail

### 3. Inspect Changes
- Run `git diff --stat` to see what files changed
- Examine `git diff` to review all changes line by line
- Verify only expected files were modified
- Check for unintended changes or side effects
- Ensure no unrelated refactoring or formatting changes were included
- Confirm changes are focused on the specific task/issue

### 4. Commit Discipline
- Ensure commits are small and focused
- Use conventional commit messages (e.g., `feat(contract): add contract entity`)
- Each commit should represent one logical change
- Avoid large commits that bundle unrelated changes
- Do not amend commits that have already been pushed (unless in a personal branch)
- Squash commits if necessary before creating PR (follow team conventions)

### 5. Final Review
- Perform a final self-review of the changes
- Check for:
  - Correctness and completeness
  - Adherence to coding conventions
  - Architectural compliance
  - Database schema compatibility (if applicable)
  - Proper test coverage
  - Clear and concise code
  - Proper error handling
  - No hard-coded values or secrets
  - Proper logging (if applicable)
  - Follow existing patterns (especially Workflow module as reference)

### 6. Prepare PR Description
- Write a clear, descriptive title
- Provide context in the description:
  - What problem is being solved
  - How it was solved (briefly)
  - What files were changed
  - Any important notes or considerations
- Link to the original task/issue if applicable
- Mention any relevant testing performed
- Note if this is a breaking change (should be rare)
- Include screenshots if applicable (for UI changes)

### 7. Request Review
- Assign appropriate reviewers
- Follow team PR review conventions
- Be prepared to answer questions and make changes based on feedback
- Do not merge until approved by required reviewers
- Address all review comments before merging

### 8. Post-Merge (if applicable)
- After PR is merged, delete the feature branch (if appropriate)
- Pull latest changes to stay up to date
- Continue with next task

## Quality Gates
Do not create PR unless:
- Step 2: Build succeeds and all tests pass
- Step 3: Git diff shows only expected, intentional changes
- Step 5: Final review confirms quality and correctness
- Step 6: PR description is clear and complete
- You are ready to respond to review feedback

## Contract-Specific PR Notes
When creating PRs for Contract module changes:
- Verify Contract entities match database.sql exactly
- Check that status values follow 0=Draft,1=PendingApproval,2=Approved,3=Signed,4=Active,5=Expiring,6=Renewed,7=Terminated
- Ensure workflow binding follows established patterns
- Validate that Contract module follows same structure as Workflow module
- Confirm architectural principles are not violated
- Check for proper use of DTOs, services, interfaces, and controllers
- Ensure tests cover new Contract functionality
- Look for any database schema incompatibilities
- Verify no unintended changes to other modules

## Important Reminders
- A clean PR makes review faster and easier
- Focus on one logical change per PR
- Large PRs are harder to review and more likely to contain errors
- Be responsive to review feedback
- Do not take review comments personally - they improve code quality
- The goal is to merge correct, well-reviewed code that maintains project quality