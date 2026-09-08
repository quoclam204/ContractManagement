using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ContractManagement.Domain.Workflow.Entities;

/// <summary>
/// Bảng WORKFLOW_DEFINITIONS: Cấu hình luồng duyệt
/// Độc lập với CONTRACT_TYPES, được gắn vào từng phiên bản Template hoặc điều kiện giá trị hợp đồng
/// </summary>
[Table("WORKFLOW_DEFINITIONS")]
public class WorkflowDefinition
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ConditionExpression { get; set; } // Ví dụ: "Value >= 500000000"

    public int Version { get; set; } = 1;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<WorkflowStep> WorkflowSteps { get; set; } = new List<WorkflowStep>();
    public virtual ICollection<ApprovalStep> ApprovalSteps { get; set; } = new List<ApprovalStep>();
}
