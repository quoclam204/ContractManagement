# Architecture Rules

## Layer Dependencies
- **API**: Depends on Application and Infrastructure. Controllers must remain thin, handling only HTTP concerns and delegating to Application layer.
- **Application**: Depends on Domain. Contains use cases, DTOs, interfaces, services, and MediatR event handlers.
- **Infrastructure**: Depends on Domain and Application. Implements persistence (EF Core repositories), external dependencies, and cross-cutting concerns.
- **Domain**: Must not reference Application, Infrastructure, or API layers. Contains entities, enums, exceptions, interfaces, and domain services.

## Dependency Direction
- API → Application → Domain
- Infrastructure → Application/Domain
- Domain must never depend on Application, Infrastructure, or API.

## Contract Module Specifics
The Contract module must follow the existing Workflow module conventions:
- Place Domain entities in `src/ContractManagement.Domain/Contracts/Entities/` and `src/ContractManagement.Domain/Contracts/Enums/`
- Place Application DTOs in `src/ContractManagement.Application/Contracts/DTOs/`
- Place Application interfaces in `src/ContractManagement.Application/Contracts/Interfaces/`
- Place Application services in `src/ContractManagement.Application/Contracts/Services/`
- Place Application events in `src/ContractManagement.Application/Contracts/Events/`
- Place Application event handlers in `src/ContractManagement.Application/Contracts/Handlers/`
- Place Infrastructure persistence configurations in `src/ContractManagement.Infrastructure/Persistence/Configurations/Contracts/`
- Place API controllers in `src/ContractManagement.Api/Controllers/Contracts/`

## General Rules
- Avoid circular dependencies between layers.
- Dependencies flow inward: outer layers can depend on inner layers, but not vice versa.
- Shared kernel code (if any) should be placed in a common domain layer.
- Do not introduce repositories, CQRS, mediators, facades, or other abstractions unless the existing project actually uses them or there is a clear architectural reason.
  - The project already uses MediatR (mediator pattern) for events and handlers, so reuse that.
  - The project uses EF Core for persistence; do not introduce a generic repository pattern if not already present.
