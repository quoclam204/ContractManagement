using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ContractManagement.Domain.Contract.Entities;

/// <summary>
/// Bảng CONTRACT_TYPES: Danh mục loại hợp đồng
/// </summary>
[Table("CONTRACT_TYPES")]
public class ContractType
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<ContractTemplateVersion> ContractTemplateVersions { get; set; } = new List<ContractTemplateVersion>();
    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}
