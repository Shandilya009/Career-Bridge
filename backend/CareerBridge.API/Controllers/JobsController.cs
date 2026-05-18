using Microsoft.AspNetCore.Mvc;
using CareerBridge.Application.Interfaces;

namespace CareerBridge.API.Controllers;

[ApiController]
[Route("api/jobs")]
public class JobsController : ControllerBase
{
    private readonly IJobRepository _jobs;
    public JobsController(IJobRepository jobs) => _jobs = jobs;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _jobs.GetAllActiveAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var job = await _jobs.GetByIdAsync(id);
        return job == null ? NotFound() : Ok(job);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string? keyword,
        [FromQuery] string? location, [FromQuery] string? jobType)
    {
        var jobs = await _jobs.GetAllActiveAsync();
        if (!string.IsNullOrEmpty(keyword))
            jobs = jobs.Where(j => j.Title.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                               || j.Description.Contains(keyword, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrEmpty(location))
            jobs = jobs.Where(j => j.Location.Contains(location, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrEmpty(jobType))
            jobs = jobs.Where(j => j.JobType.Equals(jobType, StringComparison.OrdinalIgnoreCase));
        return Ok(jobs);
    }
}
