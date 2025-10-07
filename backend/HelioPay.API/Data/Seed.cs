using HelioPay.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HelioPay.API.Data;

public static class Seed
{
    public static async Task EnsureAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();
        if (!db.Accounts.Any())
        {
            var a1 = new Account{ Owner="Hugh Murdoch", Number="100200300", Balance=1000 };
            var a2 = new Account{ Owner="Demo User", Number="200300400", Balance=500 };
            db.Accounts.AddRange(a1,a2);
            db.Transactions.AddRange(
                new Transaction{ Account=a1, Amount=250, Type="Credit", Description="Initial deposit" },
                new Transaction{ Account=a1, Amount=-50, Type="Debit", Description="Lunch" },
                new Transaction{ Account=a2, Amount=300, Type="Credit", Description="Transfer in" }
            );
            await db.SaveChangesAsync();
        }
    }
}
