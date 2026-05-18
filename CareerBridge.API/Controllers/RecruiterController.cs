using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CareerBridge.Application.DTOs.Job;
using CareerBridge.Application.DTOs.Interview;
using CareerBridge.Application.DTOs.Application;
using CareerBridge.Application.Interfaces;
using CareerBridge.Domain.Entities;

namespace CareerBridge.API.Controllers;

[ApiController]
[Route("api/recruiter")]
[Authorize(Roles = "Recruiter")]
public class RecruiterController : ControllerBase
{
    private readonly IRecruiterRepository  _recruiters;
    private readonly IJobRepository        _jobs;
    private readonly IApplicationRepository _apps;
    private readonly IStudentRepository    _students;
    private readonly IInterviewRepository  _interviews;
    private readonly INotificationRepository _notifications;

    public RecruiterController(IRecruiterRepository recruiters, IJobRepository jobs,
        IApplicationRepository apps, IStudentRepository students,
        IInterviewRepository interviews, INotificationRepository notifications)
    {
        _recruiters = recruiters; _jobs = jobs; _apps = apps;
        _students = students; _interviews = interviews; _notifications = notifications;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var r = await _recruiters.GetByUserIdAsync(UserId);
        return r == null ? NotFound() : Ok(r);
    }

    [HttpPost("jobs")]
    public async Task<IActionResult> PostJob([FromBody] CreateJobDto dto)
    {
        // Validate model state
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                );
            return BadRequest(new { message = "Validation failed", errors });
        }

        var recruiter = await _recruiters.GetByUserIdAsync(UserId);
        if (recruiter == null) 
            return NotFound(new { message = "Recruiter profile not found." });
        
        if (!recruiter.IsApproved) 
            return StatusCode(403, new { message = "Your recruiter account is not approved yet. Please wait for admin approval." });

        var job = new Job
        {
            RecruiterId = recruiter.Id,
            Title       = dto.Title,
            Description = dto.Description,
            JobType     = dto.JobType,
            Location    = dto.Location,
            Package     = dto.Package,
            Deadline    = dto.Deadline,
            EligibilityCriteria = new EligibilityCriteria
            {
                MinCGPA         = dto.MinCGPA,
                AllowedBranches = dto.AllowedBranches,
                GraduationYear  = dto.GraduationYear
            }
        };
        await _jobs.CreateAsync(job);
        return Ok(new { message = "Job posted successfully.", data = job });
    }

    [HttpGet("jobs")]
    public async Task<IActionResult> GetMyJobs()
    {
        var recruiter = await _recruiters.GetByUserIdAsync(UserId);
        if (recruiter == null) return NotFound();
        var jobs = await _jobs.GetByRecruiterIdAsync(recruiter.Id);
        return Ok(jobs);
    }

    [HttpPut("jobs/{id}")]
    public async Task<IActionResult> UpdateJob(string id, [FromBody] CreateJobDto dto)
    {
        var job = await _jobs.GetByIdAsync(id);
        if (job == null) return NotFound();
        job.Title = dto.Title; job.Description = dto.Description;
        job.Location = dto.Location; job.Package = dto.Package;
        job.Deadline = dto.Deadline;
        await _jobs.UpdateAsync(id, job);
        return Ok(new { message = "Job updated." });
    }

    [HttpDelete("jobs/{id}")]
    public async Task<IActionResult> DeleteJob(string id)
    {
        await _jobs.DeleteAsync(id);
        return Ok(new { message = "Job deleted." });
    }

    [HttpGet("jobs/{jobId}/applicants")]
    public async Task<IActionResult> GetApplicants(string jobId)
    {
        var apps = await _apps.GetByJobIdAsync(jobId);
        var result = new List<object>();
        foreach (var app in apps)
        {
            var student = await _students.GetByIdAsync(app.StudentId);
            result.Add(new { application = app, student });
        }
        return Ok(result);
    }

    [HttpPut("applications/{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateApplicationStatusDto dto)
    {
        var app = await _apps.GetByIdAsync(id);
        if (app == null) return NotFound();
        app.Status = Enum.Parse<CareerBridge.Domain.Enums.ApplicationStatus>(dto.Status, true);
        await _apps.UpdateAsync(id, app);

        await _notifications.CreateAsync(new Notification
        {
            UserId  = app.StudentId,
            Title   = "Application Status Updated",
            Message = $"Your application status has been changed to {dto.Status}."
        });
        return Ok(new { message = "Status updated." });
    }

    [HttpPost("interviews/schedule")]
    public async Task<IActionResult> ScheduleInterview([FromBody] ScheduleInterviewDto dto)
    {
        var interview = new Interview
        {
            ApplicationId = dto.ApplicationId,
            JobId         = dto.JobId,
            StudentId     = dto.StudentId,
            ScheduledAt   = dto.ScheduledAt,
            Location      = dto.Location,
            Mode          = dto.Mode
        };
        await _interviews.CreateAsync(interview);

        await _notifications.CreateAsync(new Notification
        {
            UserId  = dto.StudentId,
            Title   = "Interview Scheduled",
            Message = $"Your interview is scheduled on {dto.ScheduledAt:f}. Mode: {dto.Mode}."
        });
        return Ok(new { message = "Interview scheduled.", data = interview });
    }
}
