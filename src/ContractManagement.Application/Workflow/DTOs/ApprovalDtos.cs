using ContractManagement.Domain.Workflow.Enums;

namespace ContractManagement.Application.Workflow.DTOs;

public class SubmitContractApprovalRequest
{
    public Guid ContractId { get; set; }
    public decimal ContractValue { get; set; }
    public Guid? WorkflowDefinitionId { get; set; }
    public Guid? ApproverId { get; set; }
}

public class ProcessApprovalDecisionRequest
{
    public Guid ApprovalStepId { get; set; }
    public Guid ApproverId { get; set; }
    public ApprovalDecision Decision { get; set; }
    public string? Comment { get; set; }
}

public class ApprovalStepDetailDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Guid WorkflowDefinitionId { get; set; }
    public int StepOrder { get; set; }
    public ApproverRole ApproverRole { get; set; }
    public string ApproverRoleName => ApproverRole.ToString();
    public Guid ApproverId { get; set; }
    public ApprovalDecision Decision { get; set; }
    public string DecisionName => Decision.ToString();
    public string? Comment { get; set; }
    public DateTime? DecidedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ContractApprovalProgressDto
{
    public Guid ContractId { get; set; }
    public Guid WorkflowDefinitionId { get; set; }
    public string WorkflowName { get; set; } = string.Empty;
    public int WorkflowVersion { get; set; }
    public string OverallStatus { get; set; } = "Pending"; // Pending, Approved, Rejected
    public int? CurrentPendingStepOrder { get; set; }
    public int TotalSteps { get; set; }
    public int ApprovedStepsCount { get; set; }
    public List<ApprovalStepDetailDto> Steps { get; set; } = new();
}

public class PendingApprovalItemDto
{
    public Guid ApprovalStepId { get; set; }
    public Guid ContractId { get; set; }
    public Guid WorkflowDefinitionId { get; set; }
    public string WorkflowName { get; set; } = string.Empty;
    public int StepOrder { get; set; }
    public ApproverRole ApproverRole { get; set; }
    public string ApproverRoleName => ApproverRole.ToString();
    public Guid ApproverId { get; set; }
    public DateTime CreatedAt { get; set; }
}
