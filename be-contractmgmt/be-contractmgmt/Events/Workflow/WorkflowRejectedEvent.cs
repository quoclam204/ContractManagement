using MediatR;

namespace be_contractmgmt.Events.Workflow;

/// <summary>
/// Sự kiện bắn ra khi hợp đồng bị từ chối ở bất kỳ bước duyệt nào (Reject)
/// Module Contract (Người 2) sẽ lắng nghe sự kiện này để đổi trạng thái hợp đồng về Draft/Rejected
/// </summary>
/// <param name="ContractId">ID của hợp đồng bị từ chối</param>
/// <param name="Reason">Lý do từ chối phê duyệt</param>
public record WorkflowRejectedEvent(Guid ContractId, string? Reason) : INotification;
