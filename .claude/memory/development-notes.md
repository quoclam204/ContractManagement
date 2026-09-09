# Development Notes Memory

## Stable Development Knowledge

### AI-Driven Development Process (PERMANENT)
This is THE process that will NEVER change:

1. **Specification First**: Start with clear requirements from docs/tasks/*.md
2. **Task Breakdown**: Use /implement-feature to break down into specific tasks
3. **Implementation**: Code following established patterns (Workflow module as reference)
4. **Testing**: Write unit tests, run with /test command
5. **Review**: Use /review command to check for architectural compliance
6. **Commit**: Use conventional commits, then /pull-request playbook
7. **Repeat**: Next feature

### Stable Development Rules (PERMANENT)
These development rules will NEVER change:

1. **No Source Modification**: Do NOT modify application source code, database schema, or Git history
2. **Claude Config Only**: Only create/update Claude Code configuration, documentation, rules, skills, agents, commands, playbooks, memory, and related configuration files
3. **Inspect First**: Always inspect existing repository and .claude directory before making changes
4. **Preserve Useful**: Keep any existing useful configuration
5. **Database Authority**: database.sql is the PERMANENT, unchangeable source of truth for schema
6. **Clean Architecture**: Follow strict layer separation (API → Application → Domain, Infrastructure → Application/Domain)
7. **Modular Monolith**: Respect 8 bounded contexts (Identity, Contract, Workflow, Partner, Payment, Storage/Attachment, Notification, AI)
8. **Workflow Reference**: Follow Workflow module patterns exactly for Contract module
9. **.NET 9 Target**: All projects must target .NET 9.0 (net9.0)
10. **Conventional Commits**: Use feat/, fix/, docs/, style/, refactor/, perf/, test/, chore/ prefixes
11. **No Direct SQL**: Use EF Core, never raw SQL queries
12. **Domain Isolation**: Domain layer has ZERO dependencies on outer layers
13. **Interface Dependencies**: Depend on interfaces, not implementations
14. **Event-Driven**: Use MediatR for loose coupling between modules
15. **Test Everything**: Write unit tests for all new functionality
16. **Green Build**: Always maintain a successful build and passing tests
17. **PR Discipline**: Use /pull-request playbook before creating PRs
18. **Review First**: Wait for approval before coding (use /review command)
19. **Documentation**: Update relevant docs when implementing features
20. **No Breaking Changes**: Avoid breaking public APIs without explicit approval

### Contract Module Development Specifics
These Contract-specific development facts are PERMANENT:

**Implementation Patterns (from Workflow module):**
- **Domain**: Pure POCO entities with business logic, enums, value objects, domain events
- **Application**: DTOs (request/response), interfaces (services, repositories), use cases, application events, validators
- **Infrastructure**: EF Core entity configurations, DbContext, external service implementations
- **API**: Controllers (thin), middleware, minimal business logic in controllers
- **Patterns**: MediatR for events, FluentValidation for validation, AutoMapper for mapping

**Required Contract Files (following Workflow patterns):**
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
    Middleware/
        (if needed)
```

**Database Mapping Rules:**
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

**Status Handling:**
- ContractStatus enum values: Draft=0, PendingApproval=1, Approved=2, Signed=3, Active=4, Expiring=5, Renewed=6, Terminated=7
- Status transitions enforced by domain/service layer
- Status changes trigger appropriate events
- Database CHECK constraint ensures values 0-7 only

**Workflow Integration:**
- ContractTemplateVersion.WorkflowDefinitionId links to workflow
- On contract creation, bind to workflow from template version
- On submission, initiate workflow process
- Approval steps update contract status
- Workflow completion triggers contract status updates

**Testing Patterns:**
- Unit tests for domain entities, validation, domain services
- Unit tests for application handlers, validators, mapping profiles
- Integration tests for EF Core configurations, repository methods
- Mock external services (email, storage, etc.)
- Test status transitions and business rules
- Test workflow integration points
- Test edge cases and error conditions

### EF Core Configuration Rules (PERMANENT)
These EF Core rules will NEVER change:

1. **Exact Match**: EF Core configuration MUST match database.sql exactly
2. **No Migrations**: Do NOT create or apply migrations automatically
3. **Fluent API**: Use Fluent API in EntityTypeConfiguration classes
4. **Data Annotations**: Only use when necessary (Table, Column, Key)
5. **Relationships**: Configure FKs, cascade deletes, required/optional
6. **Indexes**: Match existing indexes from database.sql
7. **Constraints**: Match PKs, FKs, unique constraints, check constraints
8. **Data Types**: Match SQL Server types exactly (uniqueidentifier, nvarchar, decimal, datetime2, tinyint, rowversion)
9. **Default Values**: Match DEFAULT constraints in database.sql
10. **Concurrency**: Configure RowVersion properties for optimistic concurrency
11. **No Shadow Properties**: Do NOT add shadow properties for audit fields
12. **No Computed Columns**: Handle computed values in domain/application layer
13. **No Database Functions**: Map to C# properties, handle logic in code
14. **Seeding**: Only seed reference data if explicitly approved
15. **Context Options**: Use DbContextOptionsBuilder in infrastructure layer
16. **Connection Strings**: Read from configuration, never hard-coded
17. **Migrations Folder**: Do NOT touch Migrations folder unless explicitly approved
18. **Database Initializer**: Do NOT use EnsureCreated() or EnsureDeleted() in production code
19. **Context Lifetime**: Use scoped lifetime with DI
20. **Transactions**: Use EF Core transactions or TransactionScope as needed