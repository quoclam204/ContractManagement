using ContractManagement.Application.Common.Messaging;
using ContractManagement.Application.Events.Identity;
using ContractManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ContractManagement.Api.Controllers;

/// <summary>
/// Demo controller for testing/demonstrating RabbitMQ message publishing.
/// </summary>
[ApiController]
[Route("api/demo")]
[Tags("Demo")]
public class DemoController : ControllerBase
{
    private const string ExchangeName = "notification_exchange";
    private const string RoutingKey = "user.registered";

    private readonly IMessagePublisher _messagePublisher;
    private readonly ContractManagementDbContext _dbContext;

    public DemoController(
        IMessagePublisher messagePublisher,
        ContractManagementDbContext dbContext)
    {
        _messagePublisher = messagePublisher;
        _dbContext = dbContext;
    }

    /// <summary>
    /// Publishes a UserRegisteredEvent to RabbitMQ to demonstrate end-to-end notification delivery.
    /// Ensures the UserId exists in dbo.USERS to satisfy the FK_NOTIFICATIONS_USERS constraint.
    /// </summary>
    /// <param name="userId">Optional explicit UserId. If not provided or empty, uses an existing user from dbo.USERS or creates a demo user.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generated/selected UserId and published status.</returns>
    [HttpPost("publish-user-registered")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> PublishUserRegistered([FromQuery] Guid? userId, CancellationToken cancellationToken)
    {
        var targetUserId = userId.HasValue && userId.Value != Guid.Empty
            ? userId.Value
            : await GetOrCreateDemoUserIdAsync(cancellationToken);

        var @event = new UserRegisteredEvent(targetUserId);

        await _messagePublisher.PublishAsync(ExchangeName, RoutingKey, @event, cancellationToken);

        return Ok(new
        {
            message = "UserRegisteredEvent published successfully",
            userId = targetUserId,
            exchange = ExchangeName,
            routingKey = RoutingKey
        });
    }

    private async Task<Guid> GetOrCreateDemoUserIdAsync(CancellationToken cancellationToken)
    {
        try
        {
            // 1. Try to find any existing user in dbo.USERS
            var existingUserId = await _dbContext.Database
                .SqlQueryRaw<Guid>("SELECT TOP 1 Id FROM dbo.USERS")
                .FirstOrDefaultAsync(cancellationToken);

            if (existingUserId != Guid.Empty)
            {
                return existingUserId;
            }

            // 2. If no user exists in database, insert a demo user into dbo.USERS
            var newUserId = Guid.NewGuid();
            var email = $"demo_{newUserId:N}@example.com";

            await _dbContext.Database.ExecuteSqlRawAsync(
                "INSERT INTO dbo.USERS (Id, FullName, Email, PasswordHash, Role) VALUES ({0}, {1}, {2}, {3}, {4})",
                newUserId, "Demo User", email, "demo_hash", (byte)2, cancellationToken);

            return newUserId;
        }
        catch
        {
            // Fallback for environments without relational database access (e.g. unit tests with in-memory DbContext)
            return Guid.NewGuid();
        }
    }
}
