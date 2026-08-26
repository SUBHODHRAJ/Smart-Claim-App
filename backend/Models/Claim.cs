using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Claim
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string ClaimNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string PackageId { get; set; } = string.Empty;

    [Required]
    public int CustomerId { get; set; }

    public User? Customer { get; set; }

    public int? AssignedAgentId { get; set; }

    public User? AssignedAgent { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string DamageType { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal ClaimAmount { get; set; }

    [Required]
    [MaxLength(20)]
    public string Priority { get; set; } = "Low";

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Pending";

    [Required]
    [MaxLength(50)]
    public string ValidationStatus { get; set; } = "Valid";

    [MaxLength(2000)]
    public string? AgentComment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ClaimImage> Images { get; set; } = new List<ClaimImage>();

    public ICollection<ClaimHistory> History { get; set; } = new List<ClaimHistory>();

    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}