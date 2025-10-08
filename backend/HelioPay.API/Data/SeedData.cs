// backend/HelioPay.API/Data/SeedData.cs
using Bogus;
using HelioPay.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HelioPay.API.Data;

public static class SeedData
{
    /// <summary>Safe “seed if empty”.</summary>
    public static async Task EnsureAsync(AppDbContext db, int accountCount = 16, int txCount = 200)
    {
        await db.Database.MigrateAsync();

        if (!await db.Accounts.AnyAsync())
        {
            await PopulateAsync(db, accountCount, txCount);
        }
    }

    /// <summary>Hard rebuild: drop & create schema, then reseed.</summary>
    public static async Task RebuildAsync(AppDbContext db, int accountCount = 16, int txCount = 200)
    {
        await db.Database.EnsureDeletedAsync();
        await db.Database.MigrateAsync();
        await PopulateAsync(db, accountCount, txCount);
    }

    private static async Task PopulateAsync(AppDbContext db, int accountCount, int txCount)
    {
        // -------- Accounts
        var currencyOptions = new[] { "ZAR", "USD", "EUR", "GBP" };

        var accountFaker = new Faker<Account>("en")
            .RuleFor(a => a.OwnerName, f => f.Name.FullName())
            .RuleFor(a => a.AccountNumber, f => $"ACC-{f.Random.Int(1000, 9999)}-{f.Random.Int(1000, 9999)}")
            .RuleFor(a => a.Currency, f => f.PickRandom(currencyOptions))
            .RuleFor(a => a.Balance, f => Math.Round(f.Random.Decimal(5000m, 150000m), 2))
            .RuleFor(a => a.CreatedUtc, f => f.Date.Past(2, DateTime.UtcNow.AddMonths(-3)));

        var accounts = accountFaker.Generate(accountCount)
                                   .GroupBy(x => x.AccountNumber)
                                   .Select(g => g.First())
                                   .ToList();

        await db.Accounts.AddRangeAsync(accounts);
        await db.SaveChangesAsync();

        var byId = accounts.ToDictionary(a => a.Id, a => a);

        // -------- Transactions
        var typeOptions = Enum.GetValues<TransactionType>();
        var statusOptions = Enum.GetValues<TransactionStatus>();

        var txFaker = new Faker<Transaction>("en")
            .RuleFor(t => t.AccountId, f => f.PickRandom(accounts).Id)
            .RuleFor(t => t.Type, f => f.PickRandom(typeOptions))
            .RuleFor(t => t.Amount, f => Math.Round(f.Random.Decimal(10m, 2000m), 2))
            .RuleFor(t => t.Description, f => f.Finance.TransactionType())
            .RuleFor(t => t.Currency, (f, t) => byId[t.AccountId].Currency)
            .RuleFor(t => t.FromAccountNumber, (f, t) =>
            {
                var src = byId[t.AccountId].AccountNumber;
                return f.Random.Bool(0.85f) ? src : $"EXT-{f.Random.Int(100000, 999999)}";
            })
            .RuleFor(t => t.ToAccountNumber, f =>
            {
                if (f.Random.Bool(0.7f))
                {
                    var other = f.PickRandom(accounts);
                    return other.AccountNumber;
                }
                return $"EXT-{f.Random.Int(100000, 999999)}";
            })
            .RuleFor(t => t.RequestedUtc, f => f.Date.Recent(30, DateTime.UtcNow.AddDays(-30)))
            .RuleFor(t => t.CompletedUtc, (f, t) =>
                f.Random.Bool(0.85f) ? t.RequestedUtc.AddMinutes(f.Random.Int(1, 120)) : null)
            .RuleFor(t => t.Status, f => f.PickRandom(statusOptions))
            .RuleFor(t => t.CorrelationId, f => Guid.NewGuid().ToString());

        var transactions = txFaker.Generate(txCount);

        await db.Transactions.AddRangeAsync(transactions);
        await db.SaveChangesAsync();
    }
}
