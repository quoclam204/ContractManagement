using ContractManagement.Application.DTOs;
using ContractManagement.Domain.Entities;
using ContractManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ContractManagement.WebApi.Controllers;

[ApiController]
[Route("api/contract-types")]
public class ContractTypesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ContractTypesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy danh sách tất cả các loại hợp đồng
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContractTypeResponseDto>>> GetAll()
    {
        var types = await _context.ContractTypes
            .AsNoTracking()
            .Select(t => new ContractTypeResponseDto
            {
                Id = t.Id,
                Name = t.Name,
                CreatedAt = t.CreatedAt,
                ActiveTemplateVersion = t.TemplateVersions
                    .Where(v => v.IsActive)
                    .Select(v => v.Version)
                    .FirstOrDefault(),
                TotalContractsCount = t.Contracts.Count
            })
            .OrderBy(t => t.Name)
            .ToListAsync();

        return Ok(types);
    }

    /// <summary>
    /// Lấy chi tiết 1 loại hợp đồng theo Id
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ContractTypeResponseDto>> GetById(Guid id)
    {
        var contractType = await _context.ContractTypes
            .AsNoTracking()
            .Where(t => t.Id == id)
            .Select(t => new ContractTypeResponseDto
            {
                Id = t.Id,
                Name = t.Name,
                CreatedAt = t.CreatedAt,
                ActiveTemplateVersion = t.TemplateVersions
                    .Where(v => v.IsActive)
                    .Select(v => v.Version)
                    .FirstOrDefault(),
                TotalContractsCount = t.Contracts.Count
            })
            .FirstOrDefaultAsync();

        if (contractType == null)
            return NotFound(new { message = $"Không tìm thấy loại hợp đồng với Id: {id}" });

        return Ok(contractType);
    }

    /// <summary>
    /// Tạo mới loại hợp đồng
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ContractTypeResponseDto>> Create([FromBody] CreateContractTypeRequest request)
    {
        var trimmedName = request.Name.Trim();

        var isExist = await _context.ContractTypes
            .AnyAsync(t => t.Name.ToLower() == trimmedName.ToLower());

        if (isExist)
            return BadRequest(new { message = $"Loại hợp đồng với tên '{trimmedName}' đã tồn tại." });

        var contractType = new ContractType
        {
            Id = Guid.NewGuid(),
            Name = trimmedName,
            CreatedAt = DateTime.UtcNow
        };

        _context.ContractTypes.Add(contractType);
        await _context.SaveChangesAsync();

        var response = new ContractTypeResponseDto
        {
            Id = contractType.Id,
            Name = contractType.Name,
            CreatedAt = contractType.CreatedAt,
            ActiveTemplateVersion = 0,
            TotalContractsCount = 0
        };

        return CreatedAtAction(nameof(GetById), new { id = contractType.Id }, response);
    }

    /// <summary>
    /// Đổi tên loại hợp đồng
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateContractTypeRequest request)
    {
        var contractType = await _context.ContractTypes.FindAsync(id);
        if (contractType == null)
            return NotFound(new { message = $"Không tìm thấy loại hợp đồng với Id: {id}" });

        var trimmedName = request.Name.Trim();

        var isDuplicate = await _context.ContractTypes
            .AnyAsync(t => t.Id != id && t.Name.ToLower() == trimmedName.ToLower());

        if (isDuplicate)
            return BadRequest(new { message = $"Tên loại hợp đồng '{trimmedName}' đã được sử dụng." });

        contractType.Name = trimmedName;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Cập nhật loại hợp đồng thành công.", id = contractType.Id, name = contractType.Name });
    }

    /// <summary>
    /// Xóa loại hợp đồng (chỉ xóa được nếu chưa có hợp đồng nào liên kết)
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var contractType = await _context.ContractTypes
            .Include(t => t.Contracts)
            .Include(t => t.TemplateVersions)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (contractType == null)
            return NotFound(new { message = $"Không tìm thấy loại hợp đồng với Id: {id}" });

        if (contractType.Contracts.Any())
            return BadRequest(new { message = "Không thể xóa loại hợp đồng này vì đã có hợp đồng liên kết." });

        _context.ContractTemplateVersions.RemoveRange(contractType.TemplateVersions);
        _context.ContractTypes.Remove(contractType);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã xóa loại hợp đồng thành công." });
    }
}
