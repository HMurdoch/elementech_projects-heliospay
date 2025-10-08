using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// Models/Transaction.cs
namespace HelioPay.API.Models;

public enum TransactionType { Credit, Debit }
public enum TransactionStatus { Pending, Completed, Failed, Reversed }

public class Transaction
{
    public Guid Id { get; set; }

    // FK to Accounts
    public Guid AccountId { get; set; }
    public Account? Account { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public decimal Amount { get; set; }

    public TransactionType Type { get; set; }         // <— enum
    public string? Description { get; set; }

    // “counterparty” hints (internal/external)
    public string? FromAccountNumber { get; set; }
    public string? ToAccountNumber { get; set; }

    public string Currency { get; set; } = "ZAR";
    public DateTime RequestedUtc { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedUtc { get; set; }

    public TransactionStatus Status { get; set; } = TransactionStatus.Pending; // <— enum
    public string? CorrelationId { get; set; }
}
