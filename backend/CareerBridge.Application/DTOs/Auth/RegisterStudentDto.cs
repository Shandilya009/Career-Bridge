namespace CareerBridge.Application.DTOs.Auth;

public class RegisterStudentDto
{
    public string Email      { get; set; } = string.Empty;
    public string Password   { get; set; } = string.Empty;
    public string FirstName  { get; set; } = string.Empty;
    public string LastName   { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int    GraduationYear { get; set; }
}
