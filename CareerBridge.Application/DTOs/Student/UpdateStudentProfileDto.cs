namespace CareerBridge.Application.DTOs.Student;

public class UpdateStudentProfileDto
{
    public string       FirstName    { get; set; } = string.Empty;
    public string       LastName     { get; set; } = string.Empty;
    public string       Department   { get; set; } = string.Empty;
    public double       CGPA         { get; set; }
    public int          GraduationYear { get; set; }
    public List<string> Skills       { get; set; } = new();
    
    // File URLs
    public string?      ResumeUrl { get; set; }
    public string?      ProfilePhotoUrl { get; set; }
    public string?      CGPAProofUrl { get; set; }
}
