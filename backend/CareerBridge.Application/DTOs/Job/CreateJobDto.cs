using System.ComponentModel.DataAnnotations;

namespace CareerBridge.Application.DTOs.Job;

public class CreateJobDto
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 200 characters")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required")]
    [StringLength(5000, MinimumLength = 10, ErrorMessage = "Description must be between 10 and 5000 characters")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Job type is required")]
    public string JobType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Location is required")]
    [StringLength(100, ErrorMessage = "Location cannot exceed 100 characters")]
    public string Location { get; set; } = string.Empty;

    [Required(ErrorMessage = "Package is required")]
    [Range(0, 10000000, ErrorMessage = "Package must be between 0 and 10,000,000")]
    public decimal Package { get; set; }

    [Required(ErrorMessage = "Minimum CGPA is required")]
    [Range(0.0, 10.0, ErrorMessage = "CGPA must be between 0.0 and 10.0")]
    public double MinCGPA { get; set; }

    [Required(ErrorMessage = "At least one allowed branch is required")]
    [MinLength(1, ErrorMessage = "At least one branch must be specified")]
    public List<string> AllowedBranches { get; set; } = new();

    public int? GraduationYear { get; set; }

    [Required(ErrorMessage = "Deadline is required")]
    public DateTime Deadline { get; set; }
}
