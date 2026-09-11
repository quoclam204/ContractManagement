# Dependency Rules

## Overview
The Contract Management System enforces strict dependency rules to maintain architectural integrity, ensure layer independence, and prevent unwanted coupling between modules and layers.

## Layer Dependency Rules

### Domain Layer (`ContractManagement.Domain`)
**Must NOT depend on:**
- ASP.NET Core or any web framework
- Entity Framework Core or any ORM
- Infrastructure layer (including RabbitMQ, Hangfire, MinIO, etc.)
- Application layer
- Any external libraries or frameworks (zero NuGet packages except BCL)

**May contain:**
- Pure business logic (entities, value objects, domain services)
- Domain events and `IDomainEvent` interface
- Business rules and validation logic
- Enums (UserRole, ContractStatus, PaymentStatus, ApprovalDecision, SignatureMethod, NotificationType)
- Base classes (BaseEntity with Id, CreatedAt, UpdatedAt)

### Application Layer (`ContractManagement.Application`)
**Must depend only on:**
- Domain layer

**Must NOT depend on:**
- Infrastructure layer
- API layer
- ASP.NET Core or web frameworks
- Entity Framework Core (define `IDbContext` interface nếu cần)
- External service SDKs (define interfaces instead: `IStorageProvider`, `ISignatureProvider`)

**May contain:**
- Application Services / Use Cases (plain classes hoặc MediatR handlers nếu module đó chọn dùng)
- Application-specific business rules
- DTOs (Data Transfer Objects)
- Interfaces (Ports) for Infrastructure implementations:
  - `IStorageProvider` (upload/download files)
  - `ISignatureProvider` (ký điện tử)
  - `ICurrentUserService` (lấy User đang đăng nhập)
  - `ITokenService` (sinh JWT token)
  - `IMessagePublisher` (publish message ra RabbitMQ)
- FluentValidation validators
- Exception definitions specific to application layer

### Infrastructure Layer (`ContractManagement.Infrastructure`)
**May depend on:**
- Application layer (để implement interfaces)
- Domain layer (để cấu hình EF Core entities)

**Must NOT depend on:**
- API layer
- ASP.NET Core (trừ khi cần cho DI extension methods)

**Typically contains:**
- `ContractManagementDbContext` — 1 DbContext duy nhất cho toàn bộ hệ thống
- EF Core entity configurations per module (`Configurations/Identity/`, `Configurations/Contract/`...)
- Migrations
- `MinioStorageProvider` implementing `IStorageProvider`
- `MockSignatureProvider` implementing `ISignatureProvider`
- RabbitMQ publisher/consumers (`Messaging/`)
- Hangfire background jobs (`BackgroundJobs/ContractExpiryJob`)
- AI integration (`AI/AiContractAnalyzer`)
- `DependencyInjection.cs` — extension method đăng ký tất cả Infrastructure services

### API Layer (`ContractManagement.Api`)
**May depend on:**
- Application layer (for Use Cases/Services and DTOs)
- Infrastructure layer (ONLY for dependency injection / composition root trong `Program.cs`)
- ASP.NET Core framework
- Swagger/OpenAPI packages
- Health check libraries
- Logging frameworks (Serilog)
- Authentication/authorization packages (JWT)

**Must NOT:**
- Contain business logic — Controllers phải mỏng (thin)
- Call Domain layer directly — phải đi qua Application layer
- Reference Infrastructure implementations directly — chỉ qua DI

## Module Dependency Rules

### General Principles
1. **Modules = Folders**: Mỗi module là thư mục bên trong mỗi layer, KHÔNG phải project riêng
2. **Interface-Based Dependencies**: Module phụ thuộc nhau qua Interfaces, không qua implementations
3. **Async Communication**: Dùng RabbitMQ cho Notification và AI Analysis
4. **Avoid Circular Dependencies**: Module A không được phụ thuộc Module B nếu B đã phụ thuộc A
5. **Shared Infrastructure**: `AUDIT_LOGS` và cross-cutting concerns (logging, correlation ID) là shared, không thuộc module nào cụ thể

### Specific Module Dependencies

