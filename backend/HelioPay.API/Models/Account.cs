using System.ComponentModel.DataAnnotations;

namespace HelioPay.API.Models;

public class Account
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    [Required] public string Owner { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
