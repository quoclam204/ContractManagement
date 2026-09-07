using be_contractmgmt.Models;
using Microsoft.EntityFrameworkCore;

namespace be_contractmgmt.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<ContractType> ContractTypes => Set<ContractType>();
    public DbSet<ContractTemplateVersion> ContractTemplateVersions => Set<ContractTemplateVersion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Cấu hình CONTRACT_TYPES
        modelBuilder.Entity<ContractType>(entity =>
        {
            entity.ToTable("CONTRACT_TYPES", "dbo");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Cấu hình CONTRACT_TEMPLATE_VERSIONS
        modelBuilder.Entity<ContractTemplateVersion>(entity =>
        {
            entity.ToTable("CONTRACT_TEMPLATE_VERSIONS", "dbo");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ContractTypeId, e.Version }).IsUnique();

            entity.HasOne(e => e.ContractType)
                  .WithMany(t => t.TemplateVersions)
                  .HasForeignKey(e => e.ContractTypeId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Cấu hình CONTRACTS
        modelBuilder.Entity<Contract>(entity =>
        {
            entity.ToTable("CONTRACTS", "dbo");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ContractNumber).IsUnique();

            entity.Property(e => e.Value)
                  .HasPrecision(18, 2);

            entity.Property(e => e.RowVersion)
                  .IsRowVersion();

            entity.HasOne(e => e.ContractType)
                  .WithMany(t => t.Contracts)
                  .HasForeignKey(e => e.ContractTypeId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.TemplateVersionUsed)
                  .WithMany()
                  .HasForeignKey(e => e.TemplateVersionUsedId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ParentContract)
                  .WithMany(p => p.Addendums)
                  .HasForeignKey(e => e.ParentContractId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}