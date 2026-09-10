# Contract Module Memory

## Stable Contract Knowledge

### Source of Truth
**database.sql is the PERMANENT, unchangeable source of truth for the Contract module database schema.**

### Permanent Contract-Related Tables (from database.sql)

#### CONTRACT_TYPES
- Id: UNIQUEIDENTIFIER (PK, DEFAULT NEWID())
- Name: NVARCHAR(200) NOT NULL
- CreatedAt: DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
- Constraints: PK_CONTRACT_TYPES, UQ_CONTRACT_TYPES_Name

#### CONTRACT_TEMPLATE_VERSIONS
- Id: UNIQUEIDENTIFIER (PK, DEFAULT NEWID())
- ContractTypeId: UNIQUEIDENTIFIER NOT NULL (FK → CONTRACT_TYPES.Id)
- Version: INT NOT NULL
- TemplateFileUrl: NVARCHAR(1000) NULL
- ContentJson: NVARCHAR(MAX) NULL (with ISJSON check)
- WorkflowDefinitionId: UNIQUEIDENTIFIER NULL (FK → WORKFLOW_DEFINITIONS.Id)
- IsActive: BIT NOT NULL DEFAULT 1
- CreatedBy: UNIQUEIDENTIFIER NOT NULL (FK → USERS.Id)
- CreatedAt: DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
- Constraints: 
  - PK_CONTRACT_TEMPLATE_VERSIONS
  - FK_CTV_CONTRACT_TYPES
  - FK_CTV_WORKFLOW_DEFINITIONS
  - FK_CTV_USERS_CreatedBy
  - UQ_CTV_ContractType_Version
  - CK_CTV_ContentJson_IsJson
- Indexes: UX_CTV_ContractType_Active (unique where IsActive=1), IX_CTV_WorkflowDefinitionId

#### CONTRACTS
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
- Constraints:
  - PK_CONTRACTS PRIMARY KEY
  - UQ_CONTRACTS_ContractNumber UNIQUE
  - FK_CONTRACTS_CONTRACT_TYPES
  - FK_CONTRACTS_TEMPLATE_VERSIONS
  - FK_CONTRACTS_PARTNERS
  - FK_CONTRACTS_USERS_Owner
  - FK_CONTRACTS_ParentContract (self-referencing)
  - CK_CONTRACTS_Status
  - CK_CONTRACTS_ExpiryAfterEffective
- Indexes:
  - IX_CONTRACTS_PartnerId
  - IX_CONTRACTS_OwnerId
  - IX_CONTRACTS_ContractTypeId
  - IX_CONTRACTS_TemplateVersionUsedId
  - IX_CONTRACTS_ParentContractId
  - IX_CONTRACTS_Status_ExpiryDate (INCLUDE ContractNumber, Title, Value, OwnerId)

### Contract Lifecycle (PERMANENT)
- 0 = Draft
- 1 = PendingApproval
- 2 = Approved
- 3 = Signed
- 4 = Active
- 5 = Expiring
- 6 = Renewed
- 7 = Terminated

### Contract-Specific Responsibilities (from 02_Task_Nguoi2_Contract.md)
These responsibilities are PERMANENT for the Contract module:

1. **Contract Type entities and CRUD**
   - Create, read, update, delete Contract Types
   - Contract Types define categories of contracts (e.g., Sales Agreement, NDA, Service Contract)

2. **Contract Template management and versioning**  
   - Manage contract templates with versioning
   - Each template belongs to a Contract Type
   - Templates can have associated workflow definitions
   - Only one active version per contract type at a time

3. **Contract CRUD operations**
   - Create, read, update, delete Contracts
   - Contracts are instances of templates
   - Contracts store key values like contract number, title, value, dates, status

4. **Contract State Machine logic**
   - DRAFT (0) → PENDING_APPROVAL (1) → APPROVED (2) → SIGNED (3) → ACTIVE (4) → EXPIRING (5) → RENEWED (6) or TERMINATED (7)
   - Status transitions governed by business rules
   - Each status change may trigger events

5. **Contract submission and workflow binding**
   - When a contract is submitted, it binds to a workflow
   - The workflow definition comes from the template version
   - Submission triggers workflow initiation

6. **Approval integration via events**
   - Contract module integrates with workflow approval process
   - Approval steps update contract status
   - Events communicate approval state changes

7. **Contract lifecycle events**
   - Events for each lifecycle transition
   - Enables other modules to react to contract changes
   - Examples: ContractCreated, ContractSubmitted, ContractApproved, ContractSigned, ContractActivated, ContractExpired, ContractRenewed, ContractTerminated

