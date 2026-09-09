# Coding Rules

## Language and Framework
- **Target Framework**: .NET 9.0 (net9.0) - ALL projects must target this version
- **Language Version**: C# 12 - Use latest language features appropriately
- **Framework**: ASP.NET Core Web API for API layer

## Naming Conventions

### General
- Use PascalCase for class names, method names, public properties
- Use camelCase for local variables, method parameters
- Use _camelCase for private fields (optional but consistent)
- Use UPPER_CASE for constants
- Use meaningful, descriptive names - avoid abbreviations unless widely understood (ID, OK, XML, JSON)

### Classes and Interfaces
- Classes: PascalCase (e.g., `ContractService`, `ContractEntity`)
- Interfaces: PascalCase with leading 'I' (e.g., `IContractService`, `IRepository<T>`)
- Attributes: PascalCase ending with 'Attribute' (e.g., `ValidateModelAttribute`)
- Enums: PascalCase (e.g., `ContractStatus`, `ApprovalDecision`)
- Exception classes: PascalCase ending with 'Exception' (e.g., `ContractNotFoundException`)

### Methods and Properties
- Methods: PascalCase (e.g., `CalculateTotalValue()`, `SubmitForApproval()`)
- Properties: PascalCase (e.g., `ContractNumber`, `TotalValue`)
- Boolean properties: Consider prefixing with Is, Has, Can, Should (e.g., `IsActive`, `HasApprovals`)
- Events: PascalCase ending with 'Event' (e.g., `ContractSubmittedEvent`)
- Event handlers: PascalCase ending with 'Handler' (e.g., `ContractSubmittedEventHandler`)

### Variables and Parameters
- Local variables: camelCase (e.g., `contractNumber`, `totalValue`)
- Method parameters: camelCase (e.g., `contractId`, `updateRequest`)
- Private fields: _camelCase (e.g., `_contractRepository`, `_mediator`) - optional but recommended for clarity

### Files and Namespaces
- Files: Match class name (e.g., `ContractService.cs` contains `ContractService` class)
- Namespaces: Follow folder structure (e.g., `ContractManagement.Application.Features.Contracts`)
- Use PascalCase for namespaces
- Organize namespaces: Company.Project.Layer[.Module][.Feature]

## Code Structure and Organization

### File Organization
- One public class per file (inner classes OK if closely related)
- Keep files under 500 lines when possible; split large classes
- Group related methods using regions sparingly (prefer partial classes or splitting)
- Use XML documentation for public APIs and complex logic

### Class Structure
1. Fields (private, readonly preferred)
2. Properties
3. Constructors
4. Public methods
5. Private methods
6. Events (if applicable)
7. Nested classes (if applicable)

### Method Guidelines
- Keep methods small and focused (single responsibility principle)
- Methods should generally be under 20-30 lines
- Use early returns to avoid deep nesting
- Prefer method extraction over long methods
- Mark methods as `static` when they don't use instance state
- Use `async`/`await` properly for asynchronous operations
- Avoid `async void` except for event handlers

### Control Flow
- Use guard clauses for early exits
- Prefer `foreach` over `for` when index not needed
- Use LINQ for readable queries (but be mindful of performance)
- Avoid `goto` and complex nested loops
- Use `switch` expressions in C# 8+ when appropriate
- Handle nulls appropriately with null-conditional operators

## Error Handling

