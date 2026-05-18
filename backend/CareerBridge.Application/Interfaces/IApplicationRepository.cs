using CareerBridge.Domain.Entities;

namespace CareerBridge.Application.Interfaces;

public interface IApplicationRepository
{
    Task<IEnumerable<JobApplication>> GetByStudentIdAsync(string studentId);
    Task<IEnumerable<JobApplication>> GetByJobIdAsync(string jobId);
    Task<JobApplication?> GetByStudentAndJobAsync(string studentId, string jobId);
    Task<JobApplication?> GetByIdAsync(string id);
    Task CreateAsync(JobApplication application);
    Task UpdateAsync(string id, JobApplication application);
    Task<long> CountAsync();
}
