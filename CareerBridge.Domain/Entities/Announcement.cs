using CareerBridge.Domain.Common;

namespace CareerBridge.Domain.Entities;

public class Announcement : BaseEntity
{
    public string Title   { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string PostedBy { get; set; } = string.Empty;
}
