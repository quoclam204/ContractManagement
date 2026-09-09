using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ContractManagement.Domain.Contract.Entities;

/// <summary>
/// Bảng CONTRACTS: Lưu trữ thông tin hợp đồng
/// </summary>
[Table("CONTRACTS")]
public class Contract
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(50)]
    public string ContractNumber { get; set; } = string.Empty;

    [Required]
    public Guid ContractTypeId { get; set; }

    [Required]
    public Guid TemplateVersionUsedId { get; set; }

    [Required]
    public Guid PartnerId { get; set; }

    [Required]
    public Guid OwnerId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public decimal Value { get; set; } = 0;

    public DateTime? SignedDate { get; set; }

    [Required]
    public DateTime EffectiveDate { get; set; }

    [Required]
    public DateTime ExpiryDate { get; set; }

    [Required]
    public byte Status { get; set; } = 0; // 0=Draft, 1=PendingApproval, 2=Approved, 3=Signed, 4=Active, 5=Expiring, 6=Renewed, 7=Terminated

    [MaxLength(1000)]
    public string? FileUrl { get; set; }

    public Guid? ParentContractId { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [Timestamp] // RowVersion for optimistic concurrency
    public byte[] RowVersion { get; set; } = null!;

    // Navigation properties
    [ForeignKey(nameof(ContractTypeId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual ContractType ContractType { get; set; } = null!;

    [ForeignKey(nameof(TemplateVersionUsedId))]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual ContractTemplateVersion TemplateVersionUsed { get; set; } = null!;

    // TODO: Add Partner and Owner navigation properties when Partner and User modules are implemented
    // TODO: Add ParentContract navigation property when Contract module relationship is fully implemented
}
