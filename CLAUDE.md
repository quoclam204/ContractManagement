# Contract Management System (CLM) - AI Assistant & Engineering Guidelines

Welcome to the **Enterprise Contract Lifecycle Management (CLM)** project repository.
This document serves as the single source of truth for AI agents (Claude Code, Cursor, Gemini, Copilot) and team developers.

---

## 1. System Architecture & Standards

The backend strictly adheres to **Clean Architecture** (Onion/Hexagonal) principles with modular bounded contexts:

```text
backend/ContractManagement.sln
├── src/
│   ├── ContractManagement.Domain/                 # Pure domain: Entities, Enums, ValueObjects, Domain Events
│   ├── ContractManagement.Application/            # Application logic: DTOs, CQRS/Services, Interfaces, Mappings
│   ├── ContractManagement.Infrastructure/         # Persistence: EF Core, AppDbContext, Configurations, Repositories, External Services
│   └── ContractManagement.WebApi/                 # Presentation: REST Controllers, Middlewares, Program.cs, Swagger
└── tests/
    └── ContractManagement.Application.UnitTests/  # Unit tests for Domain & Application logic
```

### Layer Dependency Rules (Strict)
* **Domain** must NEVER depend on any other project or 3rd-party ORM.
* **Application** depends ONLY on **Domain**.
* **Infrastructure** depends on **Application** and **Domain**.
* **WebApi** depends on **Infrastructure** and **Application** (composition root).

---

## 2. Technology Stack

* **Backend**: .NET 9 (C# 13), Entity Framework Core (SQL Server), Swagger/OpenAPI.
* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React.
* **Storage & Messaging**: MinIO / S3 compatible, RabbitMQ (Phase 3).
* **Testing**: xUnit, FluentAssertions, Moq.

---

## 3. Coding Guidelines & Conventions

### C# & .NET Guidelines
1. **Naming Conventions**:
   * Classes, Records, Interfaces, Methods, Properties: `PascalCase` (Interfaces prefixed with `I`, e.g., `IContractService`).
   * Private fields: `camelCase` with leading underscore (e.g., `_dbContext`, `_currentUserService`).
   * Constants & Enum values: `PascalCase`.
2. **Asynchronous Programming**:
   * All I/O operations (database queries, network requests, file I/O) MUST be `async`/`await` and accept a `CancellationToken cancellationToken = default`.
3. **API Design**:
   * Controllers must be **thin**: No business logic, no direct EF Core operations in controllers.
   * Standardized API response format:
     ```csharp
     public class ApiResponse<T>
     {
         public bool Success { get; set; }
         public string Message { get; set; } = string.Empty;
         public T? Data { get; set; }
         public List<string> Errors { get; set; } = new();
     }
     ```
4. **No Boilerplate Junk**:
   * Never leave default templates like `WeatherForecast.cs` or unused files in production solutions.

---

## 4. Git Commit Message Conventions (Conventional Commits)

Every commit MUST follow the **Conventional Commits** specification:

```text
<type>(<scope>): <imperative English description>

[optional body]
```

### Commit Types:
* `feat`: A new feature for the user or system (e.g., `feat(contract): implement submit for approval transition`)
* `fix`: A bug fix (e.g., `fix(template): prevent duplicate placeholder replacement`)
* `refactor`: A code change that neither fixes a bug nor adds a feature (e.g., `refactor(domain): extract base entity with audit fields`)
* `style`: Changes that do not affect the meaning of the code (white-space, formatting, UI polish)
* `test`: Adding missing tests or correcting existing tests (e.g., `test(contract): add unit test for state machine transition`)
* `docs`: Documentation only changes (e.g., `docs: update daily report template and architecture diagram`)
* `chore`: Maintenance tasks, package updates, project scaffolding (e.g., `chore(backend): scaffold clean architecture solution`)

---

## 5. Development Workflow & Team Rules

1. **Branching Strategy**:
   * `main`: Production-ready release branch (Protected).
   * `develop`: Integration branch.
   * `feat/<feature-name>`: Feature branch (e.g., `feat/contract-approval`).
   * `fix/<bug-name>`: Bugfix branch.
2. **Database Migrations**:
   * Only Lead manages shared migrations to avoid migration conflicts.
   * Members declare entity classes and configurations in their bounded context.
3. **Daily Reporting**:
   * Follow the template in `docs/processes/DAILY_REPORT_TEMPLATE.md`.
