using HelioPay.API.Data;
using HelioPay.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelioPay.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<Transaction>> Get([FromQuery] Guid? accountId)
    {
        var q = db.Transactions.Include(t=>t.Account).AsQueryable();
        if(accountId.HasValue) q = q.Where(t=>t.AccountId==accountId);
        return await q.OrderByDescending(t=>t.CreatedAt).Take(200).ToListAsync();
    }

    public record CreateTx(Guid AccountId, decimal Amount, string Type, string Description);

    [HttpPost]
    public async Task<ActionResult<Transaction>> Create(CreateTx input)
    {
        var acc = await db.Accounts.FindAsync(input.AccountId);
        if(acc is null) return NotFound("account not found");

        var tx = new Transaction{ AccountId=acc.Id, Amount=input.Amount, Type=input.Type, Description=input.Description };
        db.Transactions.Add(tx);
        acc.Balance += input.Amount; // Debit as negative amount
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { accountId = acc.Id }, tx);
    }
}
