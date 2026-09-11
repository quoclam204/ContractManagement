# Database Memory

## Stable Database Knowledge

### Authoritative Source
**database.sql is the PERMANENT, unchangeable source of truth for the database schema.**
- Do not invent columns, tables, or relationships
- Do not change data types, nullability, or constraints
- Do not create or apply migrations without explicit approval
- EF Core configurations MUST match this file exactly
- This rule will NEVER change

### Permanent Contract-Related Tables
These tables and their structures are PERMANENT:

**CONTRACT_TYPES**
- Id: UNIQUEIDENTIFIER (PK, DEFAULT NEWID())
- Name: NVARCHAR(200) NOT NULL
- CreatedAt: DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
- Constraints: PK_CONTRACT_TYPES, UQ_CONTRACT_TYPES_Name

**CONTRACT_TEMPLATE_VERSIONS**
- Id: UNIQUEIDENTIER (PK, DEFAULT NEWID())
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

### Related Permanent Tables (for context)
**USERS**
- Id: UNIQUEIDENTIFIER (PK)
- FullName: NVARCHAR(200) NOT NULL
- Email: NVARCHAR(256) NOT NULL (unique)
- PasswordHash: NVARCHAR(512) NOT NULL
- Role: TINYINT NOT NULL (0-3)
- DepartmentId: UNIQUEIDENTIFIER NULL (FK → DEPARTMENTS)
- IsActive: BIT NOT NULL DEFAULT 1
- CreatedAt: DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
- UpdatedAt: DATETIME2 NULL

**PARTNERS**
- Id: UNIQUEIDENTIFIER (PK)
- Name: NVARCHAR(200) NOT NULL
- CreatedAt: DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()

**WORKFLOW_DEFINITIONS**
- Id: UNIQUEIDENTIFIER (PK)
- Name: NVARCHAR(200) NOT NULL
- ConditionExpression: NVARCHAR(500) NULL
- Version: INT NOT NULL DEFAULT 1
- IsActive: BIT NOT NULL DEFAULT 1
- CreatedAt: DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
- (Plus FK to USERS for CreatedBy, relationships to WorkflowSteps/ApprovalSteps)

**WORKFLOW_STEPS**
- Id: UNIQUEIDENTIFIER (PK)
- WorkflowDefinitionId: UNIQUEIDENTIFIER NOT NULL (FK)
- ApproverRole: TINYINT NOT NULL (with byte conversion)
- IsRequired: BIT NOT NULL DEFAULT 1
- (Plus indexes)

**APPROVAL_STEPS**
- Id: UNIQUEIDENTIFIER (PK)
- ContractId: UNIQUEIDENTIFIER NOT NULL (FK → CONTRACTS.Id)
- WorkflowDefinitionId: UNIQUEIDENTIFIER NOT NULL (FK)
- ApproverId: UNIQUEIDENTIFIER NOT NULL (FK → USERS.Id)
- Decision: TINYINT NOT NULL (0=Pending,1=Approved,2=Rejected)
- Comment: NVARCHAR(1000) NULL
- CreatedAt: DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
- (Plus indexes on ContractId and ApproverId)

### Stable Database Rules (PERMANENT)
These database rules will NEVER change:

1. **Source of Truth**: database.sql is ALWAYS the authoritative source
2. **No Schema Invention**: Do not invent columns, tables, or relationships
3. **Exact Matching**: EF Core configurations must match database.sql exactly
4. **Preserve Constraints**: Keep all PKs, FKs, unique constraints, check constraints
5. **Preserve Indexes**: Keep all existing indexes for performance
6. **Respect Concurrency**: RowVersion columns MUST be preserved and used
7. **No Auto Migrations**: Do not create or apply migrations automatically
8. **Status Values**: CONTRACTS.Status values 0-7 are PERMANENT:
   - 0 = Draft
   - 1 = PendingApproval
   - 2 = Approved
   - 3 = Signed
   - 4 = Active
   - 5 = Expiring
   - 6 = Renewed
   - 7 = Terminated
9. **FK Integrity**: All foreign key relationships must be maintained
10. **No Destructive Operations**: Never drop tables or lose data automatically

### Contract-Specific Database Knowledge
These Contract-specific facts are PERMANENT:

**Contract Lifecycle:**
- Starts as Draft (0)
- Goes to PendingApproval (1) upon submission
- Goes to Approved (2) when workflow approves
- Goes to Signed (3) when signed
- Goes to Active (4) when effective date passes
- Goes to Expiring (5) as expiry date approaches
- Either Renewed (6) or Terminated (7) at end of life

**Relationships:**
- Contract belongs to ONE ContractType
- Contract uses ONE ContractTemplateVersion (snapshot at submission)
- Contract involves ONE Partner (counterparty)
- Contract owned by ONE User
- Contract may have ONE ParentContract (for renewals/amendments)
- Contract has MANY ApprovalSteps (approval history)
- Contract is associated with ONE WorkflowDefinition (via template version)

**Important Constraints:**
- ExpiryDate must be >= EffectiveDate
- Status must be between 0 and 7 inclusive
- ContractNumber must be unique
- Only one active template version per contract type (IsActive=1)