using System.ComponentModel.DataAnnotations;
using HelioPay.API.Data;
using HelioPay.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;

namespace HelioPay.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AccountsController(AppDbContext db) => _db = db;

    public record AccountDto(Guid Id, string OwnerName, string AccountNumber,
                             string Currency, decimal Balance, DateTime CreatedUtc);

    [HttpGet]
    [SwaggerOperation(Summary = "List accounts", Description = "Returns all accounts.")]
    [ProducesResponseType(typeof(IEnumerable<AccountDto>), StatusCodes.Status200OK)]
    public async Task<IEnumerable<AccountDto>> Get()
        => await _db.Accounts.AsNoTracking()
            .OrderBy(a => a.OwnerName)
            .Select(a => new AccountDto(a.Id, a.OwnerName, a.AccountNumber, a.Currency, a.Balance, a.CreatedUtc))
            .ToListAsync();

    [HttpGet("{id:guid}")]
    [SwaggerOperation(Summary = "Get account by ID")]
    [ProducesResponseType(typeof(AccountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AccountDto>> GetById(Guid id)
    {
        var a = await _db.Accounts.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (a is null) return NotFound();
        return new AccountDto(a.Id, a.OwnerName, a.AccountNumber, a.Currency, a.Balance, a.CreatedUtc);
    }

    public record CreateAccount([Required, StringLength(100)] string OwnerName,
                                [Required, StringLength(32)] string AccountNumber,
                                [Required, StringLength(3)] string Currency);

    [HttpPost]
    [SwaggerOperation(Summary = "Create account")]
    [ProducesResponseType(typeof(AccountDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AccountDto>> Create([FromBody] CreateAccount input)
    {
        // minimal duplicate check on account number
        var exists = await _db.Accounts.AnyAsync(a => a.AccountNumber == input.AccountNumber);
        if (exists) return Conflict("Account number already exists.");

        var a = new Account
        {
            OwnerName = input.OwnerName,
            AccountNumber = input.AccountNumber,
            Currency = input.Currency,
            Balance = 0m,
            CreatedUtc = DateTime.UtcNow
        };
        _db.Accounts.Add(a);
        await _db.SaveChangesAsync();

        var dto = new AccountDto(a.Id, a.OwnerName, a.AccountNumber, a.Currency, a.Balance, a.CreatedUtc);
        return CreatedAtAction(nameof(GetById), new { id = a.Id }, dto);
    }

    public record UpdateAccount([Required, StringLength(100)] string OwnerName,
                                [Required, StringLength(3)] string Currency);

    [HttpPut("{id:guid}")]
    [SwaggerOperation(Summary = "Update account")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAccount input)
    {
        var a = await _db.Accounts.FindAsync(id);
        if (a is null) return NotFound();
        a.OwnerName = input.OwnerName;
        a.Currency = input.Currency;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [SwaggerOperation(Summary = "Delete account")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var a = await _db.Accounts.Include(x => x.Transactions).FirstOrDefaultAsync(x => x.Id == id);
        if (a is null) return NotFound();
        if (a.Transactions.Any()) return Conflict("Account has transactions, cannot delete.");
        _db.Accounts.Remove(a);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
