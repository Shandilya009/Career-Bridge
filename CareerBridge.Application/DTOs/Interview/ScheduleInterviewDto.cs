namespace CareerBridge.Application.DTOs.Interview;

public class ScheduleInterviewDto
{
    public string   ApplicationId { get; set; } = string.Empty;
    public string   JobId         { get; set; } = string.Empty;
    public string   StudentId     { get; set; } = string.Empty;
    public DateTime ScheduledAt   { get; set; }
    public string   Location      { get; set; } = string.Empty;
    public string   Mode          { get; set; } = "Online";
}
