using CareerBridge.Domain.Entities;

namespace CareerBridge.Application.Interfaces;

public interface IJobRepository
{
    Task<IEnumerable<Job>> GetAllActiveAsync();
    Task<IEnumerable<Job>> GetByRecruiterIdAsync(string recruiterId);
    Task<Job?> GetByIdAsync(string id);
    Task CreateAsync(Job job);
    Task UpdateAsync(string id, Job job);
    Task DeleteAsync(string id);
    Task<long> CountAsync();
}