### Reference Implementation: Workflow Module
The Workflow module is the PERMANENT reference for implementing the Contract module. Follow these patterns exactly:

**Domain Layer Patterns:**
- Pure POCO entities (Contract, ContractType, ContractTemplateVersion)
- Enums for status values
- Value objects for specialized types (ContractNumber, ContractValue)
- Domain events for lifecycle transitions
- Aggregates with clear boundaries
- Business logic in entities and domain services

**Application Layer Patterns:**
- DTOs for data transfer (request/response)
- Interfaces for services and repositories
- Use cases implemented as handlers (MediatR)
- Validation (FluentValidation)
- Mapping profiles (AutoMapper)
- Application events for integration

**Infrastructure Layer Patterns:**
- EF Core entity configurations
- DbContext with proper DbSets
- Repository implementations
- External service wrappers
- Configuration classes

**API Layer Patterns:**
- Thin controllers (minimal business logic)
- RESTful endpoints
- Proper HTTP status codes
- Dependency injection
- Validation via model state or filters

### Implementation Requirements
When implementing Contract module features:

1. **Follow Workflow patterns exactly** - copy structure and naming conventions
2. **Match database.sql exactly** - no schema invention, no column mismatches
3. **Maintain layer separation** - Domain has zero outward dependencies
4. **Use established patterns** - MediatR, FluentValidation, AutoMapper
5. **Write comprehensive tests** - unit tests for all logic
6. **Follow conventional commits** - proper commit messages
7. **Wait for approval** - use /review command before coding
8. **Use Contract command** - at start of any Contract work
9. **Preserve existing code** - don't modify unless fixing bugs
10. **Document changes** - update relevant documentation

### Key Files to Create (following Workflow patterns)
```
Domain/
    Entities/
        Contract.cs
        ContractType.cs
        ContractTemplateVersion.cs
        ContractStatus.cs (enum)
    Events/
        ContractCreated.cs
        ContractSubmitted.cs
        ContractApproved.cs
        ContractSigned.cs
        ContractActivated.cs
        ContractExpired.cs
        ContractRenewed.cs
        ContractTerminated.cs
    ValueObjects/
        ContractNumber.cs
        ContractValue.cs
    Enums/
        ContractStatusEnum.cs
    Interfaces/
        IContractRepository.cs
        IContractTypeRepository.cs
        IContractTemplateVersionRepository.cs
    Services/
        IContractDomainService.cs
        ContractDomainService.cs

Application/
    DTOs/
        ContractRequestDto.cs
        ContractResponseDto.cs
        ContractTypeDto.cs
        ContractTemplateVersionDto.cs
        CreateContractCommand.cs
        UpdateContractCommand.cs
        GetContractQuery.cs
        ListContractsQuery.cs
    Interfaces/
        IContractService.cs
        IContractTypeService.cs
        IContractTemplateVersionService.cs
    Features/
        Contracts/
            CreateContractHandler.cs
            UpdateContractHandler.cs
            GetContractHandler.cs
            ListContractsHandler.cs
            SubmitContractHandler.cs
            ApproveContractHandler.cs
            SignContractHandler.cs
            ActivateContractHandler.cs
            ExpireContractHandler.cs
            RenewContractHandler.cs
            TerminateContractHandler.cs
    Mappings/
        ContractProfile.cs
    Validators/
        CreateContractValidator.cs
        UpdateContractValidator.cs
    Events/
        ContractCreatedEvent.cs
        ContractSubmittedEvent.cs
        ContractApprovedEvent.cs
        ContractSignedEvent.cs
        ContractActivatedEvent.cs
        ContractExpiredEvent.cs
        ContractRenewedEvent.cs
        ContractTerminatedEvent.cs

Infrastructure/
    Persistence/
        Configurations/
            ContractConfiguration.cs
            ContractTypeConfiguration.cs
            ContractTemplateVersionConfiguration.cs
        ContractManagementDbContext.cs
    Services/
        ContractService.cs
        ContractTypeService.cs
        ContractTemplateVersionService.cs

API/
    Controllers/
        ContractController.cs
        ContractTypeController.cs
        ContractTemplateVersionController.cs
```

### Database Mapping Rules (PERMANENT)
- Entity properties MUST match database.sql column names and types exactly
- Use [Column] attribute only when names differ
- Use [Key] for primary keys
- Use [ForeignKey] for foreign keys
- Use [Required] for NOT NULL columns
- Use [MaxLength] for varchar/nvarchar length limits
- Use [Precision] for decimal types
- Use [DatabaseGenerated] for identity/sequence columns
- Implement RowVersion for concurrency tokens
- Never add shadow properties or unmapped columns
- Ignore columns only if computed or not in entity (with [NotMapped])