using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationsController(
        NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    // ============================================================
    // GET MY NOTIFICATIONS
    // ============================================================

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotifications()
    {
        var userId = GetCurrentUserId();

        var notifications =
            await _notificationService
                .GetUserNotificationsAsync(userId);

        return Ok(notifications);
    }

    // ============================================================
    // GET UNREAD COUNT
    // ============================================================

    [HttpGet("unread-count")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetCurrentUserId();

        var count =
            await _notificationService
                .GetUnreadCountAsync(userId);

        return Ok(new
        {
            unreadCount = count
        });
    }

    // ============================================================
    // MARK ONE AS READ
    // ============================================================

    [HttpPut("{id:int}/read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(
        int id)
    {
        var userId = GetCurrentUserId();

        var success =
            await _notificationService
                .MarkAsReadAsync(
                    id,
                    userId);

        if (!success)
        {
            return NotFound(new
            {
                message = "Notification not found."
            });
        }

        return Ok(new
        {
            message = "Notification marked as read."
        });
    }

    // ============================================================
    // MARK ALL AS READ
    // ============================================================

    [HttpPut("read-all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();

        var count =
            await _notificationService
                .MarkAllAsReadAsync(userId);

        return Ok(new
        {
            message =
                $"{count} notification(s) marked as read.",
            count
        });
    }

    // ============================================================
    // CURRENT USER
    // ============================================================

    private int GetCurrentUserId()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
                userId,
                out var id))
        {
            throw new UnauthorizedAccessException(
                "Invalid user identity.");
        }

        return id;
    }
}