namespace CareerBridge.Application.DTOs.Auth;

public class AuthResponseDto
{
    public string Token        { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string Role         { get; set; } = string.Empty;
    public string UserId       { get; set; } = string.Empty;
    public string Name         { get; set; } = string.Empty;
}
