using CareerBridge.Domain.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CareerBridge.Domain.Entities;

public class RefreshToken : BaseEntity
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId    { get; set; } = string.Empty;
    public string Token     { get; set; } = string.Empty;
    public DateTime Expires { get; set; }
    public bool IsRevoked   { get; set; } = false;
}
