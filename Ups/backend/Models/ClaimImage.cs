using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class ClaimImage
{
    public int Id { get; set; }

    [Required]
    public int ClaimId { get; set; }

    public Claim? Claim { get; set; }

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? OriginalFileName { get; set; }

    [MaxLength(100)]
    public string? ContentType { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}