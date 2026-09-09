# Contract Feature Playbook

## Purpose
Specialized playbook for implementing Contract module features, ensuring strict adherence to database-first approach and Workflow module reference patterns.

## Usage
Use this playbook when implementing any feature related to the Contract module (Contract Types, Contract Templates, Contracts, etc.).

## Detailed Steps

### 1. Start with Contract Command
- **Mandatory**: Run `/contract` command before any coding
- This command inspects:
  - Contract module task requirements (02_Task_Nguoi2_Contract.md)
  - Database.sql for Contract-related tables
  - Workflow module as the reference implementation
  - Existing Contract code in the repository
  - EF Core configurations and DbContext patterns
- **Wait for explicit approval** from the contract command output before proceeding

### 2. Verify Database First Approach
- **database.sql is PERMANENT source of truth** - never forget this
- Do NOT invent columns, tables, or relationships
- Do NOT change data types, nullability, or constraints
- EF Core configurations MUST match database.sql exactly
- If your feature requires database changes:
  - STOP and get explicit approval for schema changes
  - Update database.sql first (if authorized)
  - Then update EF Core configurations to match
  - Never create migrations automatically

### 3. Follow Workflow Module Patterns Exactly
The Workflow module is your PERMANENT reference. Copy these patterns:
- **Folder structure**: Mirror Workflow's Domain/Application/Infrastructure/API organization
- **Naming conventions**: Use identical patterns for entities, DTOs, interfaces, services
- **Implementation approaches**: 
  - Domain: POCO entities with business logic
  - Application: MediatR handlers, FluentValidation validators
  - Infrastructure: EF Core TypeConfiguration classes
  - API: Thin controllers with dependency injection
- **Event handling**: Use MediatR for domain events and application events
- **Validation**: Apply FluentValidation consistently
- **Mapping**: Use AutoMapper profiles for DTO/entity mapping

### 4. Implement Contract-Specific Responsibilities
From 02_Task_Nguoi2_Contract.md, implement these faithfully:
- **Contract Type CRUD**: Create, read, update, delete operations
- **Contract Template Versioning**: Manage templates with version control per contract type
- **Contract CRUD**: Full lifecycle operations for contract instances
- **State Machine**: Implement status transitions (0-7) with business rules
- **Workflow Binding**: Link contracts to workflows from template versions
- **Approval Integration**: Connect to workflow approval process via events
- **Lifecycle Events**: Create events for each status transition

### 5. Domain Layer Implementation
- Create entities that match database.sql exactly:
  - Contract.cs → matches CONTRACTS table
  - ContractType.cs → matches CONTRACT_TYPES table
  - ContractTemplateVersion.cs → matches CONTRACT_TEMPLATE_VERSIONS table
- Add enums for ContractStatus (0-7 values)
- Implement value objects for specialized types (ContractNumber, ContractValue)
- Add domain events for lifecycle transitions
- Include business logic in entities (validation, state transitions)
- Create domain service interfaces for complex business rules

### 6. Application Layer Implementation
- Create DTOs for all entities (request/response variants)
- Define service interfaces (IContractService, etc.)
- Implement MediatR handlers for use cases:
  - CreateContractCommandHandler
  - GetContractQueryHandler
  - ListContractsQueryHandler
  - UpdateContractCommandHandler
  - SubmitContractHandler (triggers workflow)
  - ApproveContractHandler
  - SignContractHandler
  - ActivateContractHandler
  - ExpireContractHandler
  - RenewContractHandler
  - TerminateContractHandler
- Add FluentValidation validators for all commands
- Create AutoMapper profiles for entity↔DTO mapping
- Define application events for integration with other modules

### 7. Infrastructure Layer Implementation
- Create EF Core configuration classes:
  - ContractConfiguration.cs
  - ContractTypeConfiguration.cs
  - ContractTemplateVersionConfiguration.cs
