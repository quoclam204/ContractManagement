# Database Rules

## 🚫 PERMANENT RULE - DATABASE SCHEMA AUTHORITY

**database.sql is the PERMANENT, unchangeable source of truth for the database schema.**
This rule will NEVER change and overrides all other considerations.

### Absolute Prohibitions
❌ **DO NOT** invent columns, tables, or relationships  
❌ **DO NOT** change data types, nullability, or constraints  
❌ **DO NOT** create or apply migrations automatically  
❌ **DO NOT** modify database.sql without explicit approval  

### Absolute Requirements
✅ **ALWAYS** treat database.sql as the authoritative source  
✅ **ALWAYS** ensure EF Core configurations match database.sql exactly  
✅ **ALWAYS** preserve all existing constraints and indexes  
✅ **ALWAYS** respect concurrency tokens (RowVersion)  

## EF Core Configuration Rules

### Exact Matching Requirement
EF Core configurations MUST match database.sql exactly in:
- Table names and schemas
- Column names and data types
- Primary key configurations
- Foreign key relationships
- Index definitions (including included columns)
- Unique constraints
- Check constraints
- Default values
- Concurrency tokens

### Configuration Approach
- Use Fluent API in EntityTypeConfiguration classes
- Prefer Fluent API over Data Annotations when possible
- Use Data Annotations only for: Table, Column, Key (when necessary)
- Never mix conflicting configurations (Fluent API vs Data Annotations)

### Data Type Mapping (SQL Server → C#)
| SQL Server Type | C# Type | Attributes/Configuration |
|----------------|---------|--------------------------|
| uniqueidentifier | Guid | - |
| nvarchar(n) | string | [MaxLength(n)] |
| varchar(n) | string | [MaxLength(n)] |
| char(n) | string | [MaxLength(n), IsFixedLength(true)] |
| text | string | - |
| ntext | string | - |
| int | int | - |
| smallint | short | - |
| tinyint | byte | - |
| bigint | long | - |
| decimal(p,s) | decimal | [Precision(p, s)] |
| numeric(p,s) | decimal | [Precision(p, s)] |
| float | double | - |
| real | float | - |
| money | decimal | - |
| smallmoney | decimal | - |
| bit | bool | - |
| datetime | DateTime | - |
| datetime2 | DateTime | - |
| smalldatetime | DateTime | - |
| date | DateTime | - |
| time | TimeSpan | - |
| timestamp/rowversion | byte[] | [Timestamp] (concurrency token) |
| image | byte[] | - |
| binary(n) | byte[] | [MaxLength(n)] |
| varbinary(n) | byte[] | [MaxLength(n)] |
| xml | string | - |

### Keys and Relationships
**Primary Keys:**
- Use `HasKey()` method in Fluent API
- Match PRIMARY KEY constraints from database.sql exactly
- For composite keys, specify all column order correctly

**Foreign Keys:**
- Use `HasOne().WithMany().HasForeignKey()` pattern
- Match FOREIGN KEY constraints from database.sql exactly
- Specify principal table and columns correctly
- Configure delete behavior (Cascade, Restrict, SetNull, NoAction)
- Match ON DELETE and ON UPDATE actions from database.sql

**Indexes:**
- Use `HasIndex()` method in Fluent API
- Match CREATE INDEX statements from database.sql exactly
- Include included columns with `IncludeProperties()`
- Specify unique constraints with `IsUnique()`
- Specify filter expressions for filtered indexes with `HasFilter()`

### Constraints
**Primary Key Constraints:**
- Match PRIMARY KEY constraints exactly
- Configure using `HasKey()` method

**Foreign Key Constraints:**
- Match FOREIGN KEY constraints exactly
- Configure using Fluent API relationship methods

**Unique Constraints:**
- Match UNIQUE constraints exactly
- Configure using `HasIndex().IsUnique()`

**Check Constraints:**
- Match CHECK constraints exactly
- Configure using `HasCheckConstraint()` method
- Especially important for STATUS columns (0-7 range)

### Default Values
- Match DEFAULT constraints exactly
- Configure using `HasDefaultValue()` or `HasDefaultValueSql()`
- For GETDATE()/SYSDATETIME(), use appropriate SQL functions
- For NEWID(), use `HasDefaultValueSql("NEWID()")`

