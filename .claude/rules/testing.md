# Testing Rules

## Testing Philosophy
Test early, test often, test thoroughly. Testing is not optional - it's an essential part of the development process that ensures quality, prevents regressions, and provides confidence in changes.

## Test Categories

### Unit Tests
**Purpose**: Test individual components in isolation
**Scope**: Single class or method, dependencies mocked/faked
**Speed**: Fast (should run in milliseconds)
**Frequency**: Run on every build, before every commit
**Location**: `tests/ContractManagement.UnitTests/`
**Guidelines**:
- Test one thing per test (ideal: 1-3 assertions per test)
- Use descriptive test names: `MethodName_StateUnderTest_ExpectedBehavior`
- Arrange-Act-Asset pattern clearly visible
- Mock external dependencies (databases, file system, network, external services)
- Test edge cases, boundary conditions, and error paths
- Do not test trivial getters/setters unless they contain logic
- Test public interfaces, not private implementation details
- Make tests deterministic and repeatable

### Integration Tests
**Purpose**: Test integration between components
**Scope**: Multiple working together (e.g., Application → Infrastructure → Database)
**Speed**: Slower than unit tests (seconds, not milliseconds)
**Frequency**: Run on every build, before every commit
**Location**: `tests/ContractManagement.IntegrationTests/`
**Guidelines**:
- Test real integrations (database, external services, etc.)
- Use test databases or in-memory providers when possible
- May use real external services in controlled test environments
- Clean up test data after tests
- Test critical paths and error scenarios
- Test transactional behavior when appropriate
- Test performance characteristics when relevant

### Contract Module Specific Tests
For Contract module work, ensure tests cover:
- Domain entity validation and business logic
- Status transitions (0-7) and business rules
- Workflow binding from template versions
- Approval integration points
- Contract lifecycle events
- Database mapping fidelity (match to database.sql)
- DTO ↔ Entity mapping
- Validation logic
- Use case orchestration
- API endpoint behavior
- Error handling and edge cases

## Test Naming Conventions

### General Format
```
[MethodName]_[StateUnderTest]_[ExpectedBehavior]
```

### Examples
- `SubmitContract_WhenDraft_ReturnsPendingApprovalStatus`
- `CalculateTotalValue_WithLineItems_ReturnsSumOfValues`
- `GetContractById_WhenNotFound_ReturnsNull`
- `ValidateContract_WhenMissingRequiredFields_ReturnsValidationErrors`
- `SubmitContract_WhenAlreadySubmitted_ThrowsInvalidOperationException`

### For Asynchronous Methods
- Append `Async` to method name in test name when testing async methods
- Example: `SubmitContractAsync_WhenDraft_ReturnsPendingApprovalStatusAsync`

### For Exception Testing
- Use `Throws` or `ThrowsAsync` in expected behavior
- Example: `SubmitContract_WhenAlreadyApproved_ThrowsInvalidOperationException`

### For Boundary Value Testing
- Indicate boundary values in state under test
- Example: `CalculateDiscount_WhenQuantityIs100_ReturnsTenPercentDiscount`
- Example: `ValidateAge_WhenAgeIs18_ReturnsValid` (minimum boundary)
- Example: `ValidateAge_WhenAgeIs17_ReturnsInvalid` (below minimum)

## Test Structure and Organization

### Test Project Structure
Mirror the source project structure:
```
tests/
├─ ContractManagement.UnitTests/
│  ├─ Domain/
│  │  ├─ Entities/
│  │  │  └─ ContractTests.cs
│  │  ├─ Services/
│  │  │  └─ ContractDomainServiceTests.cs
│  │  └─ ValueObjects/
│  │     └─ ContractNumberTests.cs
│  ├─ Application/
│  │  ├─ Features/
│  │  │  └─ Contracts/
│  │  │     ├─ SubmitContractHandlerTests.cs
│  │  │     └─ ValidateContractHandlerTests.cs
│  │  ├─ DTOs/
│  │  │  └─ ContractDtoTests.cs
│  │  ├─ Validators/
│  │  │  └─ ContractValidatorTests.cs
│  │  └─ Mapping/
│  │     └─ ContractProfileTests.cs
│  └─ Infrastructure/
│     ├─ Persistence/
│     │  └─ ContractConfigurationTests.cs
│     └─ Services/
│        └─ ContractServiceTests.cs
└─ ContractManagement.IntegrationTests/
   ├─ Database/
   │  └─ ContractRepositoryTests.cs
   └─ API/
      └─ ContractControllerTests.cs
```

