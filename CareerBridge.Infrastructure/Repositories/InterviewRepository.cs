using CareerBridge.Application.Interfaces;
using CareerBridge.Domain.Entities;
using CareerBridge.Infrastructure.Persistence;
using MongoDB.Driver;

namespace CareerBridge.Infrastructure.Repositories;

public class InterviewRepository : IInterviewRepository
{
    private readonly IMongoCollection<Interview> _col;
    public InterviewRepository(MongoDbContext ctx) => _col = ctx.Interviews;

    public async Task<IEnumerable<Interview>> GetByStudentIdAsync(string sid) =>
        await _col.Find(i => i.StudentId == sid).ToListAsync();
    public async Task<IEnumerable<Interview>> GetByJobIdAsync(string jid) =>
        await _col.Find(i => i.JobId == jid).ToListAsync();
    public async Task CreateAsync(Interview i) => await _col.InsertOneAsync(i);
    public async Task UpdateAsync(string id, Interview i)
    {
        i.UpdatedAt = DateTime.UtcNow;
        await _col.ReplaceOneAsync(x => x.Id == id, i);
    }
}
