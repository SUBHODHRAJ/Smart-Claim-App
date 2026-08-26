using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext context)
    {
        // Apply any pending migrations automatically.
        await context.Database.MigrateAsync();

        // --------------------------------------------------------
        // Customer
        // --------------------------------------------------------
        if (!await context.Users.AnyAsync(
                u => u.Email == "demo.customer@test.com"))
        {
            context.Users.Add(new User
            {
                Name = "Demo Customer",
                Email = "demo.customer@test.com",
                PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword("Demo@12345"),
                Role = "Customer",
                CreatedAt = DateTime.UtcNow
            });
        }

        // --------------------------------------------------------
        // Agent
        // --------------------------------------------------------
        if (!await context.Users.AnyAsync(
                u => u.Email == "demo.agent@test.com"))
        {
            context.Users.Add(new User
            {
                Name = "Demo Agent",
                Email = "demo.agent@test.com",
                PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword("Demo@12345"),
                Role = "Agent",
                CreatedAt = DateTime.UtcNow
            });
        }

        // --------------------------------------------------------
        // Senior Agent  (one only)
        // --------------------------------------------------------
        if (!await context.Users.AnyAsync(
                u => u.Email == "senior@ups.com"))
        {
            context.Users.Add(new User
            {
                Name = "UPS Senior Agent",
                Email = "senior@ups.com",
                PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword("Senior@123"),
                Role = "SeniorAgent",
                CreatedAt = DateTime.UtcNow
            });
        }

        await context.SaveChangesAsync();
    }
}