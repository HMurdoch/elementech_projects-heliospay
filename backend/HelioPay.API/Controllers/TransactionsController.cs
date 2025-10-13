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

    // -------------------------------- GET --------------------------------

    public record Query([FromQuery] Guid? AccountId, [FromQuery] int? Take);

    [HttpGet]
    [SwaggerOperation(Summary = "List transactions")]
    [ProducesResponseType(typeof(IEnumerable<TransactionDto>), StatusCodes.Status200OK)]
    public async Task<IEnumerable<TransactionDto>> Get([FromQuery] Query query)
    {
        var q = _db.Transactions.AsNoTracking().OrderByDescending(t => t.CreatedAt).AsQueryable();

        if (query.AccountId is Guid aid) q = q.Where(t => t.AccountId == aid);
        if (query.Take is int take && take > 0) q = q.Take(take);

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

    // ------------------------------- CREATE -------------------------------

    public record CreateTx(
        [Required] Guid AccountId,
        [Range(typeof(decimal), "-1000000000", "1000000000")] decimal Amount,
        [Required, EnumDataType(typeof(TransactionType))] TransactionType Type,
        [StringLength(256)] string? Description
    );

    /// <summary>
    /// Creates a single transaction and adjusts the account balance.
    /// Negative <c>Amount</c> = debit, positive <c>Amount</c> = credit.
    /// </summary>
    [HttpPost]
    [SwaggerOperation(Summary = "Create transaction")]
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
            Currency = acc.Currency,
        };

        _db.Transactions.Add(tx);

        // Business rule: negative = debit, positive = credit
        acc.Balance += input.Amount;

        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { accountId = acc.Id }, tx);
    }

    // ------------------------------ TRANSFER ------------------------------

    public record TransferDto(
        [Required] Guid FromAccountId,
        [Required] Guid ToAccountId,
        // IMPORTANT: do not use Range(typeof(decimal), "0.01", ...); it is culture sensitive.
        [Range(0.01, 1000000000)] decimal Amount,
        [StringLength(256)] string? Description
    );

    /// <summary>
    /// Atomically transfers funds between two accounts.
    /// Ensures both accounts exist, same currency, sufficient funds; writes two transactions within a DB transaction.
    /// </summary>
    [HttpPost("transfer")]
    [SwaggerOperation(Summary = "Transfer funds (atomic)")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Transfer([FromBody] TransferDto dto, CancellationToken ct)
    {
        if (dto.FromAccountId == dto.ToAccountId)
            return BadRequest("From and To accounts cannot be the same.");

        var from = await _db.Accounts.FirstOrDefaultAsync(a => a.Id == dto.FromAccountId, ct);
        var to = await _db.Accounts.FirstOrDefaultAsync(a => a.Id == dto.ToAccountId, ct);

        if (from is null || to is null) return NotFound("One or both accounts not found.");
        if (!string.Equals(from.Currency, to.Currency, StringComparison.OrdinalIgnoreCase))
            return BadRequest("Transfer requires matching currencies.");
        if (from.Balance < dto.Amount)
            return BadRequest("Insufficient funds.");

        using var txScope = await _db.Database.BeginTransactionAsync(ct);

        // Debit FROM (negative amount)
        var debit = new Transaction
        {
            AccountId = from.Id,
            Amount = -dto.Amount,
            Type = TransactionType.Debit,
            Description = dto.Description ?? $"Transfer to {to.AccountNumber}",
            Currency = from.Currency,
            RequestedUtc = DateTime.UtcNow,
            Status = TransactionStatus.Completed
        };
        from.Balance += debit.Amount; // negative

        // Credit TO (positive amount)
        var credit = new Transaction
        {
            AccountId = to.Id,
            Amount = dto.Amount,
            Type = TransactionType.Credit,
            Description = dto.Description ?? $"Transfer from {from.AccountNumber}",
            Currency = to.Currency,
            RequestedUtc = DateTime.UtcNow,
            Status = TransactionStatus.Completed
        };
        to.Balance += credit.Amount;

        _db.Transactions.AddRange(debit, credit);
        await _db.SaveChangesAsync(ct);
        await txScope.CommitAsync(ct);

        return NoContent();
    }
}