### Concurrency Tokens
**RowVersion/Timestamp:**
- Match ROWVERSION/timestamp columns exactly
- Configure using `IsRowVersion()` or `[Timestamp]` attribute
- Essential for optimistic concurrency
- Never remove or change concurrency token configuration

### Special Column Types
**Computed Columns:**
- Match computed column definitions exactly
- Configure using `HasComputedColumnSql()`
- Consider handling computed values in application layer when appropriate

**Sparse Columns:**
- Match SPARSE column definitions exactly
- Configure appropriately if needed

**Filestream Columns:**
- Match FILESTREAM definitions exactly
- Configure appropriately if needed

## Contract-Specific Database Rules

### Permanent Contract Tables
These tables and their structures are PERMANENT and must NEVER be changed without explicit approval:

**CONTRACT_TYPES**
- Id: UNIQUEIDENTIFIER (PK, DEFAULT NEWID())
- Name: NVARCHAR(200) NOT NULL
- CreatedAt: DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
- Constraints: PK_CONTRACT_TYPES, UQ_CONTRACT_TYPES_Name

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

### Critical Constraints That Must Be Preserved
These constraints are critical to business logic and MUST be preserved in EF Core:

1. **Status Range Check**: `CK_CONTRACTS_Status` - Status must be between 0 and 7
2. **Date Logic Check**: `CK_CONTRACTS_ExpiryAfterEffective` - ExpiryDate >= EffectiveDate
3. **Contract Number Unique**: `UQ_CONTRACTS_ContractNumber` - ContractNumber must be unique
4. **Template Version Unique**: `UQ_CTV_ContractType_Version` - Combination of ContractTypeId + Version must be unique
5. **Active Template Unique**: `UX_CTV_ContractType_Active` - Only one active version per contract type (where IsActive=1)
6. **Primary Keys**: All PK constraints must be preserved
7. **Foreign Keys**: All FK relationships must be preserved
8. **Concurrency**: RowVersion column must be preserved for optimistic concurrency

## Migration Rules (PERMANENT)

### No Automatic Migrations
❌ **NEVER** create or apply migrations automatically  
❌ **NEVER** use `dotnet ef migrations add` without explicit approval  
❌ **NEVER** use `dotnet ef database update` without explicit approval  
❌ **NEVER** use `EnsureCreated()` or `EnsureDeleted()` in application code  

### Migration Process (When Explicitly Approved)
1. **Change database.sql first** - update the permanent source of truth
2. **Update EF Core configurations** to match new database.sql exactly
3. **Only then** consider creating migration (if still needed)
4. **Review migration carefully** - ensure it only makes intended changes
5. **Apply migration in controlled environment** with backups
6. **Document reason** for schema change

### Preferred Approach
In most cases, avoid migrations entirely by:
- Matching EF Core configurations to existing database.sql
- Using the database as-is without schema changes
- Handling schema evolution through careful planning and approval

## Connection Management

### Connection Strings
- Never hard-code connection strings in source code
- Use configuration system (appsettings.json, environment variables, etc.)
- Use `IConfiguration` to access connection strings in DbContext
- Different connection strings for different environments (dev, test, prod)

### DbContext Lifetime
- Use scoped lifetime with Dependency Injection
- Create DbContext per request/scope in web applications
- Dispose DbContext appropriately when scope ends
- Do not use singleton DbContext in web applications

### Transaction Handling
- Use EF Core transactions for multi-operation consistency
- Consider `TransactionScope` for distributed transactions when needed
- Keep transactions as short as possible
- Handle transaction failures appropriately

## Query Guidelines

### Performance
- Avoid SELECT *; select only needed columns
- Use appropriate filtering (WHERE clauses) to reduce result set
- Use pagination (Skip/Take) for large result sets
- Be aware of N+1 query problem; use Include() judiciously
- Consider splitting complex queries when appropriate
- Use raw SQL only when necessary and approved

### Security
- Never concatenate user input into SQL strings
- Use parameterized queries or EF Core LINQ to prevent injection
- Validate and sanitize inputs before use in queries
- Use stored procedures only when necessary and approved

### Tracking
- Use `AsNoTracking()` for read-only queries when appropriate
- Be aware of change tracking implications
- Detach entities when no longer needed to avoid memory leaks

## Contract-Specific Query Patterns

### Contract Lookups
- Always filter by ContractNumber when looking up specific contract
- Consider indexes on ContractNumber, PartnerId, OwnerId, Status
- Use efficient date range queries for EffectiveDate/ExpiryDate
- Filter by Status when querying contracts in specific lifecycle states

