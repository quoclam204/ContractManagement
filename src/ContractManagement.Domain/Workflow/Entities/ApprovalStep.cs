using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ContractManagement.Domain.Workflow.Enums;

namespace ContractManagement.Domain.Workflow.Entities;

/// <summary>
/// Bảng APPROVAL_STEPS: Bước phê duyệt thực tế (runtime snapshot của Workflow áp dụng cho hợp đồng)
/// </summary>
[Table("APPROVAL_STEPS")]
public class ApprovalStep
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ContractId { get; set; }

    [Required]
    public Guid WorkflowDefinitionId { get; set; }

    [Required]
    public Guid ApproverId { get; set; }

    [Required]
    public int StepOrder { get; set; }

    public ApprovalDecision Decision { get; set; } = ApprovalDecision.Pending;

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public DateTime? DecidedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey(nameof(WorkflowDefinitionId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual WorkflowDefinition WorkflowDefinition { get; set; } = null!;
}
