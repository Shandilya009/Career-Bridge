using CareerBridge.Domain.Entities;

namespace CareerBridge.Application.Interfaces;

public interface IInterviewRepository
{
    Task<IEnumerable<Interview>> GetByStudentIdAsync(string studentId);
    Task<IEnumerable<Interview>> GetByJobIdAsync(string jobId);
    Task CreateAsync(Interview interview);
    Task UpdateAsync(string id, Interview interview);
}
