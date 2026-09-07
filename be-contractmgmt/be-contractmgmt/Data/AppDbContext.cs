using be_contractmgmt.Models;
using be_contractmgmt.Models.Workflow;
using Microsoft.EntityFrameworkCore;

namespace be_contractmgmt.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // Ví dụ:
    public DbSet<Contract> Contracts => Set<Contract>();

    // Module Workflow & Approval (Người 4)
    public DbSet<WorkflowDefinition> WorkflowDefinitions => Set<WorkflowDefinition>();
    public DbSet<WorkflowStep> WorkflowSteps => Set<WorkflowStep>();
    public DbSet<ApprovalStep> ApprovalSteps => Set<ApprovalStep>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tự động áp dụng tất cả IEntityTypeConfiguration (giúp các thành viên tách file cấu hình độc lập)
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}