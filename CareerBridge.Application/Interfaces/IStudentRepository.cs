using CareerBridge.Domain.Entities;

namespace CareerBridge.Application.Interfaces;

public interface IStudentRepository
{
    Task<Student?> GetByUserIdAsync(string userId);
    Task<Student?> GetByIdAsync(string id);
    Task<IEnumerable<Student>> GetAllAsync();
    Task CreateAsync(Student student);
    Task UpdateAsync(string id, Student student);
    Task DeleteAsync(string id);
}
