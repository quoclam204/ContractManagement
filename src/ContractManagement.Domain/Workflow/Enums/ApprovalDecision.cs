namespace ContractManagement.Domain.Workflow.Enums;

/// <summary>
/// Quyết định phê duyệt: 0=Pending, 1=Approved, 2=Rejected
/// Khớp với CHECK constraint CK_APPROVAL_STEPS_Decision
/// </summary>
public enum ApprovalDecision : byte
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}
