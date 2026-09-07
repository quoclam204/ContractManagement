using be_contractmgmt.Data;
using be_contractmgmt.Models.Workflow;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace be_contractmgmt.Controllers;

/// <summary>
/// Controller hỗ trợ Người 4 kiểm thử tương tác Entity Workflow & Approval với Database thực tế
/// </summary>
[ApiController]
[Route("api/workflow-test")]
[Tags("Workflow Module Testing (Người 4)")]
public class WorkflowTestController : ControllerBase
{
    private readonly AppDbContext _context;

    public WorkflowTestController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy danh sách cấu hình luồng duyệt kèm các bước
    /// </summary>
    [HttpGet("definitions")]
    public async Task<IActionResult> GetDefinitions()
    {
        var definitions = await _context.WorkflowDefinitions
            .Include(d => d.WorkflowSteps.OrderBy(s => s.StepOrder))
            .AsNoTracking()
            .ToListAsync();

        return Ok(definitions);
    }

    /// <summary>
    /// Lấy thông tin chi tiết một luồng duyệt theo Id
    /// </summary>
    [HttpGet("definitions/{id:guid}")]
    public async Task<IActionResult> GetDefinitionById(Guid id)
    {
        var definition = await _context.WorkflowDefinitions
            .Include(d => d.WorkflowSteps.OrderBy(s => s.StepOrder))
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == id);

        if (definition == null)
            return NotFound(new { message = $"Không tìm thấy WorkflowDefinition với Id: {id}" });

        return Ok(definition);
    }

    /// <summary>
    /// Tạo mới một cấu hình luồng duyệt kèm các bước duyệt
    /// Lưu ý: Đặt tên có tiền tố test của bạn (ví dụ: WF_Test_Nguoi4_01) theo quy ước nhóm
    /// </summary>
    [HttpPost("definitions")]
    public async Task<IActionResult> CreateDefinition([FromBody] CreateWorkflowDefinitionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Tên luồng duyệt không được để trống." });

        var definition = new WorkflowDefinition
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            ConditionExpression = dto.ConditionExpression,
            Version = dto.Version <= 0 ? 1 : dto.Version,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.Steps != null && dto.Steps.Any())
        {
            foreach (var stepDto in dto.Steps)
            {
                definition.WorkflowSteps.Add(new WorkflowStep
                {
                    Id = Guid.NewGuid(),
                    WorkflowDefinitionId = definition.Id,
                    StepOrder = stepDto.StepOrder,
                    ApproverRole = stepDto.ApproverRole,
                    IsRequired = stepDto.IsRequired
                });
            }
        }

        _context.WorkflowDefinitions.Add(definition);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDefinitionById), new { id = definition.Id }, definition);
    }

    /// <summary>
    /// Xóa bản ghi cấu hình luồng duyệt test (chỉ dùng để dọn dẹp dữ liệu test của bạn)
    /// </summary>
    [HttpDelete("definitions/{id:guid}")]
    public async Task<IActionResult> DeleteDefinition(Guid id)
    {
        var definition = await _context.WorkflowDefinitions
            .Include(d => d.WorkflowSteps)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (definition == null)
            return NotFound(new { message = $"Không tìm thấy WorkflowDefinition với Id: {id}" });

        _context.WorkflowDefinitions.Remove(definition);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Đã xóa thành công WorkflowDefinition Id: {id}" });
    }

    /// <summary>
    /// Lấy danh sách các bước duyệt hợp đồng runtime
    /// </summary>
    [HttpGet("approval-steps")]
    public async Task<IActionResult> GetApprovalSteps([FromQuery] Guid? contractId)
    {
        var query = _context.ApprovalSteps.AsNoTracking();

        if (contractId.HasValue)
            query = query.Where(s => s.ContractId == contractId.Value);

        var steps = await query
            .OrderBy(s => s.CreatedAt)
            .Take(50)
            .ToListAsync();

        return Ok(steps);
    }

    /// <summary>
    /// Tạo mới một bước duyệt runtime thử nghiệm cho hợp đồng
    /// </summary>
    [HttpPost("approval-steps")]
    public async Task<IActionResult> CreateApprovalStep([FromBody] CreateApprovalStepDto dto)
    {
        var step = new ApprovalStep
        {
            Id = Guid.NewGuid(),
            ContractId = dto.ContractId,
            WorkflowDefinitionId = dto.WorkflowDefinitionId,
            ApproverId = dto.ApproverId,
            StepOrder = dto.StepOrder,
            Decision = dto.Decision,
            Comment = dto.Comment,
            DecidedAt = dto.Decision != ApprovalDecision.Pending ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow
        };

        _context.ApprovalSteps.Add(step);
        await _context.SaveChangesAsync();

        return Ok(step);
    }

    /// <summary>
    /// Xóa một bước duyệt runtime test (để dọn dẹp dữ liệu test)
    /// </summary>
    [HttpDelete("approval-steps/{id:guid}")]
    public async Task<IActionResult> DeleteApprovalStep(Guid id)
    {
        var step = await _context.ApprovalSteps.FindAsync(id);
        if (step == null)
            return NotFound(new { message = $"Không tìm thấy ApprovalStep với Id: {id}" });

        _context.ApprovalSteps.Remove(step);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Đã xóa thành công ApprovalStep Id: {id}" });
    }
}

public class CreateWorkflowDefinitionDto
{
    public string Name { get; set; } = string.Empty;
    public string? ConditionExpression { get; set; }
    public int Version { get; set; } = 1;
    public bool IsActive { get; set; } = true;
    public List<CreateWorkflowStepDto> Steps { get; set; } = new();
}

public class CreateWorkflowStepDto
{
    public int StepOrder { get; set; }
    public ApproverRole ApproverRole { get; set; }
    public bool IsRequired { get; set; } = true;
}

public class CreateApprovalStepDto
{
    public Guid ContractId { get; set; }
    public Guid WorkflowDefinitionId { get; set; }
    public Guid ApproverId { get; set; }
    public int StepOrder { get; set; }
    public ApprovalDecision Decision { get; set; } = ApprovalDecision.Pending;
    public string? Comment { get; set; }
}

