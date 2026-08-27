using backend.Models;

namespace backend.Repositories;

public interface IClaimRepository
{
    Task CreateAsync(Claim claim);

    Task UpdateAsync(Claim claim);

    Task<Claim?> GetByIdWithDetailsAsync(
        int claimId);

    Task<List<Claim>> GetCustomerClaimsAsync(
        int customerId);

    Task<List<Claim>> GetAgentClaimsAsync(
        string? status,
        string? priority,
        string? damageType,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? search = null);

    Task AddHistoryAsync(
        ClaimHistory history);

    Task AddImageAsync(
        ClaimImage image);

    Task<ClaimStatistics> GetStatisticsAsync();
}