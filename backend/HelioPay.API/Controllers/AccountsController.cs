using HelioPay.API.Data;
using HelioPay.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelioPay.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController(AppDbContext db) : ControllerBase
{
    [HttpGet] public async Task<IEnumerable<Account>> GetAll()=>await db.Accounts.AsNoTracking().ToListAsync();

    [HttpPost]
    public async Task<ActionResult<Account>> Create(Account a)
    {
        db.Accounts.Add(a);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id=a.Id }, a);
    }
}
