public record AccountSummaryDto(Guid Id, string AccountNumber, string OwnerName, string Currency, decimal Balance);

public record TransactionDto(
    Guid Id,
    Guid AccountId,
    string AccountNumber,
    DateTime CreatedAt,
    decimal Amount,
    string Type,
    string Status,
    string? Description,
    string Currency,
    DateTime? RequestedUtc,
    DateTime? CompletedUtc,
    string? CorrelationId
);