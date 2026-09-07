using be_contractmgmt.Services.Workflow.DTOs;

namespace be_contractmgmt.Services.Workflow;

/// <summary>
/// Interface dịch vụ xử lý đệ trình duyệt và ra quyết định phê duyệt hợp đồng
/// </summary>
public interface IApprovalService
{
    /// <summary>
    /// Đệ trình hợp đồng vào tiến trình phê duyệt
    /// Tự động xác định luồng duyệt nếu chưa chỉ định và sinh snapshot các bước trong APPROVAL_STEPS
    /// </summary>
    Task<ContractApprovalProgressDto> SubmitForApprovalAsync(SubmitContractApprovalRequest request);

    /// <summary>
    /// Ra quyết định phê duyệt (Approve) hoặc từ chối (Reject) cho một bước duyệt
    /// Tự động phát sự kiện WorkflowApprovedEvent hoặc WorkflowRejectedEvent qua MediatR
    /// </summary>
    Task<ContractApprovalProgressDto> ProcessDecisionAsync(ProcessApprovalDecisionRequest request);

    /// <summary>
    /// Lấy toàn bộ thông tin tiến trình và lịch sử duyệt của một hợp đồng
    /// </summary>
    Task<ContractApprovalProgressDto?> GetProgressByContractIdAsync(Guid contractId);

    /// <summary>
    /// Lấy danh sách các bước duyệt đang chờ thực hiện (dành cho màn hình danh sách chờ duyệt)
    /// </summary>
    Task<List<PendingApprovalItemDto>> GetPendingApprovalsAsync(Guid? approverId = null);
}
