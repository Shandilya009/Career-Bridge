using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CareerBridge.Application.Interfaces;

namespace CareerBridge.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly IStudentRepository _students;
    private readonly IRecruiterRepository _recruiters;
    private readonly IJobRepository _jobs;
    private readonly IApplicationRepository _applications;
    private readonly INotificationRepository _notifications;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        IUserRepository users,
        IStudentRepository students,
        IRecruiterRepository recruiters,
        IJobRepository jobs,
        IApplicationRepository applications,
        INotificationRepository notifications,
        ILogger<AdminController> logger)
    {
        _users = users;
        _students = students;
        _recruiters = recruiters;
        _jobs = jobs;
        _applications = applications;
        _notifications = notifications;
        _logger = logger;
    }

    private string AdminUserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>
    /// Get system statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics()
    {
        var students = await _students.GetAllAsync();
        var recruiters = await _recruiters.GetAllAsync();
        var totalJobsCount = await _jobs.CountAsync();
        var activeJobsList = await _jobs.GetAllActiveAsync();
        var totalApplicationsCount = await _applications.CountAsync();

        return Ok(new
        {
            totalStudents = students.Count(),
            totalRecruiters = recruiters.Count(),
            approvedRecruiters = recruiters.Count(r => r.IsApproved),
            pendingRecruiters = recruiters.Count(r => !r.IsApproved),
            totalJobs = totalJobsCount,
            activeJobs = activeJobsList.Count(),
            totalApplications = totalApplicationsCount,
            verifiedCGPAs = students.Count(s => s.IsCGPAVerified),
            pendingCGPAVerifications = students.Count(s => !string.IsNullOrEmpty(s.CGPAProofUrl) && !s.IsCGPAVerified)
        });
    }

    /// <summary>
    /// Get all recruiters
    /// </summary>
    [HttpGet("recruiters")]
    public async Task<IActionResult> GetAllRecruiters([FromQuery] bool? approved = null)
    {
        var recruiters = await _recruiters.GetAllAsync();
        
        if (approved.HasValue)
            recruiters = recruiters.Where(r => r.IsApproved == approved.Value);

        return Ok(recruiters);
    }

    /// <summary>
    /// Approve recruiter
    /// </summary>
    [HttpPut("recruiters/{id}/approve")]
    public async Task<IActionResult> ApproveRecruiter(string id)
    {
        var recruiter = await _recruiters.GetByIdAsync(id);
        if (recruiter == null)
            return NotFound(new { message = "Recruiter not found" });

        recruiter.IsApproved = true;
        await _recruiters.UpdateAsync(id, recruiter);

        // Send notification
        await _notifications.CreateAsync(new Domain.Entities.Notification
        {
            UserId = recruiter.UserId,
            Title = "Account Approved",
            Message = "Your recruiter account has been approved. You can now post jobs."
        });

        _logger.LogInformation("Recruiter {RecruiterId} approved by admin {AdminId}", id, AdminUserId);

        return Ok(new { message = "Recruiter approved successfully" });
    }

    /// <summary>
    /// Reject/Block recruiter
    /// </summary>
    [HttpPut("recruiters/{id}/reject")]
    public async Task<IActionResult> RejectRecruiter(string id)
    {
        var recruiter = await _recruiters.GetByIdAsync(id);
        if (recruiter == null)
            return NotFound(new { message = "Recruiter not found" });

        recruiter.IsApproved = false;
        await _recruiters.UpdateAsync(id, recruiter);

        // Send notification
        await _notifications.CreateAsync(new Domain.Entities.Notification
        {
            UserId = recruiter.UserId,
            Title = "Account Status Updated",
            Message = "Your recruiter account approval has been revoked."
        });

        _logger.LogInformation("Recruiter {RecruiterId} rejected by admin {AdminId}", id, AdminUserId);

        return Ok(new { message = "Recruiter rejected successfully" });
    }

    /// <summary>
    /// Get students pending CGPA verification
    /// </summary>
    [HttpGet("students/pending-cgpa-verification")]
    public async Task<IActionResult> GetPendingCGPAVerifications()
    {
        var students = await _students.GetAllAsync();
        var pending = students.Where(s => 
            !string.IsNullOrEmpty(s.CGPAProofUrl) && 
            !s.IsCGPAVerified
        );

        return Ok(pending);
    }

    /// <summary>
    /// Verify student CGPA
    /// </summary>
    [HttpPut("students/{id}/verify-cgpa")]
    public async Task<IActionResult> VerifyCGPA(string id, [FromBody] VerifyCGPADto dto)
    {
        var student = await _students.GetByIdAsync(id);
        if (student == null)
            return NotFound(new { message = "Student not found" });

        if (string.IsNullOrEmpty(student.CGPAProofUrl))
            return BadRequest(new { message = "No CGPA proof uploaded" });

        student.IsCGPAVerified = dto.Approved;
        student.CGPAVerifiedAt = DateTime.UtcNow;
        student.CGPAVerifiedBy = AdminUserId;

        await _students.UpdateAsync(id, student);

        // Send notification
        await _notifications.CreateAsync(new Domain.Entities.Notification
        {
            UserId = student.UserId,
            Title = dto.Approved ? "CGPA Verified" : "CGPA Verification Failed",
            Message = dto.Approved 
                ? "Your CGPA has been verified successfully." 
                : $"Your CGPA verification was rejected. Reason: {dto.Reason}"
        });

        _logger.LogInformation("Student {StudentId} CGPA verification {Status} by admin {AdminId}", 
            id, dto.Approved ? "approved" : "rejected", AdminUserId);

        return Ok(new { message = dto.Approved ? "CGPA verified successfully" : "CGPA verification rejected" });
    }

    /// <summary>
    /// Disapprove/Reject a student's CV (Resume)
    /// </summary>
    [HttpPut("students/{id}/reject-resume")]
    public async Task<IActionResult> RejectResume(string id)
    {
        var student = await _students.GetByIdAsync(id);
        if (student == null)
            return NotFound(new { message = "Student not found" });

        if (string.IsNullOrEmpty(student.ResumeUrl))
            return BadRequest(new { message = "No resume uploaded" });

        student.ResumeUrl = null; // Clear the resume URL
        await _students.UpdateAsync(id, student);

        // Send notification
        await _notifications.CreateAsync(new Domain.Entities.Notification
        {
            UserId = student.UserId,
            Title = "Resume Rejected",
            Message = "Your uploaded resume was rejected by the admin. Please upload a new, valid CV."
        });

        _logger.LogInformation("Student {StudentId} resume rejected by admin {AdminId}", id, AdminUserId);

        return Ok(new { message = "Resume rejected successfully. Student must upload a new one." });
    }

    /// <summary>
    /// Get all students
    /// </summary>
    [HttpGet("students")]
    public async Task<IActionResult> GetAllStudents([FromQuery] bool? cgpaVerified = null)
    {
        var students = await _students.GetAllAsync();
        
        if (cgpaVerified.HasValue)
            students = students.Where(s => s.IsCGPAVerified == cgpaVerified.Value);

        return Ok(students);
    }

    /// <summary>
    /// Block/Unblock user
    /// </summary>
    [HttpPut("users/{id}/toggle-active")]
    public async Task<IActionResult> ToggleUserActive(string id)
    {
        var user = await _users.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found" });

        user.IsActive = !user.IsActive;
        await _users.UpdateAsync(id, user);

        _logger.LogInformation("User {UserId} active status toggled to {Status} by admin {AdminId}", 
            id, user.IsActive, AdminUserId);

        return Ok(new { message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully", isActive = user.IsActive });
    }
}

public class VerifyCGPADto
{
    public bool Approved { get; set; }
    public string? Reason { get; set; }
}
