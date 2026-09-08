# Contract Management System Architecture

## Overview
The Contract Management System (CLM) follows a Clean Architecture pattern organized as a Modular Monolith with clearly defined bounded contexts.

## Clean Architecture Layers

### Dependency Rule
Dependencies point inward toward the core business logic. Outer layers depend on inner layers, but inner layers have no knowledge of outer layers.

```
API Layer
    ↓
Application Layer
    ↓
Domain Layer
Infrastructure Layer implements interfaces from Application and Domain layers
```

### Layer Responsibilities

#### 1. Domain Layer (Core)
- **Purpose**: Contains enterprise business logic and types
- **Characteristics**:
  - Independent of all other layers
  - Contains business entities, value objects, domain events, and business rules
  - No dependencies on frameworks, databases, or external concerns
  - Represents the true core of the business
- **Contains**: 
  - Entities and their behaviors
  - Value objects
  - Domain events
  - Domain services (complex business logic)
  - Business rules and validation

#### 2. Application Layer
- **Purpose**: Defines the software's purpose and coordinates domain objects to achieve goals
- **Characteristics**:
  - Depends only on Domain layer
  - Contains use cases/application services
  - Defines interfaces for infrastructure implementations
  - Contains DTOs for data exchange
  - Application-specific business rules
- **Contains**:
  - Use cases and application services
  - Ports (interfaces) for outward dependencies
  - DTOs (Data Transfer Objects)
  - Application exceptions

#### 3. Infrastructure Layer
- **Purpose**: Implements details for outward-facing concerns
- **Characteristics**:
  - Depends on Application and Domain layers
  - Implements interfaces defined in inner layers
  - Handles technical concerns like databases, web services, etc.
  - Contains framework-specific code
- **Contains**:
  - Database implementations (EF Core repositories)
  - External service integrations
  - Message queue implementations (RabbitMQ)
  - Background job processors (Hangfire)
  - File storage implementations
  - AI provider implementations
  - Framework-specific configurations

#### 4. API Layer (Presentation)
- **Purpose**: Handles HTTP requests and delivers responses
- **Characteristics**:
  - Depends on Application and Infrastructure (only for DI/composition root)
  - Contains controllers and middleware
  - Must remain thin - no business logic
  - Handles cross-cutting concerns via middleware
  - Presents data in appropriate formats (JSON, etc.)
- **Contains**:
  - Controllers (thin layer - delegates to Application)
  - Middleware (authentication, logging, exception handling)
  - ASP.NET Core configuration
  - OpenAPI/Swagger documentation
  - Health check endpoints

## Data Flow
Typical request flow:
1. HTTP request received by API Layer (Controller)
2. Controller validates input and maps to DTO
3. Controller calls Application Layer (Use Case/Service)
4. Application Layer coordinates Domain Objects
5. Domain Layer processes business rules
6. Application Layer maps results back to DTO
7. Controller returns HTTP response

For operations requiring infrastructure:
1. Application Layer calls infrastructure interfaces
2. Infrastructure Layer implements the actual operations
3. Results flow back through the same path

## Cross-Cutting Concerns
The following concerns are implemented as extension points:
- Logging (Serilog)
- Correlation ID tracking
- Health checks
- Caching
- Security (authentication/authorization)
- Validation (FluentValidation)
- Exception handling

These are implemented via middleware, decorators, or interception patterns without violating layer boundaries.

