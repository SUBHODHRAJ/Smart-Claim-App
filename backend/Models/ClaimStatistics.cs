namespace backend.Models;

public class ClaimStatistics
{
    public int TotalClaims { get; set; }

    public int PendingClaims { get; set; }

    public int UnderReviewClaims { get; set; }

    public int SeniorReviewClaims { get; set; }

    public int ApprovedClaims { get; set; }

    public int RejectedClaims { get; set; }

    public decimal TotalClaimAmount { get; set; }

    public decimal ApprovedClaimAmount { get; set; }
}