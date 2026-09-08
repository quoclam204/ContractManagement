# Dependency Rules

## Overview
The Contract Management System enforces strict dependency rules to maintain architectural integrity, ensure layer independence, and prevent unwanted coupling between modules and layers.

## Layer Dependency Rules

### Domain Layer
**Must NOT depend on:**
- ASP.NET Core or any web framework
- Entity Framework Core or any ORM
- Infrastructure layer (including RabbitMQ, Hangfire, etc.)
- Application layer
- Any external libraries or frameworks
- Other modules' infrastructure implementations

**May contain:**
- Pure business logic (entities, value objects, domain services)
- Domain events and event handlers
- Business rules and validation logic
- Interfaces that define contracts for outer layers (rarely used)

### Application Layer
**Must depend only on:**
- Domain layer

**Must NOT depend on:**
- Infrastructure layer
- API layer
- ASP.NET Core or web frameworks
- Entity Framework Core
- External service SDKs
- Other modules' infrastructure

**May contain:**
- Use cases and application services
- Application-specific business rules
- DTOs (Data Transfer Objects)
- Interfaces for infrastructure implementations
- Exception definitions specific to application layer

### Infrastructure Layer
**May depend on:**
- Application layer
- Domain layer

**Must NOT depend on:**
- API layer
- ASP.NET Core (except for minimal hosting concerns in custom implementations)

**Typically contains:**
- EF Core database context and configurations
- Repository implementations
- External service integrations (payment gateways, email services, etc.)
- Message queue implementations (RabbitMQ)
- Background job processors (Hangfire)
- File system storage implementations
- Cloud service integrations (AWS, Azure, etc.)
- Framework-specific configurations and wrappers

### API Layer
**May depend on:**
- Application layer (for use cases and DTOs)
- Infrastructure layer (only for dependency injection/composition root)
- ASP.NET Core framework
- Swagger/OpenAPI packages
- Health check libraries
- Logging frameworks
- Authentication/authorization packages

**Must NOT depend on:**
- Domain layer directly (should go through Application layer)
- Business logic (must remain thin)

## Module Dependency Rules

### General Principles
1. **Prefer Isolation**: Modules should operate independently when possible
2. **Interface-Based Dependencies**: Depend on interfaces, not implementations
3. **Event-Driven Communication**: Use events for loose coupling
4. **Avoid Circular Dependencies**: Module A should not depend on Module B if B depends on A
5. **Shared Kernel Minimization**: Keep shared code between modules to an absolute minimum

### Specific Module Dependencies

#### Identity Module
- **Depends on**: Nothing (foundational)
- **May be depended on by**: All other modules (for authentication/authorization)
- **Typical interfaces**: IAuthenticationService, IAuthorizationService, IUserService

#### Contract Module
- **Depends on**: Identity (for user/context)
- **May be depended on by**: Workflow, Payment, Storage, Notification
- **Typical interfaces**: IContractService, IContractRepository, IContractLifecycleService

#### Workflow Module
- **Depends on**: Identity (for task assignment), Contract (for contract context)
- **May be depended on by**: Notification (for workflow-triggered alerts)
- **Typical interfaces**: IWorkflowEngine, IWorkflowService, ITaskService

#### Partner Module
- **Depends on**: Identity (for ownership/management)
- **May be depended on by**: Contract, Payment
- **Typical interfaces**: IPartnerService, IPartnerRepository

#### Payment Module
- **Depends on**: Identity (for user context), Contract (for payment terms), Partner (for counterparty info)
- **May be depended on by**: Notification (for payment alerts)
- **Typical interfaces**: IPaymentService, IPaymentProcessor, IInvoiceService

#### Storage Module
- **Depends on**: Identity (for ownership/access control)
- **May be depended on by**: Contract (for attachments), AI (for document analysis)
- **Typical interfaces**: IStorageService, IFileService, IDocumentService

#### Notification Module
- **Depends on**: Identity (for user targeting)
- **May be depended on by**: All other modules (for sending notifications)
- **Typical interfaces**: INotificationService, IEmailService, ISmsService

#### AI Module
- **Depends on**: Identity (for user context), Storage (for document access)
- **May be depended on by**: Contract (for analysis), Workflow (for intelligent routing)
- **Typical interfaces**: IAIService, IContractAnalyzerService, IRiskAssessmentService

## Dependency Direction Examples

### Correct Dependencies
```
Contract Module (Application) → Identity Module (Interfaces)
Workflow Module (Application) → Contract Module (Interfaces)
Payment Module (Infrastructure) → Contract Module (Interfaces) ← Domain
Storage Module (Application) → Identity Module (Interfaces)
API Layer → Application Layer (Use Cases)
API Layer → Infrastructure Layer (DI only)
```

### Incorrect Dependencies to Avoid
```
Domain Layer → Infrastructure Layer (VIOLATION)
Application Layer → Infrastructure Layer (VIOLATION - should depend on interfaces only)
API Layer → Domain Layer (VIOLATION - should go through Application)
Module A → Module B when B → A (CIRCULAR)
```

## Enforcement Mechanisms

### Architecture Tests
Automated tests verify that:
- Domain layer has no unauthorized dependencies
- Application layer depends only on Domain
- Infrastructure layer depends only on Application and Domain
- API layer depends only on Application and Infrastructure (for DI)
- Modules follow declared dependency contracts

### Code Review
Manual review focuses on:
- Checking for unauthorized namespace imports
- Verifying interface-based dependencies
- Ensuring no business logic in wrong layers
- Validating module interaction patterns

### Build-Time Enforcement
Where possible, project structure and dependencies are configured to prevent violations at compile time.

## Exception Handling
Exceptions follow the same dependency rules:
- Domain defines domain-specific exceptions
- Application defines application-specific exceptions
- Infrastructure can throw infrastructure exceptions but should translate when crossing layer boundaries
- API layer handles exceptions and returns appropriate HTTP responses

