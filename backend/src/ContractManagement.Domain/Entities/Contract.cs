using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ContractManagement.Domain.Enums;

namespace ContractManagement.Domain.Entities;

[Table("CONTRACTS", Schema = "dbo")]
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

    [Column(TypeName = "decimal(18,2)")]
    public decimal Value { get; set; } = 0;

    public DateTime? SignedDate { get; set; }

    public DateTime EffectiveDate { get; set; }

    public DateTime ExpiryDate { get; set; }

    public ContractStatus Status { get; set; } = ContractStatus.Draft;

    [MaxLength(1000)]
    public string? FileUrl { get; set; }

    public Guid? ParentContractId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [Timestamp]
    public byte[]? RowVersion { get; set; }

    // Navigation properties
    [ForeignKey(nameof(ContractTypeId))]
    public ContractType? ContractType { get; set; }

    [ForeignKey(nameof(TemplateVersionUsedId))]
    public ContractTemplateVersion? TemplateVersionUsed { get; set; }

    [ForeignKey(nameof(ParentContractId))]
    public Contract? ParentContract { get; set; }

    public ICollection<Contract> Addendums { get; set; } = new List<Contract>();

    // -------------------------------------------------------------
    // STATE MACHINE LOGIC (Đóng gói kiểm tra điều kiện chuyển đổi)
    // -------------------------------------------------------------

    /// <summary>
    /// Gửi hợp đồng nháp lên quy trình phê duyệt
    /// </summary>
    public void SubmitForApproval()
    {
        if (Status != ContractStatus.Draft)
            throw new InvalidOperationException($"Chỉ hợp đồng ở trạng thái Nháp (Draft) mới có thể trình duyệt. Trạng thái hiện tại: {Status}");

        Status = ContractStatus.PendingApproval;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Được gọi khi nhận WorkflowApprovedEvent từ Người 4
    /// </summary>
    public void MarkAsApproved()
    {
        if (Status != ContractStatus.PendingApproval)
            throw new InvalidOperationException($"Chỉ hợp đồng đang chờ duyệt (PendingApproval) mới có thể phê duyệt. Trạng thái hiện tại: {Status}");

        Status = ContractStatus.Approved;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Được gọi khi nhận WorkflowRejectedEvent từ Người 4
    /// </summary>
    public void MarkAsRejected()
    {
        if (Status != ContractStatus.PendingApproval)
            throw new InvalidOperationException($"Chỉ hợp đồng đang chờ duyệt (PendingApproval) mới có thể từ chối. Trạng thái hiện tại: {Status}");

        Status = ContractStatus.Draft; // Quay về nháp để sửa lại
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Được gọi khi nhận ContractSignedEvent từ Người 4
    /// </summary>
    public void MarkAsSigned(DateTime signedDate)
    {
        if (Status != ContractStatus.Approved)
            throw new InvalidOperationException($"Chỉ hợp đồng đã phê duyệt (Approved) mới có thể ký. Trạng thái hiện tại: {Status}");

        SignedDate = signedDate;
        // Nếu ngày hiệu lực <= hiện tại thì tự động chuyển Active
        Status = (EffectiveDate <= DateTime.UtcNow) ? ContractStatus.Active : ContractStatus.Signed;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Kích hoạt hợp đồng khi đến ngày hiệu lực
    /// </summary>
    public void Activate()
    {
        if (Status != ContractStatus.Signed)
            throw new InvalidOperationException($"Chỉ hợp đồng đã ký (Signed) mới có thể kích hoạt hiệu lực. Trạng thái hiện tại: {Status}");

        Status = ContractStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Được gọi khi nhận ContractExpiredEvent từ Job của Người 5
    /// </summary>
    public void MarkAsExpiring()
    {
        if (Status == ContractStatus.Active)
        {
            Status = ContractStatus.Expiring;
            UpdatedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Đánh dấu hợp đồng gốc đã được gia hạn qua phụ lục
    /// </summary>
    public void MarkAsRenewed()
    {
        if (Status != ContractStatus.Active && Status != ContractStatus.Expiring)
            throw new InvalidOperationException($"Chỉ hợp đồng Active hoặc Expiring mới có thể gia hạn. Trạng thái hiện tại: {Status}");

        Status = ContractStatus.Renewed;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Thanh lý / Chấm dứt hợp đồng
    /// </summary>
    public void Terminate()
    {
        if (Status == ContractStatus.Terminated)
            throw new InvalidOperationException("Hợp đồng này đã được thanh lý trước đó.");

        Status = ContractStatus.Terminated;
        UpdatedAt = DateTime.UtcNow;
    }
}