### Exceptions
- Throw exceptions for exceptional conditions, not expected return values
- Create custom exception types for domain-specific errors
- Do not catch exceptions unless you can handle them meaningfully
- Log exceptions at appropriate levels (don't swallow and continue silently)
- Use `exception.Dispose()` pattern when applicable
- Preserve original exception stack trace when rethrowing: `throw;` not `throw ex;`

### Validation
- Validate input at boundaries (API controllers, service methods)
- Use FluentValidation for complex validation logic
- Validate domain invariants in entities and domain services
- Provide clear, user-friendly error messages
- Consider localization for user-facing messages

### Null Handling
- Enable nullable reference types (CS8600+) and treat warnings as errors
- Use null-conditional operators (`?.`) when appropriate
- Use null-coalescing operator (`??`) for default values
- Throw `ArgumentNullException` for null method parameters that are not allowed
- Avoid `null` checks when using nullable reference types properly

## API Design

### Controllers
- Keep controllers thin - delegate business logic to Application layer
- Use attribute routing: `[ApiController]`, `[Route("api/[controller]")]`
- Return appropriate HTTP status codes:
  - 200 OK - successful GET, PUT, PATCH
  - 201 Created - successful POST with location header
  - 204 No Content - successful DELETE
  - 400 Bad Request - client error, validation failure
  - 401 Unauthorized - authentication required
  - 403 Forbidden - authenticated but insufficient permissions
  - 404 Not Found - resource not found
  - 409 Conflict - resource conflict (e.g., duplicate)
  - 422 Unprocessable Entity - validation failure
  - 500 Internal Server Error - unexpected server error
- Use model binding and validation attributes appropriately
- Produce and consume JSON by default
- Version APIs when necessary (URL, header, or query parameter based)

### Responses
- Use consistent response formats when applicable
- Consider using envelopes/wrappers for API responses
- Return domain models or DTOs, not entities directly when possible
- Use appropriate serialization settings (camelCase for JSON properties)
- Handle circular references in JSON serialization appropriately

## Dependency Injection

### Service Registration
- Register interfaces with implementations, not concrete types
- Use appropriate lifetimes:
  - Transient: lightweight, stateless services
  - Scoped: DbContext, services with request-scoped state
  - Singleton: truly stateless, expensive-to-create, thread-safe services
- Avoid service locator pattern; prefer constructor injection
- Register open generic types when appropriate (e.g., `IValidator<T>`)

### Constructor Injection
- Prefer constructor injection over property injection
- Keep constructors focused on dependency injection
- Consider required vs optional dependencies
- Validate required dependencies are not null in constructor
- Use dependency injection for cross-cutting concerns (logging, caching)

## Testing Practices

### Test Naming
- Use descriptive test names that specify scenario and expected outcome
- Format: `MethodName_StateUnderTest_ExpectedBehavior`
- Example: `SubmitContract_WhenDraft_ReturnsPendingApprovalStatus`
- Use Given/When/Arrange-Act-Assert pattern in test names when helpful

### Test Organization
- Test project structure mirrors source project structure
- One test file per class when reasonable
- Group related tests using nested classes or descriptive names
- Separate unit tests from integration tests in different projects

### Unit Tests
- Test one thing per test (assertion count guideline: 1-3 per test)
- Mock external dependencies (use Moq, NSubstitute, etc.)
- Test public interfaces, not private implementation details
- Test edge cases, boundary conditions, and error paths
- Make tests deterministic and repeatable
- Keep tests fast - avoid sleeps, file I/O, network calls in unit tests
- Use Arrange-Act-Assert pattern clearly

### Integration Tests
- Test integration points (database, external services, etc.)
- Use test databases or in-memory providers when possible
- Clean up test data after tests
- May be slower than unit tests - acceptable for integration validation
- Test critical paths and error scenarios

### Test Data
- Use realistic but anonymized test data
- Avoid hard-coded magic numbers; use named constants
- Consider using test data builders or factories for complex objects
- Reset state between tests when using shared resources

## Code Quality

### Formatting
- Use editorconfig and IDE formatting settings consistently
- Prefer 4 spaces for indentation (not tabs)
- Limit line length to 100-120 characters (configurable based on team preference)
- Use blank lines to separate logical sections in methods
- Align related assignments vertically when it improves readability

### Comments
- Write self-documenting code; comments should explain why, not what
- Keep comments up-to-date; outdated comments are worse than no comments
- Use XML documentation for public APIs and complex logic
- Use // for short comments, /* */ for multi-line comments when needed
- TODO comments: Include ticket/reference and target resolution date
- FIXME comments: Indicate known issues that need attention

### Magic Numbers and Strings
- Replace magic numbers with named constants or enums
- Replace magic strings with constants or configuration
- Use resource files for user-facing strings when localization needed
- Avoid connection strings or secrets in code; use configuration

### Performance
- Avoid premature optimization; measure before optimizing
- Be aware of common performance pitfalls (e.g., excessive LINQ, boxing)
- Use appropriate collection types for the use case
- Consider async/await for I/O-bound operations
- Watch for excessive memory allocations in hot paths
- Use caching appropriately for expensive, repeatable operations

### Security
- Validate and sanitize all external input
- Use parameterized queries or ORM to prevent SQL injection
- Implement proper authentication and authorization
- Hash passwords using approved algorithms (bcrypt, PBKDF2, Argon2)
- Protect sensitive data in memory and transit
- Follow OWASP guidelines for web application security
- Keep dependencies updated to address security vulnerabilities

## Contract-Specific Coding Rules

### Entity Framework Core
- Use Fluent API in EntityTypeConfiguration classes for configuration
- Match database.sql exactly: column names, types, constraints, indexes
- Use [Column] attribute only when property name differs from column name
- Use [Key] for primary keys, [ForeignKey] for foreign keys
- Use [Required] for NOT NULL columns, [MaxLength] for length limits
- Use [Precision] for decimal types, [DatabaseGenerated] for identity
- Implement RowVersion for optimistic concurrency tokens
- Never add shadow properties or unmapped columns without explicit need
- Ignore columns only if computed or not in entity (use [NotMapped])

### Domain Entities
- Keep entities focused on business logic and state
- Validate invariants in constructors and property setters
- Raise domain events for state changes
- Make navigation properties virtual only if needed for lazy loading
- Consider using private setters with methods for state changes
- Implement equality logic when appropriate (value objects)

### DTOs
- Use DTOs for data transfer between layers and across network
- Flatten complex object graphs when appropriate for API consumers
- Exclude sensitive data from DTOs (passwords, internal IDs)
- Use AutoMapper for entity↔DTO mapping when mappings are straightforward
- Validate DTOs when they cross trust boundaries (API input)

### Services and Interfaces
- Define service contracts based on use cases, not database tables
- Keep interfaces focused and cohesive (Interface Segregation Principle)
- Name services based on what they do, not what they contain (e.g., `IContractManagementService`)
- Avoid bloated interfaces; prefer multiple specific interfaces
- Consider async signatures for I/O-bound operations

### Validation
- Use FluentValidation for complex validation logic
- Validate domain invariants in entities and domain services
- Validate application input at service boundaries
- Consider client-side validation duplication for user experience
- Never rely solely on client-side validation for security

## Enforcement
These coding rules are enforced through:
- Code review (/review command)
- Pull request checks
- IDE warnings and errors (nullable reference types, etc.)
- Team adherence and pair programming when beneficial
- Automated formatting and analysis tools (if configured)

## Exceptions
Any exceptions to these rules must be:
- Documented with clear justification
- Approved through team consensus or architecture review
- Rare and well-justified
- Not become a pattern without proper review