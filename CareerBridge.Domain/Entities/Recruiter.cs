using CareerBridge.Domain.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CareerBridge.Domain.Entities;

public class Recruiter : BaseEntity
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;

    public string CompanyName { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string? CompanyLogoUrl { get; set; }
    public string ContactPerson { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = false;
}
