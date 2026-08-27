using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class NotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        ApplicationDbContext context,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ============================================================
    // CREATE STATUS NOTIFICATION
    // ============================================================

    public async Task CreateStatusNotificationAsync(
        Claim claim,
        string message,
        string notificationType)
    {
        var notification = new Notification
        {
            UserId = claim.CustomerId,
            ClaimId = claim.Id,
            Type = notificationType,
            Message = message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        // Simulated email/SMS notification.
        _logger.LogInformation(
            "SIMULATED NOTIFICATION | CustomerId: {CustomerId} | Claim: {ClaimNumber} | Type: {Type} | Message: {Message}",
            claim.CustomerId,
            claim.ClaimNumber,
            notificationType,
            message);
    }

    // ============================================================
    // GET USER NOTIFICATIONS
    // ============================================================

    public async Task<List<Notification>> GetUserNotificationsAsync(
        int userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    // ============================================================
    // GET UNREAD COUNT
    // ============================================================

    public async Task<int> GetUnreadCountAsync(
        int userId)
    {
        return await _context.Notifications
            .CountAsync(
                n => n.UserId == userId &&
                     !n.IsRead);
    }

    // ============================================================
    // MARK AS READ
    // ============================================================

    public async Task<bool> MarkAsReadAsync(
        int notificationId,
        int userId)
    {
        var notification =
            await _context.Notifications
                .FirstOrDefaultAsync(
                    n => n.Id == notificationId &&
                         n.UserId == userId);

        if (notification == null)
        {
            return false;
        }

        notification.IsRead = true;

        await _context.SaveChangesAsync();

        return true;
    }

    // ============================================================
    // MARK ALL AS READ
    // ============================================================

    public async Task<int> MarkAllAsReadAsync(
        int userId)
    {
        var notifications =
            await _context.Notifications
                .Where(
                    n => n.UserId == userId &&
                         !n.IsRead)
                .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();

        return notifications.Count;
    }
}