using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CareerBridge.Application.DTOs.Student;
using CareerBridge.Application.Interfaces;

namespace CareerBridge.API.Controllers;

[ApiController]
[Route("api/student")]
[Authorize(Roles = "Student")]
public class StudentController : ControllerBase
{
    private readonly IStudentRepository _students;
    private readonly IApplicationRepository _apps;
    private readonly IInterviewRepository _interviews;

    public StudentController(IStudentRepository students,
        IApplicationRepository apps, IInterviewRepository interviews)
    {
        _students = students; _apps = apps; _interviews = interviews;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var s = await _students.GetByUserIdAsync(UserId);
        if (s == null) return NotFound();
        return Ok(s);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateStudentProfileDto dto)
    {
        var s = await _students.GetByUserIdAsync(UserId);
        if (s == null) return NotFound();

        s.FirstName      = dto.FirstName;
        s.LastName       = dto.LastName;
        s.Department     = dto.Department;
        s.CGPA           = dto.CGPA;
        s.GraduationYear = dto.GraduationYear;
        s.Skills         = dto.Skills;
        
        // Update file URLs if provided
        if (!string.IsNullOrEmpty(dto.ResumeUrl))
            s.ResumeUrl = dto.ResumeUrl;
        if (!string.IsNullOrEmpty(dto.ProfilePhotoUrl))
            s.ProfilePhotoUrl = dto.ProfilePhotoUrl;
        if (!string.IsNullOrEmpty(dto.CGPAProofUrl))
        {
            s.CGPAProofUrl = dto.CGPAProofUrl;
            s.IsCGPAVerified = false; // Reset verification when new proof is uploaded
        }

        await _students.UpdateAsync(s.Id, s);
        return Ok(new { message = "Profile updated.", data = s });
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var student = await _students.GetByUserIdAsync(UserId);
        if (student == null) return NotFound();
        var apps = await _apps.GetByStudentIdAsync(student.Id);
        var interviews = await _interviews.GetByStudentIdAsync(student.Id);
        return Ok(new
        {
            student,
            totalApplications = apps.Count(),
            interviews         = interviews.Count()
        });
    }

    [HttpPost("resume/upload")]
    public async Task<IActionResult> UploadResume(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
        if (Path.GetExtension(file.FileName).ToLower() != ".pdf")
            return BadRequest("Only PDF files are allowed.");
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest("File size must not exceed 5MB.");

        var uploads = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "resumes");
        Directory.CreateDirectory(uploads);
        var fileName = $"{Guid.NewGuid()}.pdf";
        var filePath = Path.Combine(uploads, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
            await file.CopyToAsync(stream);

        var student = await _students.GetByUserIdAsync(UserId);
        if (student != null)
        {
            student.ResumeUrl = $"/uploads/resumes/{fileName}";
            await _students.UpdateAsync(student.Id, student);
        }

        return Ok(new { resumeUrl = $"/uploads/resumes/{fileName}" });
    }

    [HttpPost("cgpa-proof/upload")]
    public async Task<IActionResult> UploadCGPAProof(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
        var ext = Path.GetExtension(file.FileName).ToLower();
        if (ext != ".pdf" && ext != ".jpg" && ext != ".jpeg" && ext != ".png")
            return BadRequest("Only PDF and image files are allowed.");
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest("File size must not exceed 5MB.");

        var uploads = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "cgpa-proofs");
        Directory.CreateDirectory(uploads);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploads, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
            await file.CopyToAsync(stream);

        var student = await _students.GetByUserIdAsync(UserId);
        if (student != null)
        {
            student.CGPAProofUrl = $"/uploads/cgpa-proofs/{fileName}";
            student.IsCGPAVerified = false; // Require re-verification
            await _students.UpdateAsync(student.Id, student);
        }

        return Ok(new { cgpaProofUrl = $"/uploads/cgpa-proofs/{fileName}" });
    }
}