- Ensure configurations match database.sql exactly:
  - Column names and types
  - Primary keys and foreign keys
  - Indexes and unique constraints
  - Check constraints (especially status 0-7)
  - Default values
  - Concurrency tokens (RowVersion)
- Update ContractManagementDbContext with DbSets
- Implement repository patterns if needed
- Configure any external service integrations

### 8. API Layer Implementation
- Create thin controllers:
  - ContractController.cs
  - ContractTypeController.cs
  - ContractTemplateVersionController.cs
- Follow RESTful conventions:
  - GET /api/contracts (list)
  - GET /api/contracts/{id} (get)
  - POST /api/contracts (create)
  - PUT /api/contracts/{id} (update)
  - DELETE /api/contracts/{id} (delete)
- Add specific action endpoints for workflow operations:
  - POST /api/contracts/{id}/submit
  - POST /api/contracts/{id}/approve
  - POST /api/contracts/{id}/sign
  - POST /api/contracts/{id}/activate
  - POST /api/contracts/{id}/expire
  - POST /api/contracts/{id}/renew
  - POST /api/contracts/{id}/terminate
- Use attribute routing and HTTP verbs correctly
- Return appropriate HTTP status codes
- Validate input via model state or custom filters
- Handle exceptions appropriately

### 9. Testing Implementation
- **Unit tests** for:
  - Domain entities (validation, business logic)
  - Domain services (business rules)
  - Application handlers (use case logic)
  - Application validators (validation rules)
  - Mapping profiles (DTO/entity conversion)
- **Integration tests** for:
  - EF Core configurations (database mapping)
  - Repository methods (if implemented)
  - Controller endpoints (API behavior)
- **Mock external dependencies** appropriately
- Test status transitions and business rules
- Test workflow integration points
- Test edge cases and error conditions
- Ensure tests follow Arrange-Act-Assert pattern
- Use descriptive test names that specify scenario and expected outcome

### 10. Review and Validate
- Run `/review` command to check:
  - Architectural compliance (layer separation)
  - Database schema fidelity (match to database.sql)
  - Coding standards and conventions
  - Test coverage and quality
  - Contract module specific requirements
- Address all findings before considering work complete
- Wait for explicit approval on review output

### 11. Final Verification
- Ensure solution builds: `dotnet build`
- Run comprehensive test suite: `/test` command
- Verify no breaking changes to existing functionality
- Confirm implementation fully addresses original requirements
- Check that all acceptance criteria are met
- Validate that no TODOs or incomplete code remains

## Quality Gates
Do not create pull request unless:
- Contract command was run and approved
- Database schema matches database.sql exactly
- Implementation follows Workflow module patterns
- All unit tests pass with good coverage
- Review command shows no critical issues and is approved
- Solution builds successfully
- All relevant tests pass

## Contract-Specific Checks Before PR
- [ ] Contract entities match database.sql column-for-column
- [ ] Status values use 0-7 range with correct meanings
- [ ] Foreign key relationships are properly configured
- [ ] Indexes from database.sql are mirrored in EF Core
- [ ] Unique constraints are implemented
- [ ] Check constraints (status range, expiry >= effective) are modeled
- [ ] RowVersion concurrency tokens are implemented
- [ ] No shadow properties or unmapped columns added
- [ ] Workflow binding follows template version pattern
- [ ] Approval integration uses events properly
- [ ] Contract module structure mirrors Workflow module
- [ ] Architectural layer separation is maintained
- [ ] Domain has zero outward dependencies
- [ ] DTOs, services, interfaces follow established patterns
- [ ] Controllers are thin with minimal business logic
- [ ] Tests cover new Contract functionality adequately
- [ ] No unintended changes to other modules

## Important Reminders
- The Contract command is your first step for ANY Contract work
- database.sql is PERMANENT - never violate this rule
- Workflow module is the PERMANENT reference - copy it faithfully
- AI-Driven Development requires following the complete process
- Review is mandatory - it protects architectural integrity
- Small, focused commits make review easier and safer
- Testing prevents regressions and builds confidence in changes