using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace be_contractmgmt.Models;

[Table("CONTRACT_TEMPLATE_VERSIONS", Schema = "dbo")]
public class ContractTemplateVersion
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ContractTypeId { get; set; }

    public int Version { get; set; } = 1;

    [MaxLength(1000)]
    public string? TemplateFileUrl { get; set; }

    public string? ContentJson { get; set; }

    public Guid? WorkflowDefinitionId { get; set; }

    public bool IsActive { get; set; } = true;

    [Required]
    public Guid CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(ContractTypeId))]
    public ContractType? ContractType { get; set; }
}
