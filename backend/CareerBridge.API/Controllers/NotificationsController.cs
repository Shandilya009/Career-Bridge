using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CareerBridge.Application.Interfaces;

namespace CareerBridge.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationRepository _notifications;
    public NotificationsController(INotificationRepository n) => _notifications = n;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> Get() =>
        Ok(await _notifications.GetByUserIdAsync(UserId));

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkRead(string id)
    {
        await _notifications.MarkAsReadAsync(id);
        return Ok(new { message = "Marked as read." });
    }
}
