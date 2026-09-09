using MediatR;

namespace ContractManagement.Application.Workflow.Events;

/// <summary>
/// Sự kiện bắn ra khi hợp đồng đã hoàn tất phê duyệt qua tất cả các bước (Pass)
/// Module Contract (Người 2) sẽ lắng nghe sự kiện này để đổi trạng thái hợp đồng sang Approved
/// </summary>
/// <param name="ContractId">ID của hợp đồng được phê duyệt</param>
public record WorkflowApprovedEvent(Guid ContractId) : INotification;
