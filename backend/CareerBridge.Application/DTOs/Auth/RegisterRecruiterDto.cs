namespace CareerBridge.Application.DTOs.Auth;

public class RegisterRecruiterDto
{
    public string Email         { get; set; } = string.Empty;
    public string Password      { get; set; } = string.Empty;
    public string CompanyName   { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Industry      { get; set; } = string.Empty;
}
