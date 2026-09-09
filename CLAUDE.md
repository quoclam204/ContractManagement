# ContractManagement Project Guidance

## Project
- ContractManagement
- Clean Architecture / Modular Monolith
- ASP.NET Core / C# / EF Core / SQL Server / MediatR

## Dependency Direction
- API → Application → Domain
- Infrastructure → Application / Domain
- Domain must NEVER depend on Application, Infrastructure, or API.

## Reference Implementation
The Workflow module is the primary reference implementation for Clean Architecture patterns.
Before implementing a new feature:
- inspect the corresponding Workflow implementation
- follow existing naming and folder conventions
- reuse existing abstractions where appropriate
- do not introduce a competing architecture

## Contract Module Responsibilities
The Contract module handles:
- Contract Type
- Contract Template
- Template Versioning
- Contract CRUD
- Contract State Machine
- Workflow binding during submission
- Approval integration
- Contract lifecycle events

## Database
The existing database schema (`database.sql`) is the source of truth.
Do not casually change:
- tables
- columns
- data types
- constraints
- indexes
- foreign keys
- existing status values
Never create a migration merely to make the code compile.

## Development Workflow
For every feature:
1. Inspect existing implementation
2. Plan
3. Implement the smallest appropriate change
4. Build
5. Run relevant tests
6. Review diff
7. Commit only after validation

## Architectural Patterns
Do not introduce unnecessary architectural patterns. Follow the existing patterns in the Workflow module.

## Tests and Build
Ensure tests pass and the build succeeds before committing any changes.

## Claude Code Usage
- Use the `inspect` command to understand the current state before making changes
- Use the `review` skill to check your changes for architectural violations
- Use the `contract` skill for Contract-module specific guidance
- Follow the playbooks in `.claude/playbooks/` for standard workflows
- Check `.claude/memory/` for stable project knowledge
