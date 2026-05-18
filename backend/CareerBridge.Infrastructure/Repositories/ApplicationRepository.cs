using CareerBridge.Application.Interfaces;
using CareerBridge.Domain.Entities;
using CareerBridge.Infrastructure.Persistence;
using MongoDB.Driver;

namespace CareerBridge.Infrastructure.Repositories;

public class ApplicationRepository : IApplicationRepository
{
    private readonly IMongoCollection<JobApplication> _col;
    public ApplicationRepository(MongoDbContext ctx) => _col = ctx.JobApplications;

    public async Task<IEnumerable<JobApplication>> GetByStudentIdAsync(string sid) =>
        await _col.Find(a => a.StudentId == sid).ToListAsync();
    public async Task<IEnumerable<JobApplication>> GetByJobIdAsync(string jid) =>
        await _col.Find(a => a.JobId == jid).ToListAsync();
    public async Task<JobApplication?> GetByStudentAndJobAsync(string sid, string jid) =>
        await _col.Find(a => a.StudentId == sid && a.JobId == jid).FirstOrDefaultAsync();
    public async Task<JobApplication?> GetByIdAsync(string id) =>
        await _col.Find(a => a.Id == id).FirstOrDefaultAsync();
    public async Task CreateAsync(JobApplication a) => await _col.InsertOneAsync(a);
    public async Task UpdateAsync(string id, JobApplication a)
    {
        a.UpdatedAt = DateTime.UtcNow;
        await _col.ReplaceOneAsync(x => x.Id == id, a);
    }
    public async Task<long> CountAsync() =>
        await _col.CountDocumentsAsync(_ => true);
}
