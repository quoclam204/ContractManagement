# Contract Management Skill for guiding Contract module work in the ContractManagement project, ensuring adherence to database-first approach and Workflow module reference patterns.

When working on Contract module features, follow this skill to ensure proper implementation.

## 🚫 PERMANENT RULE: DATABASE FIRST
**database.sql is the PERMANENT, unchangeable source of truth for the Contract module database schema.**
This rule overrides all other considerations and will NEVER change.

## 1. Mandatory First Step: Contract Command
Before ANY Contract module work:
- Run `/contract` command
- This inspects:
  - Requirements from 02_Task_Nguoi2_Contract.md
  - Database.sql for Contract-related tables
  - Workflow module as reference implementation
  - Existing Contract code
  - EF Core configurations and patterns
- **WAIT FOR EXPLICIT APPROVAL** from contract command output before proceeding to any coding

## 2. Database Fidelity Rules (PERMANENT)
These rules will NEVER change for Contract module work:

### Absolute Requirements
✅ **ALWAYS** treat database.sql as authoritative source  
✅ **ALWAYS** ensure EF Core configurations match database.sql exactly  
✅ **ALWAYS** preserve all existing constraints and indexes  
✅ **ALWAYS** respect concurrency tokens (RowVersion)  

### Absolute Prohibitions
❌ **DO NOT** invent columns, tables, or relationships  
❌ **DO NOT** change data types, nullability, or constraints  
❌ **DO NOT** create or apply migrations automatically  
❌ **DO NOT** modify database.sql without explicit approval  

### Permanent Contract Tables (from database.sql)
**CONTRACT_TYPES**
- Id: UNIQUEIDENTIFIER (PK, DEFAULT NEWID())
- Name: NVARCHAR(200) NOT NULL
- CreatedAt: DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()

**CONTRACT_TEMPLATE_VERSIONS**
- Id: UNIQUEIDENTIFIER (PK, DEFAULT NEWID())
- ContractTypeId: UNIQUEIDENTIFIER NOT NULL (FK → CONTRACT_TYPES.Id)
- Version: INT NOT NULL
- TemplateFileUrl: NVARCHAR(1000) NULL
- ContentJson: NVARCHAR(MAX) NULL (with ISJSON check)
- WorkflowDefinitionId: UNIQUEIDENTIFIER NULL (FK → WORKFLOW_DEFINITIONS.Id)
- IsActive: BIT NOT NULL DEFAULT 1
- CreatedBy: UNIQUEIDENTIFIER NOT NULL (FK → USERS.Id)
- CreatedAt: DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()

**CONTRACTS**
- Id: UNIQUEIDENTIFIER (PK, DEFAULT NEWID())
- ContractNumber: NVARCHAR(50) NOT NULL
- ContractTypeId: UNIQUEIDENTIFIER NOT NULL (FK → CONTRACT_TYPES.Id)
- TemplateVersionUsedId: UNIQUEIDENTIFIER NOT NULL (FK → CONTRACT_TEMPLATE_VERSIONS.Id)
- PartnerId: UNIQUEIDENTIFIER NOT NULL (FK → PARTNERS.Id)
- OwnerId: UNIQUEIDENTIFIER NOT NULL (FK → USERS.Id)
- Title: NVARCHAR(500) NOT NULL
- Value: DECIMAL(18,2) NOT NULL DEFAULT 0
- SignedDate: DATETIME2 NULL
- EffectiveDate: DATETIME2 NOT NULL
- ExpiryDate: DATETIME2 NOT NULL
- Status: TINYINT NOT NULL DEFAULT 0 (CHECK: BETWEEN 0 AND 7)
- FileUrl: NVARCHAR(1000) NULL
- ParentContractId: UNIQUEIDENTIFIER NULL (FK → CONTRACTS.Id)
- CreatedAt: DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
- UpdatedAt: DATETIME2 NULL
- RowVersion: ROWVERSION (optimistic concurrency)

## 3. Workflow Module Reference (PERMANENT)
The Workflow module is the PERMANENT reference implementation for Contract module work. Follow these patterns exactly:

### Domain Layer Patterns
- Pure POCO entities (Contract, ContractType, ContractTemplateVersion)
- Enums for status values (use byte type)
- Value objects for specialized types (ContractNumber, ContractValue)
- Domain events for lifecycle transitions
- Business logic in entities and domain services
- Navigation properties only when needed
- Private setters with methods for state changes when appropriate

### Application Layer Patterns
- DTOs for data transfer (request/response variants)
- Interfaces for services and repositories (IContractService, etc.)
- MediatR handlers for use cases (SubmitContractHandler, etc.)
- FluentValidation for validation (CreateContractValidator, etc.)
- AutoMapper profiles for mapping (ContractProfile, etc.)
- Application events for integration (ContractCreatedEvent, etc.)
- Use case interfaces and implementations

