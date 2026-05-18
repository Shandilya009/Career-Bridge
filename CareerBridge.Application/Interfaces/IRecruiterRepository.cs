using CareerBridge.Domain.Entities;

namespace CareerBridge.Application.Interfaces;

public interface IRecruiterRepository
{
    Task<Recruiter?> GetByUserIdAsync(string userId);
    Task<Recruiter?> GetByIdAsync(string id);
    Task<IEnumerable<Recruiter>> GetAllAsync();
    Task CreateAsync(Recruiter recruiter);
    Task UpdateAsync(string id, Recruiter recruiter);
}
