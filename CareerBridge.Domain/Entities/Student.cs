using CareerBridge.Domain.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CareerBridge.Domain.Entities;

public class Student : BaseEntity
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public double CGPA { get; set; }
    public int GraduationYear { get; set; }
    public List<string> Skills { get; set; } = new();
    public string? ResumeUrl { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    
    // CGPA Verification
    public string? CGPAProofUrl { get; set; }
    public bool IsCGPAVerified { get; set; } = false;
    public DateTime? CGPAVerifiedAt { get; set; }
    public string? CGPAVerifiedBy { get; set; } // Admin user ID who verified
}
