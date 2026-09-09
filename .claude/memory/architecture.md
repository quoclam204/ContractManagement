# Architecture Memory

## Stable Architecture Knowledge

### Clean Architecture Implementation
This project implements Clean Architecture with the following stable characteristics:

**Layer Responsibilities (DO NOT CHANGE):**
- **Domain**: Pure business logic, entities, rules. ZERO dependencies on outer layers.
- **Application**: Use cases, DTOs, interfaces. Depends ONLY on Domain.
- **Infrastructure**: EF Core, external services. Depends on Application and Domain.
- **API**: Controllers, middleware. Depends on Application and Infrastructure (DI only).

**Dependency Flow (MUST BE PRESERVED):**
```
API Layer
    ↓
Application Layer
    ↓
Domain Layer
Infrastructure Layer ↔ (Application & Domain)
```

### Modular Monolith Implementation
The project is organized as a Modular Monolith with these stable bounded contexts:

**Permanent Modules:**
1. Identity - User auth, roles, permissions
2. Contract - Contract lifecycle, types, templates (YOUR MODULE)
3. Workflow - Process automation, approvals (REFERENCE IMPLEMENTATION)
4. Partner - Counterparty management
5. Payment - Financial transactions, invoicing
6. Storage/Attachment - File storage, document management
7. Notification - Alerting, messaging delivery
8. AI - Contract analysis, insights

**Module Interaction Principles (STABLE):**
- Prefer isolation: modules operate independently when possible
- Interface-based: depend on interfaces, not implementations
- Event-driven: use events for loose coupling (MediatR pattern)
- Avoid circular dependencies between modules
- Shared kernel: kept to absolute minimum

### Contract Module-Specific Stable Knowledge
**Reference Implementation**: The Workflow module is the PERMANENT reference for Contract module implementation.

**Stable Contract Responsibilities (from 02_Task_Nguoi2_Contract.md):**
- Contract Type entities and CRUD
- Contract Template management and versioning  
- Contract CRUD operations
- Contract State Machine logic (DRAFT→PENDING_APPROVAL→APPROVED→SIGNED→ACTIVE→EXPIRING→RENEWED/TERMINATED)
- Contract submission and workflow binding
- Approval integration via events
- Contract lifecycle events

**Stable Database Foundation**: These tables are PERMANENT sources of truth:
- CONTRACT_TYPES
- CONTRACT_TEMPLATE_VERSIONS
- CONTRACTS
- (Plus related tables: USERS, PARTNERS, WORKFLOW_DEFINITIONS, etc.)

### Unchangeable Architecture Principles
These principles will NEVER change for this project:
1. Domain layer isolation - NO outward dependencies
2. Clean Architecture layering - strict dependency flow
3. Monolith organization - 8 defined bounded contexts
4. database.sql as schema authority - NO schema invention
5. Workflow module as reference implementation - FOLLOW THIS PATTERN
6. Contract module responsibilities - as defined in task 02