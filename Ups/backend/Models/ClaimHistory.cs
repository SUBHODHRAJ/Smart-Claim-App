using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class ClaimHistory
{
    public int Id { get; set; }

    [Required]
    public int ClaimId { get; set; }

    public Claim? Claim { get; set; }

    [Required]
    [MaxLength(30)]
    public string PreviousStatus { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string NewStatus { get; set; } = string.Empty;

    public int? ChangedBy { get; set; }

    public User? ChangedByUser { get; set; }

    [MaxLength(2000)]
    public string? Comment { get; set; }

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}