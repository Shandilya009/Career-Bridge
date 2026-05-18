using CareerBridge.Application.Interfaces;
using CareerBridge.Domain.Entities;
using CareerBridge.Infrastructure.Persistence;
using MongoDB.Driver;

namespace CareerBridge.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _col;
    public UserRepository(MongoDbContext ctx) => _col = ctx.Users;

    public async Task<User?> GetByEmailAsync(string email) =>
        await _col.Find(u => u.Email == email).FirstOrDefaultAsync();
    public async Task<User?> GetByIdAsync(string id) =>
        await _col.Find(u => u.Id == id).FirstOrDefaultAsync();
    public async Task CreateAsync(User user) =>
        await _col.InsertOneAsync(user);
    public async Task UpdateAsync(string id, User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        await _col.ReplaceOneAsync(u => u.Id == id, user);
    }
}
