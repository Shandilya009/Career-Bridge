using CareerBridge.Application.Interfaces;
using CareerBridge.Domain.Entities;
using CareerBridge.Infrastructure.Persistence;
using MongoDB.Driver;

namespace CareerBridge.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly IMongoCollection<Notification> _col;
    public NotificationRepository(MongoDbContext ctx) => _col = ctx.Notifications;

    public async Task<IEnumerable<Notification>> GetByUserIdAsync(string uid) =>
        await _col.Find(n => n.UserId == uid).ToListAsync();
    public async Task CreateAsync(Notification n) => await _col.InsertOneAsync(n);
    public async Task MarkAsReadAsync(string id) =>
        await _col.UpdateOneAsync(n => n.Id == id,
            Builders<Notification>.Update.Set(n => n.IsRead, true));
}
