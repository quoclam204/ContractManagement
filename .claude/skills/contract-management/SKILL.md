# Contract Management Skill

This skill provides project-specific guidance for working on the Contract module in the ContractManagement project.

## Responsibilities
The Contract module handles:
- Contract Type
- Contract Template
- Template Versioning
- Contract CRUD
- Contract State Machine
- Workflow binding during submission
- Approval integration
- Contract lifecycle events

## Expected Structure

### Domain
- `src/ContractManagement.Domain/Contracts/Entities/`
  - `Contract.cs`
  - `ContractType.cs`
  - `ContractTemplateVersion.cs`
- `src/ContractManagement.Domain/Contracts/Enums/`
  - `ContractStatus.cs` (if not already defined, but note: the status is stored as TINYINT in the database; see below for defined values)

### Application
- `src/ContractManagement.Application/Contracts/DTOs/`
- `src/ContractManagement.Application/Contracts/Interfaces/`
- `src/ContractManagement.Application/Contracts/Services/`
- `src/ContractManagement.Application/Contracts/Events/`
- `src/ContractManagement.Application/Contracts/Handlers/`

### Infrastructure
- `src/ContractManagement.Infrastructure/Persistence/Configurations/Contracts/`
  - EF Core configurations for Contract entities

### API
- `src/ContractManagement.Api/Controllers/Contracts/`
  - Contract controllers (thin, delegating to Application layer)

## State Machine
The contract status values are defined in the database schema (`database.sql`) as follows:
- 0 = Draft
- 1 = PendingApproval
- 2 = Approved
- 3 = Signed
- 4 = Active
- 5 = Expiring
- 6 = Renewed
- 7 = Terminated

These values are constrained by a CHECK constraint (Status BETWEEN 0 AND 7) in the CONTRACTS table.

## Workflow Integration
Before implementing contract submission or workflow binding:
- Inspect `WorkflowService` (`src/ContractManagement.Application/Workflow/Services/WorkflowService.cs`)
- Inspect `ApprovalService` (`src/ContractManagement.Application/Workflow/Services/ApprovalService.cs`)
- Inspect `WorkflowDefinition` (`src/ContractManagement.Domain/Workflow/Entities/WorkflowDefinition.cs`)
- Inspect `WorkflowStep` (`src/ContractManagement.Domain/Workflow/Entities/WorkflowStep.cs`)
- Inspect `ApprovalStep` (`src/ContractManagement.Domain/Workflow/Entities/ApprovalStep.cs`)
- Inspect Workflow events (e.g., `WorkflowApprovedEvent`, `WorkflowRejectedEvent`)
- Inspect existing workflow resolution logic

Reuse existing Workflow functionality where possible. Do not duplicate ApprovalStep or workflow logic if it already exists.

## Database-First Rule
Before implementing Contract entities or EF Core configurations:
1. Inspect `database.sql` for the exact table schema.
2. Match table names, column names, SQL types, nullability, and constraints exactly.
3. Do not invent columns or relationships.
4. Preserve existing indexes, unique constraints, and RowVersion/concurrency configuration.

## Testing
Write unit tests for:
- Contract creation
- Contract update
- Contract state transitions (using the defined status values)
- Contract submission and workflow binding
- Approval result handling
- Concurrency behavior (where applicable, respecting RowVersion)

Follow the existing test project structure and naming conventions.
