using Bogus;
using CareerBridge.Application.Interfaces;
using CareerBridge.Domain.Entities;
using CareerBridge.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace CareerBridge.Infrastructure.Seeding;

public class DatabaseSeeder
{
    private readonly IUserRepository _users;
    private readonly IStudentRepository _students;
    private readonly IRecruiterRepository _recruiters;
    private readonly IJobRepository _jobs;
    private readonly IApplicationRepository _applications;
    private readonly IInterviewRepository _interviews;
    private readonly INotificationRepository _notifications;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(
        IUserRepository users,
        IStudentRepository students,
        IRecruiterRepository recruiters,
        IJobRepository jobs,
        IApplicationRepository applications,
        IInterviewRepository interviews,
        INotificationRepository notifications,
        ILogger<DatabaseSeeder> logger)
    {
        _users = users;
        _students = students;
        _recruiters = recruiters;
        _jobs = jobs;
        _applications = applications;
        _interviews = interviews;
        _notifications = notifications;
        _logger = logger;
    }

    public async Task SeedAsync(bool clearExisting = false)
    {
        _logger.LogInformation("Starting database seeding...");
        var startTime = DateTime.UtcNow;

        if (clearExisting)
        {
            _logger.LogInformation("Clearing existing data...");
            // Note: Implement clear methods in repositories if needed
        }

        // Seed Users and Students
        var (studentUsers, students) = await SeedStudentsAsync(75);
        _logger.LogInformation("Created {Count} students", students.Count);

        // Seed Users and Recruiters
        var (recruiterUsers, recruiters) = await SeedRecruitersAsync(25);
        _logger.LogInformation("Created {Count} recruiters", recruiters.Count);

        // Seed Jobs
        var jobs = await SeedJobsAsync(recruiters, 120);
        _logger.LogInformation("Created {Count} jobs", jobs.Count);

        // Seed Applications
        var applications = await SeedApplicationsAsync(students, jobs, 300);
        _logger.LogInformation("Created {Count} applications", applications.Count);

        // Seed Interviews
        var interviews = await SeedInterviewsAsync(applications, 80);
        _logger.LogInformation("Created {Count} interviews", interviews.Count);

        // Seed Notifications
        var allUserIds = studentUsers.Select(u => u.Id).Concat(recruiterUsers.Select(u => u.Id)).ToList();
        var notifications = await SeedNotificationsAsync(allUserIds, 200);
        _logger.LogInformation("Created {Count} notifications", notifications.Count);

        var duration = DateTime.UtcNow - startTime;
        _logger.LogInformation("Database seeding completed in {Duration}ms", duration.TotalMilliseconds);
    }

    private async Task<(List<User>, List<Student>)> SeedStudentsAsync(int count)
    {
        var departments = new[] { "Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical" };
        var skillSets = new[]
        {
            new[] { "C#", ".NET", "ASP.NET Core", "SQL Server", "Azure" },
            new[] { "Java", "Spring Boot", "Hibernate", "MySQL", "AWS" },
            new[] { "Python", "Django", "Flask", "PostgreSQL", "Docker" },
            new[] { "JavaScript", "React", "Node.js", "MongoDB", "Express" },
            new[] { "TypeScript", "Angular", "NestJS", "GraphQL", "Redis" },
            new[] { "Go", "Kubernetes", "Microservices", "gRPC", "Kafka" }
        };

        var userFaker = new Faker<User>()
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.PasswordHash, f => BCrypt.Net.BCrypt.HashPassword("Password123!"))
            .RuleFor(u => u.Role, f => Role.Student)
            .RuleFor(u => u.IsActive, f => true)
            .RuleFor(u => u.IsEmailVerified, f => true)
            .RuleFor(u => u.CreatedAt, f => f.Date.Between(DateTime.UtcNow.AddYears(-2), DateTime.UtcNow));

        var users = userFaker.Generate(count);
        foreach (var user in users)
        {
            await _users.CreateAsync(user);
        }

        var studentFaker = new Faker<Student>()
            .RuleFor(s => s.FirstName, f => f.Name.FirstName())
            .RuleFor(s => s.LastName, f => f.Name.LastName())
            .RuleFor(s => s.EnrollmentNumber, f => $"EN{f.Random.Number(100000, 999999)}")
            .RuleFor(s => s.Department, f => f.PickRandom(departments))
            .RuleFor(s => s.CGPA, f => Math.Round(f.Random.Double(2.5, 4.0), 2))
            .RuleFor(s => s.GraduationYear, f => f.PickRandom(2024, 2025, 2026, 2027))
            .RuleFor(s => s.Skills, f => f.PickRandom(skillSets).ToList())
            .RuleFor(s => s.CreatedAt, f => f.Date.Between(DateTime.UtcNow.AddYears(-2), DateTime.UtcNow));

