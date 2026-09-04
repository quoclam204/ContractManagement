using be_contractmgmt.Models;
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
}