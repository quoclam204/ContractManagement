using System.ComponentModel.DataAnnotations;

namespace be_contractmgmt.DTOs;

public class CreateContractTypeRequest
{
    [Required(ErrorMessage = "Tên loại hợp đồng không được để trống")]
    [MaxLength(200, ErrorMessage = "Tên loại hợp đồng tối đa 200 ký tự")]
    public string Name { get; set; } = string.Empty;
}

public class UpdateContractTypeRequest
{
    [Required(ErrorMessage = "Tên loại hợp đồng không được để trống")]
    [MaxLength(200, ErrorMessage = "Tên loại hợp đồng tối đa 200 ký tự")]
    public string Name { get; set; } = string.Empty;
}

public class ContractTypeResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int ActiveTemplateVersion { get; set; }
    public int TotalContractsCount { get; set; }
}
