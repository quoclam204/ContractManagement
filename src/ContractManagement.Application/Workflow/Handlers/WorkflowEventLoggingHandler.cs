using ContractManagement.Application.Workflow.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ContractManagement.Application.Workflow.Handlers;

/// <summary>
/// Event Handler ghi log khi có sự kiện duyệt hoàn tất hoặc từ chối
/// Trong thực tế, Người 2 (Contract Module) sẽ tạo một Handler riêng để cập nhật trạng thái hợp đồng sang Approved hoặc Rejected.
/// </summary>
public class WorkflowEventLoggingHandler : 
    INotificationHandler<WorkflowApprovedEvent>,
    INotificationHandler<WorkflowRejectedEvent>
{
    private readonly ILogger<WorkflowEventLoggingHandler> _logger;

    public WorkflowEventLoggingHandler(ILogger<WorkflowEventLoggingHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WorkflowApprovedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "====> [EVENT RECEIVED: WorkflowApprovedEvent] Hợp đồng {ContractId} đã được phê duyệt qua tất cả các bước thành công! Người 2 sẽ chuyển Status sang Approved. <====",
            notification.ContractId);

        return Task.CompletedTask;
    }

    public Task Handle(WorkflowRejectedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "====> [EVENT RECEIVED: WorkflowRejectedEvent] Hợp đồng {ContractId} đã bị TỪ CHỐI phê duyệt! Lý do: '{Reason}'. Người 2 sẽ chuyển Status sang Draft/Rejected. <====",
            notification.ContractId, notification.Reason);

        return Task.CompletedTask;
    }
}
