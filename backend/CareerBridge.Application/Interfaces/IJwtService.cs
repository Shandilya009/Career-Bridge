using CareerBridge.Domain.Entities;

namespace CareerBridge.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
    string GenerateRefreshToken();
}
