# Contract Management System (CLM) - Backend Engineering & AI Constitution

## 1. System Architecture: Clean Architecture (.NET 9 / C# 13)
The solution `backend/ContractManagement.sln` follows strict Clean Architecture:
- `ContractManagement.Domain`: Entities, Enums, State Machine logic. Zero external dependencies.
- `ContractManagement.Application`: CQRS/Services, DTOs, `IAppDbContext`, `ApiResponse<T>`, FluentValidation.
- `ContractManagement.Infrastructure`: EF Core 9, `AppDbContext`, SQL Server, Repositories, MinIO, Hangfire.
- `ContractManagement.WebApi`: Thin REST Controllers, Dependency Injection, Middlewares, Swagger/OpenAPI.
- `ContractManagement.Application.UnitTests`: xUnit tests for Domain & Application logic.

## 2. Strict Rules for AI & Developers
1. **Spec-Driven**: Always read task specifications in `docs/tasks/` and database schema in `docs/database/database.sql` before generating code.
2. **State Machine Rule**: Never modify `Contract.Status` directly. Always invoke domain methods in `Contract.cs` (`SubmitForApproval()`, `MarkAsApproved()`, `MarkAsRejected()`, etc.).
3. **Coding Standards**:
   - Async/await with `CancellationToken cancellationToken = default` for all I/O.
   - Return standard `ApiResponse<T>` from all API endpoints.
   - PascalCase for types/methods, `_camelCase` for private fields.
   - Zero boilerplate tolerance: Never generate `WeatherForecast`, dummy classes, or empty TODOs.

## 3. Git Commit Convention (Conventional Commits)
Format: `<type>(<scope>): <short imperative description in English>`
- `feat`: New business feature
- `fix`: Bug fix
- `refactor`: Architectural or code restructuring without feature change
- `test`: Adding or updating tests
- `docs`: Documentation updates
- `chore`: Tooling, build scripts, dependencies