### Infrastructure Layer Patterns
- EF Core entity configurations (ContractConfiguration.cs, etc.)
- DbContext with proper DbSets (ContractManagementDbContext.cs)
- Repository implementations (if used)
- External service wrappers
- Configuration classes matching database.sql exactly

### API Layer Patterns
- Thin controllers (minimal business logic)
- RESTful endpoints with proper HTTP status codes
- Dependency injection for services
- Attribute routing ([ApiController], [Route("api/[controller]")])
- Validation via model state or custom filters
- Proper error handling

## 4. Contract Module Responsibilities (from 02_Task_Nguoi2_Contract.md)
Implement these faithfully:

### 1. Contract Type CRUD
- Create, read, update, delete Contract Types
- Contract Types define categories (Sales Agreement, NDA, Service Contract)
- Follow Workflow module patterns for Type entity implementation

### 2. Contract Template Management and Versioning
- Manage contract templates with version control per contract type
- Each template belongs to a Contract Type
- Templates can have associated workflow definitions
- Only one active version per contract type at a time (IsActive=1)
- Follow Workflow module patterns for versioned entity implementation

### 3. Contract CRUD Operations
- Create, read, update, delete Contract instances
- Contracts store key values: number, title, value, dates, status
- Follow Workflow module patterns for entity implementation
- Include proper validation and business logic

### 4. Contract State Machine Logic
Implement status transitions with business rules:
- 0 = Draft
- 1 = PendingApproval (upon submission)
- 2 = Approved (when workflow approves)
- 3 = Signed (when signed)
- 4 = Active (when effective date passes)
- 5 = Expiring (as expiry date approaches)
- 6 = Renewed (at end of life)
- 7 = Terminated (at end of life)
- Enforce valid transitions in domain/service layer
- Trigger appropriate events on status changes

### 5. Contract Submission and Workflow Binding
- When contract is submitted, bind to workflow from template version
- Submission triggers workflow initiation
- Store WorkflowDefinitionId from template version at submission
- Follow Workflow module patterns for workflow initiation

### 6. Approval Integration via Events
- Integrate with workflow approval process
- Approval steps update contract status via events
- Use events for loose coupling (MediatR pattern)
- Follow Workflow module patterns for event handling

### 7. Contract Lifecycle Events
Create events for each lifecycle transition:
- ContractCreated
- ContractSubmitted
- ContractApproved
- ContractSigned
- ContractActivated
- ContractExpired
- ContractRenewed
- ContractTerminated
- Follow Workflow module patterns for event implementation
- Use events for integration with other modules

## 5. Implementation Phases
Follow this sequence for Contract module work:

### Phase 1: Domain Layer
1. Create entities matching database.sql exactly:
   - Contract.cs → CONTRACTS table
   - ContractType.cs → CONTRACT_TYPES table
   - ContractTemplateVersion.cs → CONTRACT_TEMPLATE_VERSIONS Table
2. Add ContractStatus enum (0-7 values)
3. Implement value objects (ContractNumber, ContractValue)
4. Add domain events for lifecycle transitions
5. Implement business logic in entities (validation, state transitions)
6. Create domain service interfaces for complex business rules

### Phase 2: Application Layer
1. Create DTOs for all entities (request/response)
2. Define service interfaces (IContractService, IContractTypeService, etc.)
3. Implement MediatR handlers for use cases:
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
4. Add FluentValidation validators for all commands
5. Create AutoMapper profiles for entity↔DTO mapping
6. Define application events for integration with other modules
7. Implement use case orchestration logic

### Phase 3: Infrastructure Layer
1. Create EF Core configuration classes:
   - ContractConfiguration.cs
   - ContractTypeConfiguration.cs
   - ContractTemplateVersionConfiguration.cs
2. Ensure configurations match database.sql exactly:
   - Column names and types
   - Primary keys and foreign keys
   - Indexes and unique constraints
   - Check constraints (especially status 0-7)
   - Default values
   - Concurrency tokens (RowVersion)
3. Update ContractManagementDbContext with DbSets
4. Implement repository patterns if needed
5. Configure any external service integrations

### Phase 4: API Layer
1. Create thin controllers:
   - ContractController.cs
   - ContractTypeController.cs
   - ContractTemplateVersionController.cs
2. Follow RESTful conventions:
   - GET /api/contracts (list)
   - GET /api/contracts/{id} (get)
   - POST /api/contracts (create)
   - PUT /api/contracts/{id} (update)
   - DELETE /api/contracts/{id} (delete)
3. Add specific action endpoints for workflow operations:
   - POST /api/contracts/{id}/submit
   - POST /api/contracts/{id}/approve
   - POST /api/contracts/{id}/sign
   - POST /api/contracts/{id}/activate
   - POST /api/contracts/{id}/expire
   - POST /api/contracts/{id}/renew
   - POST /api/contracts/{id}/terminate
