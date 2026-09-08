# Agent Instructions - Contract Management System

This repository follows strict Enterprise Software Engineering standards.
When prompted to write or modify code:
1. Verify layer boundaries:
   - Domain: Entities, Enums, Interfaces only.
   - Application: CQRS, DTOs, Use Case Handlers, FluentValidation.
   - Infrastructure: DbContext, EF Core mappings, Repositories, External services.
   - WebApi: Controllers, Middleware, Dependency Injection setup.
2. Commit message format: `<type>(<scope>): <message in English>`.
3. Do not generate unused boilerplate code (e.g., WeatherForecast).
4. Reference [CLAUDE.md](CLAUDE.md) for detailed guidelines.
