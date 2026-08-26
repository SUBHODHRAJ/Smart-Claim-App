using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Claim> Claims => Set<Claim>();

    public DbSet<ClaimImage> ClaimImages => Set<ClaimImage>();

    public DbSet<ClaimHistory> ClaimHistories => Set<ClaimHistory>();

    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // USER
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // CLAIM NUMBER
        modelBuilder.Entity<Claim>()
            .HasIndex(c => c.ClaimNumber)
            .IsUnique();

        // CUSTOMER -> CLAIMS
        modelBuilder.Entity<Claim>()
            .HasOne(c => c.Customer)
            .WithMany(u => u.Claims)
            .HasForeignKey(c => c.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        // AGENT -> CLAIMS
        modelBuilder.Entity<Claim>()
            .HasOne(c => c.AssignedAgent)
            .WithMany(u => u.AssignedClaims)
            .HasForeignKey(c => c.AssignedAgentId)
            .OnDelete(DeleteBehavior.SetNull);

        // CLAIM -> IMAGES
        modelBuilder.Entity<ClaimImage>()
            .HasOne(i => i.Claim)
            .WithMany(c => c.Images)
            .HasForeignKey(i => i.ClaimId)
            .OnDelete(DeleteBehavior.Cascade);

        // CLAIM -> HISTORY
        modelBuilder.Entity<ClaimHistory>()
            .HasOne(h => h.Claim)
            .WithMany(c => c.History)
            .HasForeignKey(h => h.ClaimId)
            .OnDelete(DeleteBehavior.Cascade);

        // HISTORY -> USER
        modelBuilder.Entity<ClaimHistory>()
            .HasOne(h => h.ChangedByUser)
            .WithMany()
            .HasForeignKey(h => h.ChangedBy)
            .OnDelete(DeleteBehavior.SetNull);

        // USER -> NOTIFICATIONS
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // CLAIM -> NOTIFICATIONS
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Claim)
            .WithMany(c => c.Notifications)
            .HasForeignKey(n => n.ClaimId)
            .OnDelete(DeleteBehavior.SetNull);

        // DECIMAL PRECISION
        modelBuilder.Entity<Claim>()
            .Property(c => c.ClaimAmount)
            .HasPrecision(18, 2);
    }
}