#### Identity Module (Người 1 — Lead)
- **Depends on**: Nothing (foundational module)
- **May be depended on by**: All other modules (for `ICurrentUserService`, authorization)
- **Key interfaces**: `IAuthService`, `ITokenService`, `ICurrentUserService`
- **Tables**: USERS, DEPARTMENTS

#### Contract Module (Người 2)
- **Depends on**: Identity (for user context)
- **May be depended on by**: Workflow, Payment, Storage, Notification, AI
- **Key interfaces**: `IContractService`, `IContractLifecycleService`
- **Tables**: CONTRACTS, CONTRACT_TYPES

#### Partner Module (Người 3)
- **Depends on**: Identity (for ownership/management)
- **May be depended on by**: Contract (for counterparty info)
- **Key interfaces**: `IPartnerService`
- **Tables**: PARTNERS

#### Payment Module (Người 3)
- **Depends on**: Identity (for user context), Contract (for payment terms)
- **May be depended on by**: Notification (for payment alerts)
- **Key interfaces**: `IPaymentService`
- **Tables**: PAYMENTS

#### Storage Module (Người 3)
- **Depends on**: Identity (for ownership/access control)
- **May be depended on by**: Contract (for attachments), AI (for document analysis)
- **Key interfaces**: `IStorageProvider`, `IAttachmentService`
- **Tables**: ATTACHMENTS

#### Workflow Module (Người 4)
- **Depends on**: Identity (for approver assignment), Contract (for contract context)
- **May be depended on by**: Notification (for approval-triggered alerts)
- **Key interfaces**: `IWorkflowService`, `IApprovalService`, `ISignatureProvider`
- **Tables**: WORKFLOW_DEFINITIONS, WORKFLOW_STEPS, APPROVAL_STEPS, SIGNATURES

#### Notification Module (Người 5)
- **Depends on**: Identity (for user targeting)
- **May be depended on by**: No module directly — triggered via RabbitMQ consumer
- **Key interfaces**: `INotificationService`
- **Tables**: NOTIFICATIONS

#### AI Module (Người 5)
- **Depends on**: Identity (for user context), Storage (for document access)
- **May be depended on by**: Contract (for analysis results display)
- **Key interfaces**: `IAiAnalysisService`
- **Tables**: AI_ANALYSIS_RESULTS

## Dependency Direction Examples

### Correct Dependencies
```
Contract Service (Application) → uses ICurrentUserService (Application/Identity interface)
Workflow Service (Application) → uses IContractService (Application/Contract interface)
MinioStorageProvider (Infrastructure) → implements IStorageProvider (Application interface)
ContractController (API) → calls ContractService (Application)
Program.cs (API) → registers Infrastructure DI (composition root only)
```

### Incorrect Dependencies to Avoid
```
Domain Layer → EF Core (VIOLATION — Domain must be pure)
Application Layer → ContractManagementDbContext (VIOLATION — use interface)
ContractController → ContractManagementDbContext (VIOLATION — go through Application)
Contract Module → Notification Module directly (VIOLATION — use RabbitMQ for async)
Module A → Module B when B → A (CIRCULAR)
```

## Enforcement Mechanisms

### Code Review (Primary enforcement)
- Lead (Người 1) reviews all PRs for architecture violations
- Check for unauthorized namespace imports (e.g., `using Microsoft.EntityFrameworkCore` in Domain)
- Verify interface-based dependencies
- Ensure no business logic in wrong layers

### Project References (Compile-time)
Project references trong `.csproj` enforce layer boundaries:
```
Domain       → (no project references)
Application  → Domain
Infrastructure → Application, Domain
Api          → Application, Infrastructure
```

### Architecture Tests (Recommended)
- Verify Domain has no unauthorized dependencies
- Verify Application depends only on Domain
- Automated checks in CI/CD pipeline

## Exception Handling
Exceptions follow the same dependency rules:
- Domain defines domain-specific exceptions (e.g., `ContractAlreadySignedException`)
- Application defines application-specific exceptions (e.g., `EntityNotFoundException`)
- Infrastructure can throw infrastructure exceptions but should translate when crossing layer boundaries
- API layer handles all exceptions via `ExceptionHandlingMiddleware` → returns `ProblemDetails`
