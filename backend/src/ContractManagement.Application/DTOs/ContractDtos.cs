using System.ComponentModel.DataAnnotations;
using ContractManagement.Domain.Enums;

namespace ContractManagement.Application.DTOs;

public class CreateContractDraftRequest
{
    [Required(ErrorMessage = "Tiêu đề hợp đồng không được để trống")]
    [MaxLength(500, ErrorMessage = "Tiêu đề hợp đồng tối đa 500 ký tự")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mã loại hợp đồng không được để trống")]
    public Guid ContractTypeId { get; set; }

    /// <summary>
    /// Bản mẫu đã dùng. Nếu để trống, hệ thống sẽ tự chọn bản mẫu IsActive = true mới nhất của loại hợp đồng đó.
    /// </summary>
    public Guid? TemplateVersionUsedId { get; set; }

    /// <summary>
    /// ID đối tác (khách hàng). Nếu để trống, hệ thống sẽ gán đối tác mẫu mặc định
    /// </summary>
    public Guid? PartnerId { get; set; }

    [Range(0, 100_000_000_000_000, ErrorMessage = "Giá trị hợp đồng phải lớn hơn hoặc bằng 0")]
    public decimal Value { get; set; } = 0;

    [Required(ErrorMessage = "Ngày hiệu lực không được để trống")]
    public DateTime EffectiveDate { get; set; }

    [Required(ErrorMessage = "Ngày hết hạn không được để trống")]
    public DateTime ExpiryDate { get; set; }

    [MaxLength(1000)]
    public string? FileUrl { get; set; }
}

public class UpdateContractDraftRequest
{
    [Required(ErrorMessage = "Tiêu đề hợp đồng không được để trống")]
    [MaxLength(500, ErrorMessage = "Tiêu đề hợp đồng tối đa 500 ký tự")]
    public string Title { get; set; } = string.Empty;

    [Range(0, 100_000_000_000_000, ErrorMessage = "Giá trị hợp đồng phải lớn hơn hoặc bằng 0")]
    public decimal Value { get; set; } = 0;

    [Required(ErrorMessage = "Ngày hiệu lực không được để trống")]
    public DateTime EffectiveDate { get; set; }

    [Required(ErrorMessage = "Ngày hết hạn không được để trống")]
    public DateTime ExpiryDate { get; set; }

    [MaxLength(1000)]
    public string? FileUrl { get; set; }
}

public class ContractListItemResponseDto
{
    public Guid Id { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public Guid ContractTypeId { get; set; }
    public string ContractTypeName { get; set; } = string.Empty;
    public Guid PartnerId { get; set; }
    public string PartnerName { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public DateTime EffectiveDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public ContractStatus Status { get; set; }
    public string StatusName => Status switch
    {
        ContractStatus.Draft => "Bản nháp",
        ContractStatus.PendingApproval => "Chờ phê duyệt",
        ContractStatus.Approved => "Đã phê duyệt",
        ContractStatus.Signed => "Đã ký số",
        ContractStatus.Active => "Đang hiệu lực",
        ContractStatus.Expiring => "Sắp hết hạn",
        ContractStatus.Renewed => "Đã gia hạn",
        ContractStatus.Terminated => "Đã thanh lý",
        _ => "Không xác định"
    };
    public DateTime CreatedAt { get; set; }
}

public class ContractDetailResponseDto
{
    public Guid Id { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public Guid ContractTypeId { get; set; }
    public string ContractTypeName { get; set; } = string.Empty;
    public Guid TemplateVersionUsedId { get; set; }
    public int TemplateVersionNumber { get; set; }
    public Guid PartnerId { get; set; }
    public string PartnerName { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public DateTime? SignedDate { get; set; }
    public DateTime EffectiveDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public ContractStatus Status { get; set; }
    public string StatusName => Status switch
    {
        ContractStatus.Draft => "Bản nháp",
        ContractStatus.PendingApproval => "Chờ phê duyệt",
        ContractStatus.Approved => "Đã phê duyệt",
        ContractStatus.Signed => "Đã ký số",
        ContractStatus.Active => "Đang hiệu lực",
        ContractStatus.Expiring => "Sắp hết hạn",
        ContractStatus.Renewed => "Đã gia hạn",
        ContractStatus.Terminated => "Đã thanh lý",
        _ => "Không xác định"
    };
    public string? FileUrl { get; set; }
    public Guid? ParentContractId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public byte[]? RowVersion { get; set; }
}
