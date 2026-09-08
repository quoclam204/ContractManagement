using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ContractManagement.Domain.Entities;

[Table("CONTRACT_TYPES", Schema = "dbo")]
public class ContractType
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<ContractTemplateVersion> TemplateVersions { get; set; } = new List<ContractTemplateVersion>();
    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}