### Contract Type and Template Queries
- Filter by IsActive=1 when looking for active template versions
- Join ContractTypes to ContractTemplateVersions when needed
- Consider caching reference data that changes infrequently

### Reporting and Aggregation
- Be mindful of locking and performance on production database
- Consider using read replicas for reporting when available
- Use appropriate isolation levels for reporting queries
- Avoid long-running transactions in reporting scenarios

## Data Integrity

### Constraint Validation
- Rely on database constraints for data integrity, not just application logic
- Handle constraint violation exceptions appropriately
- Validate business rules in both application and database layers
- Use transactions to maintain consistency across multiple tables

### Data Migration
- Plan data migrations carefully when schema changes are approved
- Validate data before and after migration
- Use transactions for data migration scripts
- Backup data before migration attempts

### Seed Data
- Only seed reference data when explicitly approved
- Keep seed data scripts separate from application code
- Ensure seed data is idempotent (safe to run multiple times)
- Never seed production-like data in development without masking

## Enforcement
These database rules are enforced through:
- Mandatory `/contract` command for Contract module work
- Code review (/review command) checking database fidelity
- Comparison of EF Core configurations to database.sql
- Automated checks where possible
- Team awareness and strict adherence to database-first principle

## Violation Examples
```
# DO NOT DO THIS - Adding column not in database.sql
public class Contract {
    public string NewColumn { get; set; } // Not in CONTRACTS table
}

# DO NOT DO THIS - Changing data type
public class Contract {
    public int Value { get; set; } // Should be decimal(18,2) to match DECIMAL(18,2)
}

# DO NOT DO THIS - Missing required column
public class Contract {
    // Missing ContractNumber column which is NOT NULL in database
    public Guid Id { get; set; }
    // ... other columns
}

# DO NOT DO THIS - Incorrect relationship
public class Contract {
    public Guid ContractTypeId { get; set; }
    // Missing FK configuration to CONTRACT_TYPES table
    public ContractType ContractType { get; set; }
}

# DO NOT DO THIS - Missing concurrency token
public class Contract {
    // Missing RowVersion property for optimistic concurrency
    public Guid Id { get; set; }
    // ... other properties
}

# DO NOT DO THIS - Incorrect index configuration
public class ContractConfiguration : IEntityTypeConfiguration<Contract> {
    public void Configure(EntityTypeBuilder<Contract> builder) {
        builder.HasIndex(c => c.ContractNumber);
        // Missing unique constraint to match UQ_CONTRACTS_ContractNumber
    }
}

# DO NOT DO THIS - Missing check constraint
public class ContractConfiguration : IEntityTypeConfiguration<Contract> {
    public void Configure(EntityTypeBuilder<Contract> builder) {
        builder.Property(c => c.Status)
            .IsRequired();
        // Missing check constraint for STATUS between 0 and 7
    }
}
```