4. Use attribute routing and HTTP verbs correctly
5. Return appropriate HTTP status codes
6. Validate input via model state or custom filters
7. Handle exceptions appropriately

## 6. Testing Requirements
Ensure comprehensive testing:

### Unit Tests
- Domain entities (validation, business logic, state transitions)
- Domain services (business rules)
- Application handlers (use case logic, orchestration)
- Application validators (validation rules)
- Mapping profiles (DTO/entity conversion)
- Follow Arrange-Act-Assert pattern
- Test happy path, edge cases, and error conditions
- Mock external dependencies appropriately

### Integration Tests
- EF Core configurations (database mapping to database.sql)
- Repository methods (if implemented)
- Controller endpoints (API behavior and status codes)
- Test contract lifecycle end-to-end
- Test workflow integration points
- Test approval integration scenarios

### Contract-Specific Test Focus
- Status transitions (0-7) with business rules
- Workflow binding from template versions
- Approval integration points
- Contract lifecycle events firing correctly
- Database mapping fidelity (exact match to database.sql)
- Validation logic for all contract properties
- Entity relationships and navigation properties
- DTO mapping in both directions
- Error handling and exception scenarios

## 7. Review Process
Before considering Contract module work complete:

### Mandatory Checks
- [ ] `/contract` command was run and approved (first step)
- [ ] Solution builds successfully: `dotnet build`
- [ ] All relevant tests pass: `/test` command
- [ ] `/review` command shows no critical issues and is approved
- [ ] Domain layer has ZERO outward dependencies
- [ ] Entities match database.sql column-for-column
- [ ] Status values use byte type with 0-7 range
- [ ] Foreign key relationships match database.sql exactly
- [ ] Indexes match database.sql exactly
- [ ] Constraints preserved (PK, FK, unique, check)
- [ ] RowVersion concurrency token implemented
- [ ] Workflow binding follows template version pattern
- [ ] Approval integration uses events properly
- [ ] Contract module structure mirrors Workflow module
- [ ] Architectural layer separation maintained
- [ ] Coding standards followed
- [ ] Tests cover new Contract functionality adequately
- [ ] No unintended changes to other modules
- [ ] No TODOs or incomplete implementations remain

### Contract-Specific Validation
- [ ] Contract entities match database.sql exactly
- [ ] Status values follow 0=Draft,1=PendingApproval,2=Approved,3=Signed,4=Active,5=Expiring,6=Renewed,7=Terminated
- [ ] Workflow binding from ContractTemplateVersion.WorkflowDefinitionId
- [ ] Approval integration via events follows patterns
- [ ] Lifecycle events implemented for each status transition
- [ ] Business logic enforces valid status transitions
- [ ] Validation covers all contract properties
- [ ] DTOs used appropriately for data transfer
- [ ] Services follow interface-based design
- [ ] Controllers are thin with minimal business logic
- [ ] Follows Workflow module patterns exactly in structure

## 8. Commit and Pull Request
Use these patterns for Contract module work:

### Conventional Commits
- `feat(contract): add contract entity`
- `fix(contract): resolve contract status transition bug`
- `docs(contract): update contract lifecycle documentation`
- `refactor(contract): simplify contract validation logic`
- `test(contract): add unit tests for contract approval`
- `perf(contract): optimize contract query performance`

### Commit Guidelines
- Make small, focused commits
- Each commit represents one logical change
- Avoid large commits that bundle unrelated changes
- Do not amend commits that have already been pushed (unless in personal branch)
- Reference issues/numbers in commit messages when applicable

### Pull Request Requirements
- Use `/pull-request` playbook to prepare PR
- Ensure all quality gates are met before creating PR
- Be ready to explain how work follows Workflow module patterns
- Be ready to show database fidelity to database.sql
- Be ready to demonstrate Contract module specific functionality
- Address all review comments before merging
- Do not merge until approved by required reviewers

## 9. Important Reminders
- **The Contract command is your first step for ANY Contract work** - never skip it
- **database.sql is PERMANENT** - this is your anchor for all database work
- **Workflow module is the PERMANENT reference** - copy it faithfully for Contract module
- **AI-Driven Development requires following the complete process** - don't skip steps
- **Review is mandatory** - it protects architectural integrity and database integrity
- **Small, focused commits** make review easier and safer
- **Testing is your safety net** - write tests before and after fixing/implementing
- **Database integrity is paramount** - protect it at all costs
- **When in doubt, check database.sql first**
- **The Contract command exists to prevent architectural and database violations**

Remember: Violating database fidelity risks data corruption, application failure, and loss of data integrity. The database.sql file is your permanent source of truth - never violate this rule.