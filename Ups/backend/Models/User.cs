using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Role { get; set; } = "Customer";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Claims submitted by this customer
    public ICollection<Claim> Claims { get; set; } = new List<Claim>();

    // Claims assigned to this agent
    public ICollection<Claim> AssignedClaims { get; set; } = new List<Claim>();

    // Notifications belonging to this user
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}