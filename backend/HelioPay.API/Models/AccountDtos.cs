namespace HelioPay.API.Models.Dto;

public record AccountCreateDto(
    string OwnerName,
    string AccountNumber,
    string Currency
);

public record AccountUpdateDto(
    string OwnerName,
    string AccountNumber,
    string Currency
);