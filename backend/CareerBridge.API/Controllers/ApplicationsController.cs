using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CareerBridge.Application.Interfaces;
using CareerBridge.Domain.Entities;
using CareerBridge.Domain.Enums;

namespace CareerBridge.API.Controllers;

[ApiController]
[Route("api/applications")]
[Authorize(Roles = "Student")]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationRepository _apps;
    private readonly IStudentRepository     _students;
    private readonly IJobRepository         _jobs;
    private readonly INotificationRepository _notifications;

    public ApplicationsController(IApplicationRepository apps, IStudentRepository students,
        IJobRepository jobs, INotificationRepository notifications)
    {
        _apps = apps; _students = students;
        _jobs = jobs; _notifications = notifications;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpPost("apply/{jobId}")]
    public async Task<IActionResult> Apply(string jobId)
    {
        var student = await _students.GetByUserIdAsync(UserId);
        if (student == null) return NotFound("Student profile not found.");

        var job = await _jobs.GetByIdAsync(jobId);
        if (job == null || !job.IsActive) return NotFound("Job not found.");

        var existing = await _apps.GetByStudentAndJobAsync(student.Id, jobId);
        if (existing != null) return Conflict(new { message = "Already applied for this job." });

        var app = new JobApplication { JobId = jobId, StudentId = student.Id };
        await _apps.CreateAsync(app);
        return Ok(new { message = "Applied successfully.", data = app });
    }

    [HttpDelete("withdraw/{jobId}")]
    public async Task<IActionResult> Withdraw(string jobId)
    {
        var student = await _students.GetByUserIdAsync(UserId);
        if (student == null) return NotFound();

        var app = await _apps.GetByStudentAndJobAsync(student.Id, jobId);
        if (app == null) return NotFound("Application not found.");

        app.Status = ApplicationStatus.Withdrawn;
        await _apps.UpdateAsync(app.Id, app);
        return Ok(new { message = "Application withdrawn." });
    }

    [HttpGet("my")]
    public async Task<IActionResult> MyApplications()
    {
        var student = await _students.GetByUserIdAsync(UserId);
        if (student == null) return NotFound();

        var apps = await _apps.GetByStudentIdAsync(student.Id);
        var result = new List<object>();
        foreach (var app in apps)
        {
            var job = await _jobs.GetByIdAsync(app.JobId);
            result.Add(new { application = app, job });
        }
        return Ok(result);
    }
}
