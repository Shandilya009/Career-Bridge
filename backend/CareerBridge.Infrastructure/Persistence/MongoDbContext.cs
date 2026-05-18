using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using CareerBridge.Domain.Entities;

namespace CareerBridge.Infrastructure.Persistence;

public class MongoDbContext
{
    private readonly IMongoDatabase _db;

    public MongoDbContext(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDbSettings:ConnectionString"]);
        _db = client.GetDatabase(config["MongoDbSettings:DatabaseName"]);
    }

    public IMongoCollection<User>           Users           => _db.GetCollection<User>("Users");
    public IMongoCollection<Student>        Students        => _db.GetCollection<Student>("Students");
    public IMongoCollection<Recruiter>      Recruiters      => _db.GetCollection<Recruiter>("Recruiters");
    public IMongoCollection<Job>            Jobs            => _db.GetCollection<Job>("Jobs");
    public IMongoCollection<JobApplication> JobApplications => _db.GetCollection<JobApplication>("Applications");
    public IMongoCollection<Interview>      Interviews      => _db.GetCollection<Interview>("Interviews");
    public IMongoCollection<Notification>   Notifications   => _db.GetCollection<Notification>("Notifications");
    public IMongoCollection<RefreshToken>   RefreshTokens   => _db.GetCollection<RefreshToken>("RefreshTokens");
    public IMongoCollection<Announcement>   Announcements   => _db.GetCollection<Announcement>("Announcements");
}
