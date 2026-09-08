using ContractManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ContractManagement.Application.Interfaces;

public interface IAppDbContext
{
    DbSet<Contract> Contracts { get; }
    DbSet<ContractType> ContractTypes { get; }
    DbSet<ContractTemplateVersion> ContractTemplateVersions { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
