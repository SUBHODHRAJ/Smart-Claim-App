using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateClaimRequest
{
    [Required]
    [MaxLength(100)]
    public string PackageId { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string DamageType { get; set; } = string.Empty;

    [Range(0.01, 1000000)]
    public decimal ClaimAmount { get; set; }
}