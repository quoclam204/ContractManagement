using System.ComponentModel.DataAnnotations;

namespace be_contractmgmt.DTOs;

public class CreateTemplateVersionRequest
{
    [Required(ErrorMessage = "Mã loại hợp đồng không được để trống")]
    public Guid ContractTypeId { get; set; }

    [MaxLength(1000)]
    public string? TemplateFileUrl { get; set; }

    /// <summary>
    /// Cấu trúc JSON chứa các điều khoản hoặc các trường động cần điền
    /// </summary>
    public string? ContentJson { get; set; }

    public Guid? WorkflowDefinitionId { get; set; }

    /// <summary>
    /// ID người tạo (sẽ được tự động lấy từ ICurrentUserService sau này, tạm thời có thể truyền hoặc dùng default)
    /// </summary>
    public Guid? CreatedBy { get; set; }
}

public class TemplateVersionResponseDto
{
    public Guid Id { get; set; }
    public Guid ContractTypeId { get; set; }
    public string ContractTypeName { get; set; } = string.Empty;
    public int Version { get; set; }
    public string? TemplateFileUrl { get; set; }
    public string? ContentJson { get; set; }
    public Guid? WorkflowDefinitionId { get; set; }
    public bool IsActive { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}
