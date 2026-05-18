using CareerBridge.Domain.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CareerBridge.Domain.Entities;

public class Interview : BaseEntity
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string ApplicationId { get; set; } = string.Empty;
    [BsonRepresentation(BsonType.ObjectId)]
    public string JobId         { get; set; } = string.Empty;
    [BsonRepresentation(BsonType.ObjectId)]
    public string StudentId     { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public string   Location    { get; set; } = string.Empty;
    public string   Mode        { get; set; } = "Online";
    public string   Status      { get; set; } = "Scheduled";
}
