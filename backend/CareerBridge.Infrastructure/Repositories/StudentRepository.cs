using CareerBridge.Application.Interfaces;
using CareerBridge.Domain.Entities;
using CareerBridge.Infrastructure.Persistence;
using MongoDB.Driver;

namespace CareerBridge.Infrastructure.Repositories;

public class StudentRepository : IStudentRepository
{
    private readonly IMongoCollection<Student> _col;
    public StudentRepository(MongoDbContext ctx) => _col = ctx.Students;

    public async Task<Student?> GetByUserIdAsync(string userId) =>
        await _col.Find(s => s.UserId == userId).FirstOrDefaultAsync();
    public async Task<Student?> GetByIdAsync(string id) =>
        await _col.Find(s => s.Id == id).FirstOrDefaultAsync();
    public async Task<IEnumerable<Student>> GetAllAsync() =>
        await _col.Find(_ => true).ToListAsync();
    public async Task CreateAsync(Student s) => await _col.InsertOneAsync(s);
    public async Task UpdateAsync(string id, Student s)
    {
        s.UpdatedAt = DateTime.UtcNow;
        await _col.ReplaceOneAsync(x => x.Id == id, s);
    }
    public async Task DeleteAsync(string id) =>
        await _col.DeleteOneAsync(s => s.Id == id);
}
