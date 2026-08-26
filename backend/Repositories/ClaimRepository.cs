using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class ClaimRepository : IClaimRepository
{
    private readonly ApplicationDbContext _context;

    public ClaimRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    // ============================================================
    // CREATE
    // ============================================================

    public async Task CreateAsync(Claim claim)
    {
        _context.Claims.Add(claim);

        await _context.SaveChangesAsync();
    }

    // ============================================================
    // UPDATE
    // ============================================================

    public async Task UpdateAsync(Claim claim)
    {
        _context.Claims.Update(claim);

        await _context.SaveChangesAsync();
    }

    // ============================================================
    // GET BY ID
    // ============================================================

    public async Task<Claim?> GetByIdWithDetailsAsync(
        int claimId)
    {
        return await _context.Claims
            .Include(c => c.Customer)
            .Include(c => c.AssignedAgent)
            .Include(c => c.Images)
            .Include(c => c.History)
                .ThenInclude(h => h.ChangedByUser)
            .FirstOrDefaultAsync(
                c => c.Id == claimId);
    }

    // ============================================================
    // CUSTOMER CLAIMS
    // ============================================================

    public async Task<List<Claim>> GetCustomerClaimsAsync(
        int customerId)
    {
        return await _context.Claims
            .Where(c => c.CustomerId == customerId)
            .Include(c => c.Images)
            .Include(c => c.History)
                .ThenInclude(h => h.ChangedByUser)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    // ============================================================
    // AGENT CLAIMS
    // ============================================================

    public async Task<List<Claim>> GetAgentClaimsAsync(
        string? status,
        string? priority,
        string? damageType,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? search = null)
    {
        var query = _context.Claims
            .Include(c => c.Customer)
            .Include(c => c.AssignedAgent)
            .Include(c => c.Images)
            .AsQueryable();

        // --------------------------------------------------------
        // Status
        // --------------------------------------------------------

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(
                c => c.Status == status);
        }

        // --------------------------------------------------------
        // Priority
        // --------------------------------------------------------

        if (!string.IsNullOrWhiteSpace(priority))
        {
            query = query.Where(
                c => c.Priority == priority);
        }

        // --------------------------------------------------------
        // Damage Type
        // --------------------------------------------------------

        if (!string.IsNullOrWhiteSpace(damageType))
        {
            query = query.Where(
                c => c.DamageType == damageType);
        }

        // --------------------------------------------------------
        // From Date
        // --------------------------------------------------------

        if (fromDate.HasValue)
        {
            query = query.Where(
                c => c.CreatedAt >= fromDate.Value);
        }

        // --------------------------------------------------------
        // To Date
        // --------------------------------------------------------

        if (toDate.HasValue)
        {
            var endOfDay =
                toDate.Value.Date.AddDays(1);

            query = query.Where(
                c => c.CreatedAt < endOfDay);
        }

        // --------------------------------------------------------
        // Search
        // --------------------------------------------------------

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm =
                search.Trim();

            query = query.Where(
                c =>
                    c.ClaimNumber.Contains(searchTerm) ||
                    c.PackageId.Contains(searchTerm) ||
                    c.Customer!.Name.Contains(searchTerm) ||
                    c.Customer!.Email.Contains(searchTerm));
        }

        return await query
            .OrderByDescending(c =>
                c.Priority == "Critical")
            .ThenByDescending(c =>
                c.Priority == "High")
            .ThenByDescending(c =>
                c.CreatedAt)
            .ToListAsync();
    }

    // ============================================================
    // CLAIM HISTORY
    // ============================================================

    public async Task AddHistoryAsync(
        ClaimHistory history)
    {
        _context.ClaimHistories.Add(history);

        await _context.SaveChangesAsync();
    }

    // ============================================================
    // IMAGE
    // ============================================================

    public async Task AddImageAsync(
        ClaimImage image)
    {
        _context.ClaimImages.Add(image);

        await _context.SaveChangesAsync();
    }

    // ============================================================
    // STATISTICS
    // ============================================================

    public async Task<ClaimStatistics> GetStatisticsAsync()
    {
        var claims =
            _context.Claims.AsNoTracking();

        return new ClaimStatistics
        {
            TotalClaims =
                await claims.CountAsync(),

            PendingClaims =
                await claims.CountAsync(
                    c => c.Status == "Pending"),

            UnderReviewClaims =
                await claims.CountAsync(
                    c => c.Status == "UnderReview"),

            SeniorReviewClaims =
                await claims.CountAsync(
                    c => c.Status == "SeniorAgentReview"),

            ApprovedClaims =
                await claims.CountAsync(
                    c => c.Status == "Approved"),

            RejectedClaims =
                await claims.CountAsync(
                    c => c.Status == "Rejected"),

            TotalClaimAmount =
                await claims.SumAsync(
                    c => c.ClaimAmount),

            ApprovedClaimAmount =
                await claims
                    .Where(c => c.Status == "Approved")
                    .SumAsync(c => c.ClaimAmount)
        };
    }
}