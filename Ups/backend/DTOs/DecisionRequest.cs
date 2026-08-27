using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class DecisionRequest
{
    [Required]
    [MinLength(3)]
    [MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;
}