        var students = new List<Student>();
        for (int i = 0; i < count; i++)
        {
            var student = studentFaker.Generate();
            student.UserId = users[i].Id;
            await _students.CreateAsync(student);
            students.Add(student);
        }

        return (users, students);
    }

    private async Task<(List<User>, List<Recruiter>)> SeedRecruitersAsync(int count)
    {
        var industries = new[] { "Technology", "Finance", "Healthcare", "Manufacturing", "Consulting", "E-commerce", "Telecommunications" };
        var companies = new[]
        {
            "TechCorp Solutions", "Global Finance Inc", "HealthFirst Systems", "Manufacturing Pro",
            "Consulting Experts", "E-Shop Worldwide", "Telecom Giants", "Software Innovations",
            "Data Analytics Co", "Cloud Services Ltd", "AI Research Labs", "Cyber Security Firm",
            "Mobile Apps Inc", "Gaming Studios", "EdTech Solutions", "FinTech Ventures",
            "BioTech Industries", "Green Energy Corp", "Logistics Masters", "Retail Chain Co",
            "Media Productions", "Travel Tech", "Food Delivery Co", "Real Estate Tech", "Insurance Pro"
        };

        var userFaker = new Faker<User>()
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.PasswordHash, f => BCrypt.Net.BCrypt.HashPassword("Password123!"))
            .RuleFor(u => u.Role, f => Role.Recruiter)
            .RuleFor(u => u.IsActive, f => true)
            .RuleFor(u => u.IsEmailVerified, f => true)
            .RuleFor(u => u.CreatedAt, f => f.Date.Between(DateTime.UtcNow.AddYears(-1), DateTime.UtcNow));

        var users = userFaker.Generate(count);
        foreach (var user in users)
        {
            await _users.CreateAsync(user);
        }

        var recruiterFaker = new Faker<Recruiter>()
            .RuleFor(r => r.CompanyName, f => f.PickRandom(companies))
            .RuleFor(r => r.Industry, f => f.PickRandom(industries))
            .RuleFor(r => r.ContactPerson, f => f.Name.FullName())
            .RuleFor(r => r.IsApproved, f => f.Random.Bool(0.9f)) // 90% approved
            .RuleFor(r => r.CreatedAt, f => f.Date.Between(DateTime.UtcNow.AddYears(-1), DateTime.UtcNow));

        var recruiters = new List<Recruiter>();
        for (int i = 0; i < count; i++)
        {
            var recruiter = recruiterFaker.Generate();
            recruiter.UserId = users[i].Id;
            await _recruiters.CreateAsync(recruiter);
            recruiters.Add(recruiter);
        }

        return (users, recruiters);
    }

    private async Task<List<Job>> SeedJobsAsync(List<Recruiter> recruiters, int count)
    {
        var jobTitles = new[]
        {
            "Software Engineer", "Senior Software Engineer", "Full Stack Developer", "Backend Developer",
            "Frontend Developer", "DevOps Engineer", "Data Scientist", "Machine Learning Engineer",
            "Product Manager", "Business Analyst", "QA Engineer", "System Administrator",
            "Cloud Architect", "Security Analyst", "Mobile Developer", "UI/UX Designer",
            "Database Administrator", "Network Engineer", "Technical Lead", "Scrum Master"
        };

        var jobTypes = new[] { "Full-time", "Internship", "Contract" };
        var locations = new[] { "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai", "Remote", "Noida", "Gurgaon", "Kolkata" };
        var departments = new[] { "Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical" };

        var approvedRecruiters = recruiters.Where(r => r.IsApproved).ToList();

        var jobFaker = new Faker<Job>()
            .RuleFor(j => j.RecruiterId, f => f.PickRandom(approvedRecruiters).Id)
            .RuleFor(j => j.Title, f => f.PickRandom(jobTitles))
            .RuleFor(j => j.Description, f => f.Lorem.Paragraphs(2, 4))
            .RuleFor(j => j.JobType, f => f.PickRandom(jobTypes))
            .RuleFor(j => j.Location, f => f.PickRandom(locations))
            .RuleFor(j => j.Package, f => f.Random.Decimal(40000, 150000))
            .RuleFor(j => j.Deadline, f => f.Date.Between(DateTime.UtcNow.AddDays(7), DateTime.UtcNow.AddDays(90)))
            .RuleFor(j => j.IsActive, f => f.Random.Bool(0.85f)) // 85% active
            .RuleFor(j => j.EligibilityCriteria, f => new EligibilityCriteria
            {
                MinCGPA = Math.Round(f.Random.Double(2.5, 3.5), 1),
                AllowedBranches = f.PickRandom(departments, f.Random.Number(1, 4)).ToList(),
                GraduationYear = f.PickRandom(2024, 2025, 2026, 2027)
            })
            .RuleFor(j => j.CreatedAt, f => f.Date.Between(DateTime.UtcNow.AddMonths(-6), DateTime.UtcNow));

        var jobs = jobFaker.Generate(count);
        foreach (var job in jobs)
        {
            await _jobs.CreateAsync(job);
        }

        return jobs;
    }

    private async Task<List<JobApplication>> SeedApplicationsAsync(List<Student> students, List<Job> jobs, int count)
    {
        var activeJobs = jobs.Where(j => j.IsActive).ToList();
        var applications = new List<JobApplication>();
        var random = new Random();

        // Each student applies to 3-5 jobs
        foreach (var student in students.Take(count / 4))
        {
            var numApplications = random.Next(3, 6);
            var selectedJobs = activeJobs.OrderBy(x => random.Next()).Take(numApplications);

            foreach (var job in selectedJobs)
            {
                var application = new JobApplication
                {
                    JobId = job.Id,
                    StudentId = student.Id,
                    Status = GetRandomApplicationStatus(random),
                    AppliedAt = DateTime.UtcNow.AddDays(-random.Next(1, 60)),
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 60))
                };

                await _applications.CreateAsync(application);
                applications.Add(application);

                if (applications.Count >= count) break;
            }

            if (applications.Count >= count) break;
        }

        return applications;
    }

    private ApplicationStatus GetRandomApplicationStatus(Random random)
    {
        var value = random.Next(100);
        if (value < 40) return ApplicationStatus.Applied;
        if (value < 60) return ApplicationStatus.Shortlisted;
        if (value < 75) return ApplicationStatus.Interviewed;
        if (value < 85) return ApplicationStatus.Offered;
        if (value < 95) return ApplicationStatus.Rejected;
        return ApplicationStatus.Withdrawn;
    }

    private async Task<List<Interview>> SeedInterviewsAsync(List<JobApplication> applications, int count)
    {
        var shortlistedApps = applications
            .Where(a => a.Status == ApplicationStatus.Shortlisted || a.Status == ApplicationStatus.Interviewed)
            .Take(count)
            .ToList();

        var modes = new[] { "Online", "In-person", "Hybrid" };
        var statuses = new[] { "Scheduled", "Completed", "Cancelled" };
        var locations = new[] { "Zoom Meeting", "Google Meet", "Office - Conference Room A", "Office - Conference Room B", "Microsoft Teams" };

        var interviewFaker = new Faker<Interview>()
            .RuleFor(i => i.Mode, f => f.PickRandom(modes))
            .RuleFor(i => i.Status, f => f.PickRandom(statuses))
            .RuleFor(i => i.Location, f => f.PickRandom(locations))
            .RuleFor(i => i.ScheduledAt, f => f.Date.Between(DateTime.UtcNow.AddDays(-30), DateTime.UtcNow.AddDays(30)))
            .RuleFor(i => i.CreatedAt, f => f.Date.Between(DateTime.UtcNow.AddDays(-30), DateTime.UtcNow));

        var interviews = new List<Interview>();
        foreach (var app in shortlistedApps)
        {
            var interview = interviewFaker.Generate();
            interview.ApplicationId = app.Id;
            interview.JobId = app.JobId;
            interview.StudentId = app.StudentId;

            await _interviews.CreateAsync(interview);
            interviews.Add(interview);
        }

        return interviews;
    }

    private async Task<List<Notification>> SeedNotificationsAsync(List<string> userIds, int count)
    {
        var notificationTypes = new[]
        {
            ("Application Submitted", "Your application for {0} has been submitted successfully."),
            ("Application Shortlisted", "Congratulations! You have been shortlisted for {0}."),
            ("Interview Scheduled", "Your interview for {0} has been scheduled for {1}."),
            ("Application Rejected", "Unfortunately, your application for {0} was not successful."),
            ("Job Posted", "A new job matching your profile has been posted: {0}"),
            ("Profile Updated", "Your profile has been updated successfully."),
            ("New Message", "You have received a new message from {0}."),
            ("Deadline Reminder", "Reminder: Application deadline for {0} is approaching.")
        };

        var notificationFaker = new Faker<Notification>()
            .RuleFor(n => n.UserId, f => f.PickRandom(userIds))
            .RuleFor(n => n.IsRead, f => f.Random.Bool(0.4f)) // 40% read
            .RuleFor(n => n.CreatedAt, f => f.Date.Between(DateTime.UtcNow.AddDays(-60), DateTime.UtcNow));

        var notifications = new List<Notification>();
        for (int i = 0; i < count; i++)
        {
            var notification = notificationFaker.Generate();
            var (title, messageTemplate) = notificationTypes[i % notificationTypes.Length];
            notification.Title = title;
            notification.Message = string.Format(messageTemplate, 
                "Software Engineer Position", 
                DateTime.UtcNow.AddDays(5).ToString("MMM dd, yyyy"));

            await _notifications.CreateAsync(notification);
            notifications.Add(notification);
        }

        return notifications;
    }
}
