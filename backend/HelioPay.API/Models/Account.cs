using System.ComponentModel.DataAnnotations;

namespace HelioPay.API.Models;

public class Account
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    [Required] public string OwnerName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public string Currency { get; set; }
    public DateTime CreatedUtc { get; set; }
}
