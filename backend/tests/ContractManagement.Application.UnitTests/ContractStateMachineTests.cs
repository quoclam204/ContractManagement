using ContractManagement.Domain.Entities;
using ContractManagement.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace ContractManagement.Application.UnitTests;

public class ContractStateMachineTests
{
    [Fact]
    public void SubmitForApproval_WhenStatusIsDraft_ShouldTransitionToPendingApproval()
    {
        // Arrange
        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            Title = "Test Contract",
            Status = ContractStatus.Draft
        };

        // Act
        contract.SubmitForApproval();

        // Assert
        contract.Status.Should().Be(ContractStatus.PendingApproval);
        contract.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SubmitForApproval_WhenStatusIsNotDraft_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            Title = "Test Contract",
            Status = ContractStatus.Approved
        };

        // Act
        var act = () => contract.SubmitForApproval();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Chỉ hợp đồng ở trạng thái Nháp (Draft) mới có thể trình duyệt*");
    }

    [Fact]
    public void MarkAsApproved_WhenStatusIsPendingApproval_ShouldTransitionToApproved()
    {
        // Arrange
        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            Status = ContractStatus.PendingApproval
        };

        // Act
        contract.MarkAsApproved();

        // Assert
        contract.Status.Should().Be(ContractStatus.Approved);
        contract.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void MarkAsRejected_WhenStatusIsPendingApproval_ShouldRevertToDraft()
    {
        // Arrange
        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            Status = ContractStatus.PendingApproval
        };

        // Act
        contract.MarkAsRejected();

        // Assert
        contract.Status.Should().Be(ContractStatus.Draft);
        contract.UpdatedAt.Should().NotBeNull();
    }
}
