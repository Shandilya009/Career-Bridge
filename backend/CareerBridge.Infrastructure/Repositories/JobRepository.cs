using CareerBridge.Application.Interfaces;
using CareerBridge.Domain.Entities;
using CareerBridge.Infrastructure.Persistence;
using MongoDB.Driver;

namespace CareerBridge.Infrastructure.Repositories;

public class JobRepository : IJobRepository
{
    private readonly IMongoCollection<Job> _col;
    public JobRepository(MongoDbContext ctx) => _col = ctx.Jobs;

    public async Task<IEnumerable<Job>> GetAllActiveAsync() =>
        await _col.Find(j => j.IsActive).ToListAsync();
    public async Task<IEnumerable<Job>> GetByRecruiterIdAsync(string rid) =>
        await _col.Find(j => j.RecruiterId == rid).ToListAsync();
    public async Task<Job?> GetByIdAsync(string id) =>
        await _col.Find(j => j.Id == id).FirstOrDefaultAsync();
    public async Task CreateAsync(Job j) => await _col.InsertOneAsync(j);
    public async Task UpdateAsync(string id, Job j)
    {
        j.UpdatedAt = DateTime.UtcNow;
        await _col.ReplaceOneAsync(x => x.Id == id, j);
    }
    public async Task DeleteAsync(string id) =>
        await _col.DeleteOneAsync(j => j.Id == id);
    public async Task<long> CountAsync() =>
        await _col.CountDocumentsAsync(_ => true);
}
