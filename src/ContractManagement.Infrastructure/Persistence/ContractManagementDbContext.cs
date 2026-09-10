using ContractManagement.Application.Identity.Interfaces;
using ContractManagement.Application.Workflow.Interfaces;
using ContractManagement.Domain.Identity.Entities;
using ContractManagement.Application.Common.Interfaces;
using ContractManagement.Domain;
using ContractManagement.Domain.Workflow.Entities;
using Microsoft.EntityFrameworkCore;

namespace ContractManagement.Infrastructure.Persistence;

public class ContractManagementDbContext : DbContext, IWorkflowDbContext, IIdentityDbContext, IPartnerDbContext
{
    public ContractManagementDbContext(DbContextOptions<ContractManagementDbContext> options)
        : base(options)
    {
    }

    public DbSet<WorkflowDefinition> WorkflowDefinitions => Set<WorkflowDefinition>();
    public DbSet<WorkflowStep> WorkflowSteps => Set<WorkflowStep>();
    public DbSet<ApprovalStep> ApprovalSteps => Set<ApprovalStep>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Partner> Partners => Set<Partner>();

    public async Task<Guid> GetDefaultApproverIdAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await Database.SqlQueryRaw<Guid>("SELECT TOP 1 Id FROM dbo.USERS").FirstOrDefaultAsync(cancellationToken);
            if (user != Guid.Empty)
                return user;
        }
        catch
        {
            // Table USERS might not exist yet before migration
        }

        return Guid.NewGuid();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply configurations from assemblies
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ContractManagementDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}