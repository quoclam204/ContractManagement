using ContractManagement.Application.DTOs;
using ContractManagement.Domain.Entities;
using ContractManagement.Domain.Enums;
using ContractManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ContractManagement.WebApi.Controllers;

[ApiController]
[Route("api/contracts")]
public class ContractsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ContractsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy danh sách hợp đồng (hỗ trợ lọc theo trạng thái, từ khóa tìm kiếm và phân trang)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<object>> GetAll(
        [FromQuery] ContractStatus? status,
        [FromQuery] Guid? contractTypeId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var query = _context.Contracts
            .AsNoTracking()
            .Include(c => c.ContractType)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        if (contractTypeId.HasValue)
        {
            query = query.Where(c => c.ContractTypeId == contractTypeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => c.ContractNumber.ToLower().Contains(s) || c.Title.ToLower().Contains(s));
        }

        var totalItems = await query.CountAsync();

        var contracts = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ContractListItemResponseDto
            {
                Id = c.Id,
                ContractNumber = c.ContractNumber,
                Title = c.Title,
                ContractTypeId = c.ContractTypeId,
                ContractTypeName = c.ContractType != null ? c.ContractType.Name : string.Empty,
                PartnerId = c.PartnerId,
                PartnerName = "Đối tác " + c.PartnerId.ToString().Substring(0, 8),
                Value = c.Value,
                EffectiveDate = c.EffectiveDate,
                ExpiryDate = c.ExpiryDate,
                Status = c.Status,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            totalItems,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalItems / pageSize),
            items = contracts
        });
    }

    /// <summary>
    /// Lấy chi tiết 1 hợp đồng theo Id
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ContractDetailResponseDto>> GetById(Guid id)
    {
        var contract = await _context.Contracts
            .AsNoTracking()
            .Include(c => c.ContractType)
            .Include(c => c.TemplateVersionUsed)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
            return NotFound(new { message = $"Không tìm thấy hợp đồng với Id: {id}" });

        var response = new ContractDetailResponseDto
        {
            Id = contract.Id,
            ContractNumber = contract.ContractNumber,
            Title = contract.Title,
            ContractTypeId = contract.ContractTypeId,
            ContractTypeName = contract.ContractType?.Name ?? string.Empty,
            TemplateVersionUsedId = contract.TemplateVersionUsedId,
            TemplateVersionNumber = contract.TemplateVersionUsed?.Version ?? 1,
            PartnerId = contract.PartnerId,
            PartnerName = "Đối tác " + contract.PartnerId.ToString().Substring(0, 8),
            OwnerId = contract.OwnerId,
            OwnerName = "Người tạo " + contract.OwnerId.ToString().Substring(0, 8),
            Value = contract.Value,
            SignedDate = contract.SignedDate,
            EffectiveDate = contract.EffectiveDate,
            ExpiryDate = contract.ExpiryDate,
            Status = contract.Status,
            FileUrl = contract.FileUrl,
            ParentContractId = contract.ParentContractId,
            CreatedAt = contract.CreatedAt,
            UpdatedAt = contract.UpdatedAt,
            RowVersion = contract.RowVersion
        };

        return Ok(response);
    }

    /// <summary>
    /// Tạo mới hợp đồng ở trạng thái Bản nháp (Draft)
    /// </summary>
    [HttpPost("draft")]
    public async Task<ActionResult<ContractDetailResponseDto>> CreateDraft([FromBody] CreateContractDraftRequest request)
    {
        if (request.ExpiryDate < request.EffectiveDate)
            return BadRequest(new { message = "Ngày hết hạn phải lớn hơn hoặc bằng ngày hiệu lực." });

        var contractType = await _context.ContractTypes.FindAsync(request.ContractTypeId);
        if (contractType == null)
            return BadRequest(new { message = $"Loại hợp đồng với Id '{request.ContractTypeId}' không tồn tại." });

        // 1. Xác định Template Version sẽ dùng (snapshot phiên bản mẫu lúc tạo)
        Guid templateVersionId;
        if (request.TemplateVersionUsedId.HasValue && request.TemplateVersionUsedId != Guid.Empty)
        {
            var templateExists = await _context.ContractTemplateVersions.AnyAsync(t => t.Id == request.TemplateVersionUsedId.Value);
            if (!templateExists)
                return BadRequest(new { message = $"Phiên bản mẫu với Id '{request.TemplateVersionUsedId}' không tồn tại." });
            templateVersionId = request.TemplateVersionUsedId.Value;
        }
        else
        {
            // Tự động lấy phiên bản IsActive = true mới nhất của loại hợp đồng này
            var activeTemplate = await _context.ContractTemplateVersions
                .Where(t => t.ContractTypeId == request.ContractTypeId && t.IsActive)
                .OrderByDescending(t => t.Version)
                .FirstOrDefaultAsync();

            if (activeTemplate == null)
            {
                activeTemplate = new ContractTemplateVersion
                {
                    Id = Guid.NewGuid(),
                    ContractTypeId = request.ContractTypeId,
                    Version = 1,
                    IsActive = true,
                    CreatedBy = await EnsureOwnerUserIdAsync(),
                    CreatedAt = DateTime.UtcNow
                };
                _context.ContractTemplateVersions.Add(activeTemplate);
                await _context.SaveChangesAsync();
            }
            templateVersionId = activeTemplate.Id;
        }

        // 2. Đảm bảo có PartnerId và OwnerId hợp lệ tránh lỗi Foreign Key
        var partnerId = await EnsurePartnerIdAsync(request.PartnerId);
        var ownerId = await EnsureOwnerUserIdAsync();

        // 3. Sinh số hợp đồng tự động duy nhất: HD-yyyyMM-0001
        var contractNumber = await GenerateContractNumberAsync();

        // 4. Khởi tạo Contract ở trạng thái Draft
        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = contractNumber,
            ContractTypeId = request.ContractTypeId,
            TemplateVersionUsedId = templateVersionId,
            PartnerId = partnerId,
            OwnerId = ownerId,
            Title = request.Title.Trim(),
            Value = request.Value,
            EffectiveDate = request.EffectiveDate,
            ExpiryDate = request.ExpiryDate,
            Status = ContractStatus.Draft,
            FileUrl = request.FileUrl,
            CreatedAt = DateTime.UtcNow
        };

        _context.Contracts.Add(contract);
        await _context.SaveChangesAsync();

        var response = new ContractDetailResponseDto
        {
            Id = contract.Id,
            ContractNumber = contract.ContractNumber,
            Title = contract.Title,
            ContractTypeId = contract.ContractTypeId,
            ContractTypeName = contractType.Name,
            TemplateVersionUsedId = contract.TemplateVersionUsedId,
            TemplateVersionNumber = 1,
            PartnerId = contract.PartnerId,
            PartnerName = "Đối tác " + contract.PartnerId.ToString().Substring(0, 8),
            OwnerId = contract.OwnerId,
            OwnerName = "Người tạo " + contract.OwnerId.ToString().Substring(0, 8),
            Value = contract.Value,
            EffectiveDate = contract.EffectiveDate,
            ExpiryDate = contract.ExpiryDate,
            Status = contract.Status,
            FileUrl = contract.FileUrl,
            CreatedAt = contract.CreatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = contract.Id }, response);
    }

    /// <summary>
    /// Cập nhật thông tin hợp đồng nháp (Chỉ cho phép khi hợp đồng ở trạng thái Draft)
    /// </summary>
    [HttpPut("{id:guid}/draft")]
    public async Task<IActionResult> UpdateDraft(Guid id, [FromBody] UpdateContractDraftRequest request)
    {
        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null)
            return NotFound(new { message = $"Không tìm thấy hợp đồng với Id: {id}" });

        if (contract.Status != ContractStatus.Draft)
            return BadRequest(new { message = $"Chỉ được phép chỉnh sửa thông tin khi hợp đồng ở trạng thái Bản nháp (Draft). Trạng thái hiện tại: {contract.Status}" });

        if (request.ExpiryDate < request.EffectiveDate)
            return BadRequest(new { message = "Ngày hết hạn phải lớn hơn hoặc bằng ngày hiệu lực." });

        contract.Title = request.Title.Trim();
        contract.Value = request.Value;
        contract.EffectiveDate = request.EffectiveDate;
        contract.ExpiryDate = request.ExpiryDate;
        contract.FileUrl = request.FileUrl;
        contract.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Cập nhật hợp đồng nháp thành công.", id = contract.Id });
    }

    /// <summary>
    /// Gửi phê duyệt hợp đồng nháp (Chuyển trạng thái từ Draft -> PendingApproval)
    /// </summary>
    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> SubmitForApproval(Guid id)
    {
        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null)
            return NotFound(new { message = $"Không tìm thấy hợp đồng với Id: {id}" });

        try
        {
            contract.SubmitForApproval();
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Hợp đồng đã được trình duyệt thành công.",
                id = contract.Id,
                status = contract.Status,
                statusName = "Chờ phê duyệt"
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // -------------------------------------------------------------
    // PRIVATE HELPERS
    // -------------------------------------------------------------

    private async Task<string> GenerateContractNumberAsync()
    {
        var prefix = $"HD-{DateTime.UtcNow:yyyyMM}-";
        var count = await _context.Contracts
            .Where(c => c.ContractNumber.StartsWith(prefix))
            .CountAsync();

        return $"{prefix}{(count + 1):D4}";
    }

    private async Task<Guid> EnsurePartnerIdAsync(Guid? requestedPartnerId)
    {
        if (requestedPartnerId.HasValue && requestedPartnerId.Value != Guid.Empty)
        {
            var exists = await _context.Database
                .SqlQueryRaw<int>("SELECT COUNT(1) AS Value FROM dbo.PARTNERS WHERE Id = {0}", requestedPartnerId.Value)
                .FirstOrDefaultAsync();

            if (exists > 0) return requestedPartnerId.Value;
        }

        var firstPartner = await _context.Database
            .SqlQueryRaw<Guid>("SELECT TOP 1 Id AS Value FROM dbo.PARTNERS ORDER BY CreatedAt ASC")
            .ToListAsync();

        if (firstPartner.Any()) return firstPartner.First();

        var defaultPartnerId = Guid.NewGuid();
        var sql = @"
            INSERT INTO dbo.PARTNERS (Id, Name, TaxCode, Representative, ContactEmail, CreatedAt)
            VALUES ({0}, N'Tập đoàn Công nghệ FPT (Mẫu)', '0101234567', N'Nguyễn Văn A', 'contact@fpt.sample', SYSUTCDATETIME())";

        await _context.Database.ExecuteSqlRawAsync(sql, defaultPartnerId);
        return defaultPartnerId;
    }

    private async Task<Guid> EnsureOwnerUserIdAsync()
    {
        var firstUser = await _context.Database
            .SqlQueryRaw<Guid>("SELECT TOP 1 Id AS Value FROM dbo.USERS ORDER BY CreatedAt ASC")
            .ToListAsync();

        if (firstUser.Any()) return firstUser.First();

        var defaultAdminId = Guid.NewGuid();
        var sql = @"
            INSERT INTO dbo.USERS (Id, FullName, Email, PasswordHash, Role, IsActive, CreatedAt)
            VALUES ({0}, N'System Administrator', 'admin@clm.system', 'SAMPLE_HASH_CHANGE_LATER', 0, 1, SYSUTCDATETIME())";

        await _context.Database.ExecuteSqlRawAsync(sql, defaultAdminId);
        return defaultAdminId;
    }
}
