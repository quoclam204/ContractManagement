# Contract Management System Architecture

## Overview
The Contract Management System (CLM) follows a **Clean Architecture** pattern organized as a **Modular Monolith** with clearly defined bounded contexts. Đội 5 người, .NET 10, SQL Server, ưu tiên đơn giản và dễ debug.

## Clean Architecture Layers

### Dependency Rule
Dependencies point inward toward the core business logic. Outer layers depend on inner layers, but inner layers have no knowledge of outer layers.

```
API Layer (Controllers, Middleware)
    ↓
Application Layer (Use Cases, Services, DTOs, Interfaces)
    ↓
Domain Layer (Entities, Value Objects, Enums, Domain Events, Business Rules)
    ↑
Infrastructure Layer implements interfaces from Application Layer
```

### Layer Responsibilities

#### 1. Domain Layer (`ContractManagement.Domain`)
- **Purpose**: Contains enterprise business logic and types
- **Characteristics**:
  - Independent of all other layers — NO dependencies on EF Core, ASP.NET Core, or any framework
  - Contains business entities, value objects, domain events, enums, and business rules
  - Organized by module folders: `Identity/`, `Contract/`, `Partner/`, `Workflow/`, `Payment/`, `Storage/`, `Signature/`, `Notification/`, `AI/`
- **Contains**: 
  - Entities and their behaviors
  - Value objects
  - Domain events and `IDomainEvent` interface
  - Enums (UserRole, ContractStatus, PaymentStatus, ApprovalDecision, SignatureMethod, NotificationType)
  - Business rules and validation

#### 2. Application Layer (`ContractManagement.Application`)
- **Purpose**: Defines the software's purpose and coordinates domain objects to achieve goals
- **Characteristics**:
  - Depends only on Domain layer
  - Contains use cases / application services (plain classes, MediatR NOT mandatory)
  - Defines interfaces (Ports) for infrastructure implementations
  - Contains DTOs for data exchange
  - Organized by module folders matching Domain structure
- **Contains**:
  - Application Services / Use Cases (e.g., `ContractService`, `AuthService`)
  - Ports (interfaces): `IStorageProvider`, `ISignatureProvider`, `ICurrentUserService`, `ITokenService`
  - DTOs (Data Transfer Objects)
  - Validators (FluentValidation)

#### 3. Infrastructure Layer (`ContractManagement.Infrastructure`)
- **Purpose**: Implements details for outward-facing concerns
- **Characteristics**:
  - Depends on Application and Domain layers
  - Implements interfaces defined in Application layer
  - Contains ONE single DbContext: `ContractManagementDbContext`
  - Organized by concern folders: `Persistence/`, `Storage/`, `Signature/`, `Messaging/`, `BackgroundJobs/`, `AI/`
- **Contains**:
  - `ContractManagementDbContext` — 1 DbContext for all modules
  - EF Core entity configurations per module (`Configurations/Identity/`, `Configurations/Contract/`...)
  - External service integrations
  - Message queue implementations (RabbitMQ publisher/consumers)
  - Background job processors (Hangfire — `ContractExpiryJob`)
  - File storage implementations (`MinioStorageProvider` → `IStorageProvider`)
  - Signature implementations (`MockSignatureProvider` → `ISignatureProvider`)
  - AI provider implementations (Claude/GPT-4o integration)

#### 4. API Layer (`ContractManagement.Api`)
- **Purpose**: Handles HTTP requests and delivers responses
- **Characteristics**:
  - Depends on Application and Infrastructure (only for DI/composition root)
  - Contains thin controllers — NO business logic
  - Handles cross-cutting concerns via middleware
  - Controllers organized by module folders: `Controllers/Identity/`, `Controllers/Contract/`...
- **Contains**:
  - Controllers (thin — delegates to Application Services)
  - Middleware (CorrelationId, ExceptionHandling, Authentication)
  - ASP.NET Core configuration and DI setup
  - OpenAPI/Swagger documentation
  - Health check endpoints

## Data Flow
Typical request flow:
1. HTTP request received by API Layer (Controller)
2. Controller validates input and calls Application Service / Use Case
3. Application Service coordinates Domain Objects
4. Domain Layer processes business rules
5. Infrastructure implements actual DB/Storage/Queue operations
6. Application Service maps results to Response DTO
7. Controller returns HTTP response

For async operations (Notification, AI Analysis):
1. Application Service publishes message to RabbitMQ
2. Consumer in Infrastructure processes asynchronously
3. Results stored in DB, client polls or receives notification

## 8 Bounded Contexts (Modules)

| Module | Tables | Person |
|---|---|---|
| Identity | USERS, DEPARTMENTS | Người 1 (Lead) |
| Contract | CONTRACTS, CONTRACT_TYPES | Người 2 |
| Partner | PARTNERS | Người 3 |
| Payment | PAYMENTS | Người 3 |
| Storage | ATTACHMENTS | Người 3 |
| Workflow | WORKFLOW_DEFINITIONS, WORKFLOW_STEPS, APPROVAL_STEPS, SIGNATURES | Người 4 |
| Notification | NOTIFICATIONS | Người 5 |
| AI | AI_ANALYSIS_RESULTS | Người 5 |

Shared table: `AUDIT_LOGS` — cross-cutting concern (managed by Infrastructure, not owned by any single module).

## Cross-Cutting Concerns
The following concerns are implemented as extension points:
- Logging (Serilog + Seq)
- Correlation ID tracking (xuyên suốt request & RabbitMQ)
- Health checks (API, DB, RabbitMQ, Storage)
- Caching (response caching for Dashboard queries)
- Security (JWT authentication, RBAC authorization)
- Validation (FluentValidation)
- Exception handling (global middleware → ProblemDetails)
- Audit Trail (interceptor ghi AUDIT_LOGS tự động)

These are implemented via middleware, decorators, or interception patterns without violating layer boundaries.

## Key Design Decisions

1. **Single DbContext**: `ContractManagementDbContext` for all modules (not per-module DbContext). Simplifies migration management and transaction handling for a 5-person team.
2. **MediatR optional**: Team members can choose plain Application Service classes (simpler to trace/debug) or MediatR/CQRS per module, as long as convention is consistent within a module.
3. **Module = Folder**: Modules are organized as folders inside each layer, NOT separate projects. This avoids project explosion while maintaining logical separation.
4. **Migration control**: Only Lead (Người 1) runs `Add-Migration`. Other members create Entity classes and EF Configurations, then notify Lead.
5. **Abstraction for external services**: `IStorageProvider` (MinIO/Azure Blob), `ISignatureProvider` (Mock/OTP/CA) — swappable without changing business logic.
