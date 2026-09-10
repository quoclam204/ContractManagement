using ContractManagement.Application.Common.Behaviors;
using ContractManagement.Application.Features.Partners;
using ContractManagement.Application.Features.Partners.Validators;
using ContractManagement.Infrastructure.Persistence;
using FluentAssertions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ContractManagement.UnitTests.Partners;

public class PartnerHandlerTests
{
    private static ContractManagementDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ContractManagementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ContractManagementDbContext(options);
    }

    [Fact]
    public async Task CreatePartnerCommand_ValidData_ShouldCreateSuccessfully()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var handler = new CreatePartnerCommandHandler(context);

        var command = new CreatePartnerCommand
        {
            Name = "Công ty Cổ phần Công nghệ Mới",
            TaxCode = "0109876543",
            Representative = "Trần Thị B",
            ContactEmail = "partner@newtech.com",
            Address = "123 Đường Cầu Giấy, Hà Nội"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().NotBeEmpty();
        result.Name.Should().Be(command.Name);
        result.TaxCode.Should().Be(command.TaxCode);
        result.Representative.Should().Be(command.Representative);
        result.ContactEmail.Should().Be(command.ContactEmail);
        result.Address.Should().Be(command.Address);

        var partnerInDb = await context.Partners.FirstOrDefaultAsync(p => p.Id == result.Id);
        partnerInDb.Should().NotBeNull();
        partnerInDb!.Name.Should().Be(command.Name);
    }

    [Fact]
    public async Task GetPartnerById_WhenNotFound_ShouldReturnNullOrThrowNotFound()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var handler = new GetPartnerByIdQueryHandler(context);
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await handler.Handle(new GetPartnerByIdQuery(nonExistentId), CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ValidationBehavior_WhenInvalidCommand_ShouldThrowValidationException()
    {
        // Arrange
        var validator = new CreatePartnerValidator();
        var validators = new List<IValidator<CreatePartnerCommand>> { validator };
        var behavior = new ValidationBehavior<CreatePartnerCommand, PartnerDto>(validators);

        var invalidCommand = new CreatePartnerCommand
        {
            Name = "", // Empty name
            TaxCode = "123", // Too short
            ContactEmail = "invalid-email"
        };

        // Act
        var act = async () => await behavior.Handle(
            invalidCommand,
            () => Task.FromResult(new PartnerDto()),
            CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ValidationException>()
            .Where(ex => ex.Errors.Count() >= 3);
    }
}
