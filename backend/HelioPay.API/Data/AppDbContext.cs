using HelioPay.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HelioPay.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>().HasIndex(a => a.Number).IsUnique();
        base.OnModelCreating(modelBuilder);
    }
}