# Correct Patterns
```
// DO THIS - Exact match to database.sql
public class Contract {
    public Guid Id { get; set; } // Matches UNIQUEIDENTIFIER PK
    public string ContractNumber { get; set; } = default!; // Matches NVARCHAR(50) NOT NULL
    public Guid ContractTypeId { get; set; } // Matches UNIQUEIDENTIFIER NOT NULL FK
    public Guid TemplateVersionUsedId { get; set; } // Matches UNIQUEIDENTIFIER NOT NULL FK
    public Guid PartnerId { get; set; } // Matches UNIQUEIDENTIFIER NOT NULL FK
    public Guid OwnerId { get; set; } // Matches UNIQUEIDENTIFIER NOT NULL FK
    public string Title { get; set; } = default!; // Matches NVARCHAR(500) NOT NULL
    public decimal Value { get; set; } // Matches DECIMAL(18,2) NOT NULL DEFAULT 0
    public DateTime? SignedDate { get; set; } // Matches DATETIME2 NULL
    public DateTime EffectiveDate { get; set; } // Matches DATETIME2 NOT NULL
    public DateTime ExpiryDate { get; set; } // Matches DATETIME2 NOT NULL
    public byte Status { get; set; } // Matches TINYINT NOT NULL DEFAULT 0
    public string? FileUrl { get; set; } // Matches NVARCHAR(1000) NULL
    public Guid? ParentContractId { get; set; } // Matches UNIQUEIDENTIFIER NULL FK (self-referencing)
    public DateTime CreatedAt { get; set; } // Matches DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    public DateTime? UpdatedAt { get; set; } // Matches DATETIME2 NULL
    public byte[] RowVersion { get; set; } // Matches ROWVERSION (optimistic concurrency)
}

// DO THIS - EF Core configuration matching database.sql exactly
public class ContractConfiguration : IEntityTypeConfiguration<Contract> {
    public void Configure(EntityTypeBuilder<Contract> builder) {
        builder.ToTable("CONTRACTS"); // Matches table name
        
        // Primary Key
        builder.HasKey(c => c.Id); // Matches PK_CONTRACTS
        
        // Properties matching columns exactly
        builder.Property(c => c.Id)
            .HasColumnType("uniqueidentifier")
            .HasDefaultValueSql("NEWID()");
            
        builder.Property(c => c.ContractNumber)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnType("nvarchar");
            
        builder.Property(c => c.ContractTypeId)
            .IsRequired()
            .HasColumnType("uniqueidentifier");
            
        builder.Property(c => c.TemplateVersionUsedId)
            .IsRequired()
            .HasColumnType("uniqueidentifier");
            
        builder.Property(c => c.PartnerId)
            .IsRequired()
            .HasColumnType("uniqueidentifier");
            
        builder.Property(c => c.OwnerId)
            .IsRequired()
            .HasColumnType("uniqueidentifier");
            
        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(500)
            .HasColumnType("nvarchar");
            
        builder.Property(c => c.Value)
            .IsRequired()
            .HasPrecision(18, 2)
            .HasDefaultValue(0m)
            .HasColumnType("decimal");
            
        builder.Property(c => c.SignedDate)
            .HasColumnType("datetime2");
            
        builder.Property(c => c.EffectiveDate)
            .IsRequired()
            .HasColumnType("datetime2");
            
        builder.Property(c => c.ExpiryDate)
            .IsRequired()
            .HasColumnType("datetime2");
            
        builder.Property(c => c.Status)
            .IsRequired()
            .HasDefaultValue((byte)0)
            .HasColumnType("tinyint");
            
        builder.Property(c => c.FileUrl)
            .HasMaxLength(1000)
            .HasColumnType("nvarchar");
            
        builder.Property(c => c.ParentContractId)
            .HasColumnType("uniqueidentifier");
            
        builder.Property(c => c.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("SYSUTCDATETIME()")
            .HasColumnType("datetime2");
            
        builder.Property(c => c.UpdatedAt)
            .HasColumnType("datetime2");
            
        builder.Property(c => c.RowVersion)
            .IsRowVersion() // Critical for optimistic concurrency
            .HasColumnType("rowversion");
        
        // Indexes matching database.sql exactly
        builder.HasIndex(c => c.ContractNumber)
            .IsUnique(); // Matches UQ_CONTRACTS_ContractNumber
            
        builder.HasIndex(c => c.PartnerId); // Matches IX_CONTRACTS_PartnerId
        builder.HasIndex(c => c.OwnerId); // Matches IX_CONTRACTS_OwnerId
        builder.HasIndex(c => c.ContractTypeId); // Matches IX_CONTRACTS_ContractTypeId
        builder.HasIndex(c => c.TemplateVersionUsedId); // Matches IX_CONTRACTS_TemplateVersionUsedId
        builder.HasIndex(c => c.ParentContractId); // Matches IX_CONTRACTS_ParentContractId
        
        builder.HasIndex(c => new { c.Status, c.ExpiryDate })
            .IncludeProperties(c => new { c.ContractNumber, c.Title, c.Value, c.OwnerId });
            // Matches IX_CONTRACTS_Status_ExpiryDate (INCLUDE ContractNumber, Title, Value, OwnerId)
        
        // Constraints matching database.sql exactly
        builder.HasCheckConstraint("CK_CONTRACTS_Status", "([Status] >= 0 AND [Status] <= 7)");
        builder.HasCheckConstraint("CK_CONTRACTS_ExpiryAfterEffective", "([ExpiryDate] >= [EffectiveDate])");
    }
}
```

## Important Reminders
- **database.sql is PERMANENT** - this is your anchor for all database work
- **EF Core exists to serve the database, not vice versa**
- **When in doubt, check database.sql first**
- **The Contract command helps ensure you follow database rules for Contract module work**
- **Violating these rules risks data corruption, application failures, and loss of data integrity**
- **Database integrity is paramount - protect it at all costs**