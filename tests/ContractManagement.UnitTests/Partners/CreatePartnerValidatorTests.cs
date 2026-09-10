using ContractManagement.Application.Features.Partners;
using ContractManagement.Application.Features.Partners.Validators;
using FluentAssertions;
using FluentValidation.TestHelper;
using Xunit;

namespace ContractManagement.UnitTests.Partners;

public class CreatePartnerValidatorTests
{
    private readonly CreatePartnerValidator _validator = new();

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    [InlineData("123456789")] // 9 ký tự (< 10)
    [InlineData("123456789012345")] // 15 ký tự (> 14)
    public void CreatePartnerValidator_InvalidTaxCode_ShouldHaveValidationError(string? taxCode)
    {
        // Arrange
        var command = new CreatePartnerCommand
        {
            Name = "Công ty TNHH ABC",
            TaxCode = taxCode!,
            ContactEmail = "contact@abc.vn",
            Representative = "Nguyễn Văn A",
            Address = "Hà Nội"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.TaxCode);
    }

    [Theory]
    [InlineData("not-an-email")]
    [InlineData("plainaddress")]
    [InlineData("@missingusername.com")]
    [InlineData("missingdomain@")]
    [InlineData("")]
    public void CreatePartnerValidator_InvalidEmail_ShouldHaveValidationError(string email)
    {
        // Arrange
        var command = new CreatePartnerCommand
        {
            Name = "Công ty TNHH ABC",
            TaxCode = "0101234567",
            ContactEmail = email,
            Representative = "Nguyễn Văn A",
            Address = "Hà Nội"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ContactEmail);
    }

    [Fact]
    public void CreatePartnerValidator_ValidData_ShouldNotHaveAnyValidationErrors()
    {
        // Arrange
        var command = new CreatePartnerCommand
        {
            Name = "Công ty TNHH ABC",
            TaxCode = "0101234567",
            ContactEmail = "contact@abc.vn",
            Representative = "Nguyễn Văn A",
            Address = "Hà Nội"
        };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
