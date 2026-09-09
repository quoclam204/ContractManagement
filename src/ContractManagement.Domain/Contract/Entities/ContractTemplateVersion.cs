using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ContractManagement.Domain.Workflow.Entities;

namespace ContractManagement.Domain.Contract.Entities;

/// <summary>
/// Bảng CONTRACT_TEMPLATE_VERSIONS: Phiên bản mẫu hợp đồng
/// Mỗi phiên bản thuộc về một loại hợp đồng và có thể gắn với một workflow definition
/// </summary>
[Table("CONTRACT_TEMPLATE_VERSIONS")]
public class ContractTemplateVersion
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ContractTypeId { get; set; }

    [Required]
    public int Version { get; set; }

    [MaxLength(1000)]
    public string? TemplateFileUrl { get; set; }

    [MaxLength(-1)] // NVARCHAR(MAX)
    public string? ContentJson { get; set; } // Lưu trữ JSON cấu trúc trường/diều khoản của mẫu

    public Guid? WorkflowDefinitionId { get; set; } // FK tới WORKFLOW_DEFINITIONS

    [Required]
    public bool IsActive { get; set; } = true;

    [Required]
    public Guid CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(ContractTypeId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual ContractType ContractType { get; set; } = null!;

    [ForeignKey(nameof(WorkflowDefinitionId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual WorkflowDefinition? WorkflowDefinition { get; set; }

    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}
