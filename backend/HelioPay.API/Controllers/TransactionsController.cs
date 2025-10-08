using System.ComponentModel.DataAnnotations;
using HelioPay.API.Data;
using HelioPay.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;

namespace HelioPay.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _db;
    public TransactionsController(AppDbContext db) => _db = db;

    /// <summary>Returns recent transactions.</summary>
    /// <param name="accountId">Optional account filter.</param>
    /// <remarks>
    /// Returns up to 200 most recent transactions.  
    /// Pass <c>?accountId=GUID</c> to filter by account.
    /// </remarks>
    [HttpGet]
    [SwaggerOperation(
        Summary = "List transactions",
        Description = "Returns up to 200 most recent transactions; optionally filter by account ID."
    )]
    [ProducesResponseType(typeof(IEnumerable<TransactionDto>), StatusCodes.Status200OK)]
    public async Task<IEnumerable<TransactionDto>> Get([FromQuery] Guid? accountId)
    {
        var q = _db.Transactions
            .AsNoTracking()
            .Include(t => t.Account)   // needed for AccountNumber
            .OrderByDescending(t => t.CreatedAt)
            .Take(200)
            .AsQueryable();

        if (accountId.HasValue)
            q = q.Where(t => t.AccountId == accountId.Value);

        return await q.Select(t => new TransactionDto(
                t.Id,
                t.AccountId,
                t.Account!.AccountNumber,
                t.CreatedAt,
                t.Amount,
                t.Type.ToString(),
                t.Status.ToString(),
                t.Description,
                t.Currency,
                t.RequestedUtc,
                t.CompletedUtc,
                t.CorrelationId
            ))
            .ToListAsync();
    }

    public record CreateTx(
        [Required] Guid AccountId,
        [Range(typeof(decimal), "-1000000000", "1000000000")] decimal Amount,
        [Required, EnumDataType(typeof(TransactionType))] TransactionType Type,
        [StringLength(256)] string? Description
    );

    /// <summary>Creates a new transaction and adjusts the account balance.</summary>
    /// <remarks>
    /// Use a negative <c>Amount</c> for debits and a positive <c>Amount</c> for credits.  
    /// On success returns the created transaction and a <c>Location</c> header to the list filtered by the account.
    /// </remarks>
    [HttpPost]
    [SwaggerOperation(
        Summary = "Create transaction",
        Description = "Creates a transaction for an account; negative amount = debit, positive = credit."
    )]
    [ProducesResponseType(typeof(Transaction), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Transaction>> Create([FromBody] CreateTx input)
    {
        var acc = await _db.Accounts.FindAsync(input.AccountId);
        if (acc is null) return NotFound("account not found");

        var tx = new Transaction
        {
            AccountId = acc.Id,
            Amount = input.Amount,
            Type = input.Type,
            Description = input.Description,
            Currency = acc.Currency,   // keep tx currency consistent with the account
        };

        _db.Transactions.Add(tx);

        // Business rule: negative = debit, positive = credit
        acc.Balance += input.Amount;

        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { accountId = acc.Id }, tx);
    }
}