### Test Class Organization
- One test file per class when reasonable
- Use nested classes for grouping related tests when helpful
- Use descriptive class names: `[ClassName]Tests`
- Separate public tests from test helpers/utilities
- Initialize shared test fixtures in class constructor or setup methods

### Test Method Organization
- Use `[Fact]` for parameterless tests (xUnit)
- Use `[Theory]` for data-driven tests
- Use `[InlineData]`, `[ClassData]`, `[MemberData]` for test data
- Group related tests using `[Trait]` when needed
- Keep test methods focused and readable

### AAA Pattern (Arrange-Act-Assert)
Clearly separate the three phases:
```csharp
[Fact]
public void SubmitContract_WhenDraft_ReturnsPendingApprovalStatus()
{
    // Arrange
    var contract = new Contract { Id = Guid.NewGuid(), Status = ContractStatus.Draft };
    var repository = Mock.Of<IContractRepository>();
    var mediator = Mock.Of<IMediator>();
    var handler = new SubmitContractHandler(repository, mediator);
    
    // Act
    var result = handler.Handle(new SubmitContractCommand { Id = contract.Id }, CancellationToken.None);
    
    // Assert
    Assert.Equal(ContractStatus.PendingApproval, contract.Status);
    // ... additional assertions
}
```

## Test Data Management

### Hard-Coded Values
- Avoid magic numbers in tests; use named constants
- Use meaningful strings that indicate purpose
- For IDs, use Guid.NewGuid() or specific known values when needed
- For dates, use specific dates or DateTime.UtcNow when appropriate
- Avoid DateTime.Now in tests (use DateTime.UtcNow for consistency)

### Test Data Builders
Consider using the Builder pattern for complex test objects:
```csharp
public class ContractTestBuilder
{
    private Guid _id = Guid.NewGuid();
    private string _contractNumber = "TEST-001";
    private Guid _contractTypeId = Guid.NewGuid();
    // ... other fields with defaults
    
    public ContractTestBuilder WithId(Guid id) { _id = id; return this; }
    public ContractTestBuilder WithContractNumber(string number) { _contractNumber = number; return this; }
    // ... other with methods
    
    public Contract Build() => new Contract
    {
        Id = _id,
        ContractNumber = _contractNumber,
        ContractTypeId = _contractTypeId,
        // ... other properties
    };
}
```

### Test Data Isolation
- Each test should manage its own data
- Avoid sharing mutable state between tests
- Clean up after tests that modify shared resources
- Use transactions that roll back after tests when testing against real databases
- Consider using `[Fixture]` or `[ClassFixture]` for expensive setup

## Mocking Guidelines

### What to Mock
- External dependencies (databases, file system, network, external services)
- Infrastructure services (email, SMS, payment gateways)
- Other application services when testing specific use cases
- Repositories when testing application layer
- Anything that makes tests slow, non-deterministic, or hard to setup

### What NOT to Mock
- Domain entities (unless they have external dependencies)
- Simple value objects
- Internal helper methods without external dependencies
- Stable, fast, deterministic dependencies
- Anything that would make the test an integration test in disguise

### Mocking Frameworks
- Use established mocking frameworks (Moq, NSubstitute, FakeItEasy, etc.)
- Prefer strict mocks when possible to catch unexpected calls
- Use loose mocks when flexibility is needed
- Verify interactions when behavior is important
- Don't over-verify; focus on outcomes, not just method calls

### Verification
- Verify calls when the interaction itself is the behavior being tested
- Prefer asserting on outcomes over verifying internal calls
- Use `Times.Once()` or `Times.Never()` when appropriate
- Avoid over-specifying interactions that make tests brittle
- Consider using `VerifyNoOtherCalls()` when appropriate

## Assertions Guidelines

### Assertion Frameworks
- Use built-in assertions from test framework (xUnit: Assert.)
- Consider using assertion libraries for richer assertions (FluentAssertions, Shouldly)
- Be consistent within project

### Effective Assertions
- Assert on outcomes, not implementation details
- Use specific assertions when available (Assert.Equal, Assert.True, etc.)
- Avoid boolean assertions when more specific ones exist (Assert.True(condition) vs Assert.Equal(true, condition))
- Use collection assertions for enumerables (Assert.Contains, Assert.Empty, etc.)
- Use exception assertions for testing error conditions
- Use precision assertions for floating point comparisons
- Use type assertions when checking object types

