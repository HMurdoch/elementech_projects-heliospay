// Data/AppDbContext.cs
using HelioPay.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HelioPay.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema("public");

        modelBuilder.Entity<Account>(b =>
        {
            b.ToTable("Accounts");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnType("uuid");
            b.Property(x => x.OwnerName).IsRequired();
            b.Property(x => x.Currency).IsRequired();
        });

        modelBuilder.Entity<Transaction>(b =>
        {
            b.ToTable("Transactions");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnType("uuid");

            // FK must be uuid to match Guid in the model
            b.Property(x => x.AccountId).HasColumnType("uuid");

            b.HasOne(x => x.Account)
                .WithMany(a => a.Transactions)
                .HasForeignKey(x => x.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Property(x => x.Currency).IsRequired();
        });
    }
}