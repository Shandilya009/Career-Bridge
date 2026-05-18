using CareerBridge.Application.Interfaces;
using CareerBridge.Domain.Entities;
using CareerBridge.Infrastructure.Persistence;
using MongoDB.Driver;

namespace CareerBridge.Infrastructure.Repositories;

public class RecruiterRepository : IRecruiterRepository
{
    private readonly IMongoCollection<Recruiter> _col;
    public RecruiterRepository(MongoDbContext ctx) => _col = ctx.Recruiters;

    public async Task<Recruiter?> GetByUserIdAsync(string userId) =>
        await _col.Find(r => r.UserId == userId).FirstOrDefaultAsync();
    public async Task<Recruiter?> GetByIdAsync(string id) =>
        await _col.Find(r => r.Id == id).FirstOrDefaultAsync();
    public async Task<IEnumerable<Recruiter>> GetAllAsync() =>
        await _col.Find(_ => true).ToListAsync();
    public async Task CreateAsync(Recruiter r) => await _col.InsertOneAsync(r);
    public async Task UpdateAsync(string id, Recruiter r)
    {
        r.UpdatedAt = DateTime.UtcNow;
        await _col.ReplaceOneAsync(x => x.Id == id, r);
    }
}
