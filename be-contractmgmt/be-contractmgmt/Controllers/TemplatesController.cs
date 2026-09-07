using be_contractmgmt.Data;
using be_contractmgmt.DTOs;
using be_contractmgmt.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace be_contractmgmt.Controllers;

[ApiController]
[Route("api/templates")]
public class TemplatesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TemplatesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy danh sách các mẫu đang hoạt động (IsActive = true) phục vụ màn hình tạo hợp đồng
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<TemplateVersionResponseDto>>> GetActiveTemplates()
    {
        var activeTemplates = await _context.ContractTemplateVersions
            .AsNoTracking()
            .Include(v => v.ContractType)
            .Where(v => v.IsActive)
            .Select(v => new TemplateVersionResponseDto
            {
                Id = v.Id,
                ContractTypeId = v.ContractTypeId,
                ContractTypeName = v.ContractType != null ? v.ContractType.Name : string.Empty,
                Version = v.Version,
                TemplateFileUrl = v.TemplateFileUrl,
                ContentJson = v.ContentJson,
                WorkflowDefinitionId = v.WorkflowDefinitionId,
                IsActive = v.IsActive,
                CreatedBy = v.CreatedBy,
                CreatedAt = v.CreatedAt
            })
            .OrderBy(v => v.ContractTypeName)
            .ToListAsync();

        return Ok(activeTemplates);
    }

    /// <summary>
    /// Lấy lịch sử tất cả các phiên bản mẫu của một loại hợp đồng
    /// </summary>
    [HttpGet("by-type/{contractTypeId:guid}")]
    public async Task<ActionResult<IEnumerable<TemplateVersionResponseDto>>> GetVersionsByType(Guid contractTypeId)
    {
        var isTypeExist = await _context.ContractTypes.AnyAsync(t => t.Id == contractTypeId);
        if (!isTypeExist)
            return NotFound(new { message = $"Không tìm thấy loại hợp đồng với Id: {contractTypeId}" });

        var versions = await _context.ContractTemplateVersions
            .AsNoTracking()
            .Include(v => v.ContractType)
            .Where(v => v.ContractTypeId == contractTypeId)
            .OrderByDescending(v => v.Version)
            .Select(v => new TemplateVersionResponseDto
            {
                Id = v.Id,
                ContractTypeId = v.ContractTypeId,
                ContractTypeName = v.ContractType != null ? v.ContractType.Name : string.Empty,
                Version = v.Version,
                TemplateFileUrl = v.TemplateFileUrl,
                ContentJson = v.ContentJson,
                WorkflowDefinitionId = v.WorkflowDefinitionId,
                IsActive = v.IsActive,
                CreatedBy = v.CreatedBy,
                CreatedAt = v.CreatedAt
            })
            .ToListAsync();

        return Ok(versions);
    }

    /// <summary>
    /// Lấy chi tiết một phiên bản mẫu hợp đồng cụ thể
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TemplateVersionResponseDto>> GetById(Guid id)
    {
        var template = await _context.ContractTemplateVersions
            .AsNoTracking()
            .Include(v => v.ContractType)
            .Where(v => v.Id == id)
            .Select(v => new TemplateVersionResponseDto
            {
                Id = v.Id,
                ContractTypeId = v.ContractTypeId,
                ContractTypeName = v.ContractType != null ? v.ContractType.Name : string.Empty,
                Version = v.Version,
                TemplateFileUrl = v.TemplateFileUrl,
                ContentJson = v.ContentJson,
                WorkflowDefinitionId = v.WorkflowDefinitionId,
                IsActive = v.IsActive,
                CreatedBy = v.CreatedBy,
                CreatedAt = v.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (template == null)
            return NotFound(new { message = $"Không tìm thấy mẫu hợp đồng với Id: {id}" });

        return Ok(template);
    }

    /// <summary>
    /// Tạo một phiên bản mẫu mới (Versioning: tự động tăng Version và vô hiệu hóa bản cũ)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TemplateVersionResponseDto>> CreateVersion([FromBody] CreateTemplateVersionRequest request)
    {
        var contractType = await _context.ContractTypes.FindAsync(request.ContractTypeId);
        if (contractType == null)
            return BadRequest(new { message = $"Loại hợp đồng với Id '{request.ContractTypeId}' không tồn tại." });

        // 1. Đảm bảo có User hợp lệ cho CreatedBy (để không bị lỗi FK_CTV_USERS_CreatedBy)
        var authorId = await EnsureAuthorUserIdAsync(request.CreatedBy);

        // 2. Tìm version cao nhất hiện tại của loại hợp đồng này
        var currentMaxVersion = await _context.ContractTemplateVersions
            .Where(v => v.ContractTypeId == request.ContractTypeId)
            .MaxAsync(v => (int?)v.Version) ?? 0;

        var nextVersion = currentMaxVersion + 1;

        // 3. Chuyển tất cả các version cũ của loại hợp đồng này sang IsActive = false
        var activeTemplates = await _context.ContractTemplateVersions
            .Where(v => v.ContractTypeId == request.ContractTypeId && v.IsActive)
            .ToListAsync();

        foreach (var old in activeTemplates)
        {
            old.IsActive = false;
        }

        // 4. Tạo phiên bản mẫu mới với IsActive = true
        var newVersion = new ContractTemplateVersion
        {
            Id = Guid.NewGuid(),
            ContractTypeId = request.ContractTypeId,
            Version = nextVersion,
            TemplateFileUrl = request.TemplateFileUrl,
            ContentJson = request.ContentJson,
            WorkflowDefinitionId = request.WorkflowDefinitionId,
            IsActive = true,
            CreatedBy = authorId,
            CreatedAt = DateTime.UtcNow
        };

        _context.ContractTemplateVersions.Add(newVersion);
        await _context.SaveChangesAsync();

        var response = new TemplateVersionResponseDto
        {
            Id = newVersion.Id,
            ContractTypeId = newVersion.ContractTypeId,
            ContractTypeName = contractType.Name,
            Version = newVersion.Version,
            TemplateFileUrl = newVersion.TemplateFileUrl,
            ContentJson = newVersion.ContentJson,
            WorkflowDefinitionId = newVersion.WorkflowDefinitionId,
            IsActive = newVersion.IsActive,
            CreatedBy = newVersion.CreatedBy,
            CreatedAt = newVersion.CreatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = newVersion.Id }, response);
    }

    /// <summary>
    /// Helper: Kiểm tra hoặc lấy User ID hợp lệ trong bảng USERS để tránh lỗi FK
    /// </summary>
    private async Task<Guid> EnsureAuthorUserIdAsync(Guid? requestedUserId)
    {
        // 1. Nếu client truyền lên một UserId, kiểm tra xem có tồn tại không
        if (requestedUserId.HasValue && requestedUserId.Value != Guid.Empty)
        {
            var exists = await _context.Database
                .SqlQueryRaw<int>("SELECT COUNT(1) AS Value FROM dbo.USERS WHERE Id = {0}", requestedUserId.Value)
                .FirstOrDefaultAsync();

            if (exists > 0)
                return requestedUserId.Value;
        }

        // 2. Nếu không truyền hoặc không tồn tại, tìm user đầu tiên trong dbo.USERS
        var firstUser = await _context.Database
            .SqlQueryRaw<Guid>("SELECT TOP 1 Id AS Value FROM dbo.USERS ORDER BY CreatedAt ASC")
            .ToListAsync();

        if (firstUser.Any())
            return firstUser.First();

        // 3. Nếu bảng USERS hoàn toàn trống (do Người 1 chưa seed tài khoản), tự động tạo 1 System Admin mẫu
        var defaultAdminId = Guid.NewGuid();
        var sql = @"
            INSERT INTO dbo.USERS (Id, FullName, Email, PasswordHash, Role, IsActive, CreatedAt)
            VALUES ({0}, N'System Administrator', 'admin@clm.system', 'SAMPLE_HASH_CHANGE_LATER', 0, 1, SYSUTCDATETIME())";

        await _context.Database.ExecuteSqlRawAsync(sql, defaultAdminId);
        return defaultAdminId;
    }
}
