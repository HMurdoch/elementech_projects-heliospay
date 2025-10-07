using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelioPay.API.Models;

public class Transaction
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AccountId { get; set; }
    [ForeignKey(nameof(AccountId))] public Account? Account { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public decimal Amount { get; set; }
    public string Type { get; set; } = "Credit"; // Credit or Debit
    public string Description { get; set; } = string.Empty;
}
