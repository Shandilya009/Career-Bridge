using CareerBridge.Domain.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CareerBridge.Domain.Entities;

public class Job : BaseEntity
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string RecruiterId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string JobType { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal Package { get; set; }
    public EligibilityCriteria EligibilityCriteria { get; set; } = new();
    public DateTime Deadline { get; set; }
    public bool IsActive { get; set; } = true;
}

public class EligibilityCriteria
{
    public double MinCGPA { get; set; }
    public List<string> AllowedBranches { get; set; } = new();
    public int? GraduationYear { get; set; }
}
