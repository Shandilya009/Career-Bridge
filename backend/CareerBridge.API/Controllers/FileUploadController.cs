using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CareerBridge.API.Controllers;

[ApiController]
[Route("api/upload")]
[Authorize]
public class FileUploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<FileUploadController> _logger;
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
    private static readonly string[] AllowedResumeExtensions = { ".pdf", ".doc", ".docx" };
    private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png" };
    private static readonly string[] AllowedProofExtensions = { ".pdf", ".jpg", ".jpeg", ".png" };

    public FileUploadController(IWebHostEnvironment env, ILogger<FileUploadController> logger)
    {
        _env = env;
        _logger = logger;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>
    /// Upload resume/CV (PDF, DOC, DOCX - Max 5MB)
    /// </summary>
    [HttpPost("resume")]
    public async Task<IActionResult> UploadResume(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            if (file.Length > MaxFileSize)
                return BadRequest(new { message = "File size exceeds 5MB limit" });

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedResumeExtensions.Contains(extension))
                return BadRequest(new { message = "Only PDF, DOC, and DOCX files are allowed" });

            var uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads", "resumes");
            Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{UserId}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/resumes/{uniqueFileName}";
            _logger.LogInformation("Resume uploaded: {FileName} by user {UserId}", uniqueFileName, UserId);

            return Ok(new { 
                message = "Resume uploaded successfully", 
                fileUrl,
                fileName = file.FileName,
                fileSize = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading resume for user {UserId}", UserId);
            return StatusCode(500, new { message = "Error uploading file" });
        }
    }

    /// <summary>
    /// Upload profile photo (JPG, PNG - Max 2MB)
    /// </summary>
    [HttpPost("profile-photo")]
    public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            if (file.Length > 2 * 1024 * 1024) // 2MB for images
                return BadRequest(new { message = "File size exceeds 2MB limit" });

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedImageExtensions.Contains(extension))
                return BadRequest(new { message = "Only JPG and PNG files are allowed" });

            var uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads", "photos");
            Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{UserId}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/photos/{uniqueFileName}";
            _logger.LogInformation("Profile photo uploaded: {FileName} by user {UserId}", uniqueFileName, UserId);

            return Ok(new { 
                message = "Profile photo uploaded successfully", 
                fileUrl,
                fileName = file.FileName,
                fileSize = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile photo for user {UserId}", UserId);
            return StatusCode(500, new { message = "Error uploading file" });
        }
    }

    /// <summary>
    /// Upload CGPA proof document (PDF, JPG, PNG - Max 5MB)
    /// </summary>
    [HttpPost("cgpa-proof")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> UploadCGPAProof(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            if (file.Length > MaxFileSize)
                return BadRequest(new { message = "File size exceeds 5MB limit" });

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedProofExtensions.Contains(extension))
                return BadRequest(new { message = "Only PDF, JPG, and PNG files are allowed" });

            var uploadsFolder = Path.Combine(_env.ContentRootPath, "uploads", "cgpa-proofs");
            Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{UserId}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/cgpa-proofs/{uniqueFileName}";
            _logger.LogInformation("CGPA proof uploaded: {FileName} by user {UserId}", uniqueFileName, UserId);

            return Ok(new { 
                message = "CGPA proof uploaded successfully", 
                fileUrl,
                fileName = file.FileName,
                fileSize = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading CGPA proof for user {UserId}", UserId);
            return StatusCode(500, new { message = "Error uploading file" });
        }
    }

    /// <summary>
    /// Delete uploaded file
    /// </summary>
    [HttpDelete]
    public IActionResult DeleteFile([FromQuery] string fileUrl)
    {
        try
        {
            if (string.IsNullOrEmpty(fileUrl))
                return BadRequest(new { message = "File URL is required" });

            var filePath = Path.Combine(_env.ContentRootPath, fileUrl.TrimStart('/'));
            
            if (!System.IO.File.Exists(filePath))
                return NotFound(new { message = "File not found" });

            // Security check: ensure file belongs to current user
            var fileName = Path.GetFileName(filePath);
            if (!fileName.StartsWith(UserId))
                return Forbid();

            System.IO.File.Delete(filePath);
            _logger.LogInformation("File deleted: {FilePath} by user {UserId}", filePath, UserId);

            return Ok(new { message = "File deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file for user {UserId}", UserId);
            return StatusCode(500, new { message = "Error deleting file" });
        }
    }
}
