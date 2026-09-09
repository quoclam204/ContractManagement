# Coding Rules

## Follow Existing Conventions
- Adhere to the coding style and patterns used in the Workflow module.
- Use the same naming conventions for entities, DTOs, interfaces, and services.

## Avoid Unnecessary Abstractions
- Do not add layers of abstraction without clear benefit.
- Prefer simple, direct implementations over overly generic ones.
- Do not introduce duplicate services, entities, or interfaces that already exist.

## Use Async EF Core APIs
- Always use asynchronous Entity Framework Core methods (e.g., `ToListAsync`, `FirstOrDefaultAsync`).
- Avoid blocking calls like `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()`.

## Controllers
- Keep API controllers thin; they should only handle HTTP concerns and delegate to Application layer.
- Do not place business logic in controllers.

## Business Rules
- Keep business and application rules in the Application layer (use cases, services) or Domain layer (domain services, entities).
- Do not place business logic in Infrastructure or API layers unnecessarily.

## Dependency Injection
- Use dependency injection consistently for services, repositories, and other dependencies.
- Avoid static or singleton service access unless absolutely necessary.

## Refactoring
- Do not perform unrelated refactoring (e.g., formatting, renaming) in the same commit as functional changes.
- Do not modify unrelated files.

## Naming
- Follow .NET naming conventions (PascalCase for public members, camelCase for private).
- Use descriptive names for methods, variables, and classes.
