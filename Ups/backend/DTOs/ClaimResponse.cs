namespace backend.DTOs;

public class ClaimResponse
{
    public int Id { get; set; }

    public string ClaimNumber { get; set; } = string.Empty;

    public string PackageId { get; set; } = string.Empty;

    public int CustomerId { get; set; }

    public string? CustomerName { get; set; }

    public string? CustomerEmail { get; set; }

    public int? AssignedAgentId { get; set; }

    public string? AssignedAgentName { get; set; }

    public string Description { get; set; } = string.Empty;

    public string DamageType { get; set; } = string.Empty;

    public decimal ClaimAmount { get; set; }

    public string Priority { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string ValidationStatus { get; set; } = string.Empty;

    public string? AgentComment { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public List<ClaimImageResponse> Images { get; set; } = new();

    public List<ClaimHistoryResponse> History { get; set; } = new();
}

public class ClaimImageResponse
{
    public int Id { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string? OriginalFileName { get; set; }

    public DateTime UploadedAt { get; set; }
}

public class ClaimHistoryResponse
{
    public int Id { get; set; }

    public string PreviousStatus { get; set; } = string.Empty;

    public string NewStatus { get; set; } = string.Empty;

    public string? ChangedByName { get; set; }

    public string? Comment { get; set; }

    public DateTime ChangedAt { get; set; }
}