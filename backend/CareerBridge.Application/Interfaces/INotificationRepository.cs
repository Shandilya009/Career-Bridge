using CareerBridge.Domain.Entities;

namespace CareerBridge.Application.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetByUserIdAsync(string userId);
    Task CreateAsync(Notification notification);
    Task MarkAsReadAsync(string id);
}