### Custom Assertions
Consider creating custom assertion methods for complex domain concepts:
```csharp
public static class ContractAssertions
{
    public static void HasStatus(this Contract contract, ContractStatus expected)
    {
        if (contract.Status != expected)
        {
            throw new Xunit.Sdk.EqualException(
                expected.ToString(),
                contract.Status.ToString(),
                $"Contract {contract.Id} has status {contract.Status}, expected {expected}"
            );
        }
    }
    
    public static void HasBeenSubmitted(this Contract contract)
    {
        if (contract.Status != ContractStatus.PendingApproval)
        {
            throw new Xunit.Sdk.EqualException(
                ContractStatus.PendingApproval.ToString(),
                contract.Status.ToString(),
                $"Contract {contract.Id} has status {contract.Status}, expected PendingApproval"
            );
        }
    }
}
```

## Test Coverage

### What to Test
- All public methods and properties with logic
- All branches in conditional statements
- All error and exception paths
- Edge cases and boundary values
- Integration points between layers
- Public APIs and endpoints
- Configuration and setup logic

### What May Be Excluded (with justification)
- Simple getters/setters without logic
- Trivial wrapper methods
- Platform-specific code that cannot be tested in unit test environment
- Code protected by external approval processes (rare)
- Third-party library code (test your integration with it, not the library itself)

### Coverage Goals
- Aim for high coverage on complex logic (80%+)
- Aim for reasonable coverage on simpler code (60%+)
- Focus on testing what matters most: business logic, error paths, integration points
- Do not pursue 100% coverage at the expense of meaningful tests
- Coverage is a guideline, not a rule - quality of tests matters more than percentage

## Contract-Specific Testing Rules

### Domain Entity Tests
- Test constructors and initialization
- Test property validation and invariants
- Test business logic methods
- Test domain event raising
- Test equality and comparison logic (for value objects)
- Test state transitions and business rules

### Repository Tests (when applicable)
- Test CRUD operations
- Test querying and filtering capabilities
- Test transactional behavior
- Test performance characteristics
- Test error handling and edge cases

### Service Tests
- Test use case orchestration
- Test validation integration
- Test transaction boundaries
- Test error handling and rollback
- Test interaction with repositories and other services

### Controller Tests
- Test HTTP status codes
- Test request/response formatting
- Test validation error handling
- Test authentication and authorization
- Test error responses and exception handling
- Test model binding and data transfer

### Mapping Tests
- Test property mapping in both directions
- Test handling of null values
- Test handling of default values
- Test handling of complex object graphs
- Test use of custom value resolvers when needed

### Validation Tests
- Test validation rules and error messages
- Test both valid and invalid inputs
- Test boundary values and edge cases
- Test complex validation logic
- Test asynchronous validation when applicable

### Event Tests
- Test event raising and subscription
- Test event data correctness
- Test event ordering when important
- Test event handling in subscribers

## Test Execution and Maintenance

### Running Tests
- Use `dotnet test` to run all tests
- Use test filters to run specific tests when needed
- Consider using watch mode during development (`dotnet test --filter "Name~Contract" --listen`)
- Run tests in isolation when troubleshooting
- Run full test suite before committing code

### Test Maintenance
- Keep tests up-to-date with code changes
- Update tests when requirements change
- Remove or update tests that test obsolete functionality
- Fix failing tests promptly - don't ignore them
- Treat test code with same respect as production code
- Refactor tests to improve readability and maintainability
- Eliminate test duplication when possible

### Test Environment
- Ensure consistent test environment across developers
- Use containerized dependencies when possible (database, services)
- Consider using testcontainers or similar technologies
- Document test environment setup requirements
- Use environment-specific configuration for tests

## Enforcement
These testing rules are enforced through:
- Mandatory `/test` command before committing code
- Code review (/review command) checking test quality and coverage
- Pull request requirements (must pass all tests)
- Team adherence to testing culture
- Automated test execution in CI/CD pipelines

## Contract-Specific Testing Requirements
Before considering Contract module work complete:
- [ ] Domain entities tested for validation and business logic
- [ ] Status transitions (0-7) tested with business rules
- [ ] Workflow binding tested from template versions
- [ ] Approval integration points tested
- [ ] Contract lifecycle events tested
- [ ] Database mapping verified against database.sql
- [ ] DTO ↔ Entity mapping tested
- [ ] Validation logic tested for all inputs
- [ ] Use cases tested for orchestration and error handling
- [ ] API endpoints tested for status codes and responses
- [ ] Error handling tested for edge cases
- [ ] Tests follow Arrange-Act-Assert pattern
- [ ] Test names are descriptive and follow conventions
- [ ] External dependencies are properly mocked
- [ ] Tests are deterministic and repeatable