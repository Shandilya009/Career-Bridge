using CareerBridge.Domain.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CareerBridge.Domain.Entities;

public class Notification : BaseEntity
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;
    public string Title   { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool   IsRead  { get; set; } = false;
}
