/**
 * CareerBridge - Seed Dummy Data Script
 *
 * Connects to MongoDB Atlas and populates the database with realistic test data:
 * - Student Users and Student profiles
 * - Recruiter Users and Recruiter profiles
 * - Active and inactive Jobs
 * - Job Applications linking Students to Jobs
 * - Scheduled, completed, or cancelled Interviews
 * - Announcements
 * - Notifications
 *
 * Usage: node scripts/seed-dummy-data.js
 */

const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

const CONNECTION_STRING =
  process.env.MONGODB_CONNECTION_STRING ||
  "mongodb+srv://sshandilya2304_db_user:Z5eXjlQ4tebpWOnt@cluster0.no0vi6i.mongodb.net/career-bridge?retryWrites=true&w=majority&appName=Cluster0";

const DATABASE_NAME =
  process.env.MONGODB_DATABASE_NAME || "career-bridge";

// Role enum mirrors the C# Role: Student=0, Recruiter=1, Admin=2
const ROLE_STUDENT = 0;
const ROLE_RECRUITER = 1;

// ApplicationStatus enum mirrors the C# ApplicationStatus:
// Applied=0, Shortlisted=1, Interviewed=2, Offered=3, Rejected=4, Withdrawn=5
const STATUS_APPLIED = 0;
const STATUS_SHORTLISTED = 1;
const STATUS_INTERVIEWED = 2;
const STATUS_OFFERED = 3;
const STATUS_REJECTED = 4;
const STATUS_WITHDRAWN = 5;

async function seedData() {
  console.log("🔗 Connecting to MongoDB Atlas...");
  const client = new MongoClient(CONNECTION_STRING);

  try {
    await client.connect();
    console.log("✅ Connected to database:", DATABASE_NAME);
    const db = client.db(DATABASE_NAME);

    // Collections
    const usersCol = db.collection("Users");
    const studentsCol = db.collection("Students");
    const recruitersCol = db.collection("Recruiters");
    const jobsCol = db.collection("Jobs");
    const appsCol = db.collection("Applications");
    const interviewsCol = db.collection("Interviews");
    const announcementsCol = db.collection("Announcements");
    const notificationsCol = db.collection("Notifications");

    console.log("🧹 Cleaning up old dummy data (preserving Admin users)...");
    
    // We only delete users who are NOT Admin (Role != 2) to preserve our admin
    const deleteUsersResult = await usersCol.deleteMany({ Role: { $ne: 2 } });
    console.log(`🗑️ Deleted ${deleteUsersResult.deletedCount} non-admin users`);

    // Clear all other profile and transactional collections completely
    await studentsCol.deleteMany({});
    await recruitersCol.deleteMany({});
    await jobsCol.deleteMany({});
    await appsCol.deleteMany({});
    await interviewsCol.deleteMany({});
    await announcementsCol.deleteMany({});
    await notificationsCol.deleteMany({});
    console.log("🗑️ Cleared existing Students, Recruiters, Jobs, Applications, Interviews, Announcements, and Notifications.");

    const passwordHash = await bcrypt.hash("Password123!", 11);

    // 1. Create Student Users & Profiles
    console.log("\n👥 Seeding Students...");
    const studentData = [
      { firstName: "Rahul", lastName: "Sharma", dept: "Computer Science", cgpa: 9.2, gradYear: 2026, skills: ["C#", ".NET Core", "React", "MongoDB"] },
      { firstName: "Priya", lastName: "Patel", dept: "Information Technology", cgpa: 8.8, gradYear: 2026, skills: ["Java", "Spring Boot", "MySQL", "AWS"] },
      { firstName: "Amit", lastName: "Singh", dept: "Computer Science", cgpa: 7.5, gradYear: 2026, skills: ["Python", "Django", "PostgreSQL", "React"] },
      { firstName: "Sneha", lastName: "Reddy", dept: "Electronics", cgpa: 8.5, gradYear: 2026, skills: ["Embedded Systems", "C++", "Python", "MATLAB"] },
      { firstName: "Vikram", lastName: "Aditya", dept: "Mechanical", cgpa: 8.0, gradYear: 2026, skills: ["AutoCAD", "SolidWorks", "Python"] }
    ];

    const seededStudents = [];
    for (const s of studentData) {
      const userId = new ObjectId().toString();
      const studentId = new ObjectId().toString();
      const email = `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@careerbridge.edu`;

      // Insert User
      await usersCol.insertOne({
        _id: userId,
        Email: email,
        PasswordHash: passwordHash,
        Role: ROLE_STUDENT,
        IsActive: true,
        IsEmailVerified: true,
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      });

      // Insert Student profile
      const studentDoc = {
        _id: studentId,
        UserId: userId,
        FirstName: s.firstName,
        LastName: s.lastName,
        EnrollmentNumber: `EN2022${Math.floor(1000 + Math.random() * 9000)}`,
        Department: s.dept,
        CGPA: s.cgpa,
        GraduationYear: s.gradYear,
        Skills: s.skills,
        ResumeUrl: `https://careerbridge-uploads.s3.amazonaws.com/resumes/${studentId}_cv.pdf`,
        ProfilePhotoUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${s.firstName}`,
        IsCGPAVerified: true,
        CGPAVerifiedAt: new Date(),
        CGPAVerifiedBy: "admin-system",
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      };

      await studentsCol.insertOne(studentDoc);
      seededStudents.push(studentDoc);
    }
    console.log(`✅ Created ${seededStudents.length} Students and their associated Login Accounts.`);

    // 2. Create Recruiter Users & Profiles
    console.log("\n🏢 Seeding Recruiters...");
    const recruiterData = [
      { company: "TechCorp Solutions", contact: "John Doe", industry: "Technology", logo: "https://logo.clearbit.com/microsoft.com" },
      { company: "FinVantage Global", contact: "Sarah Jenkins", industry: "Finance", logo: "https://logo.clearbit.com/goldmansachs.com" },
      { company: "Apex HealthTech", contact: "Dr. Alan Grant", industry: "Healthcare", logo: "https://logo.clearbit.com/pfizer.com" }
    ];

    const seededRecruiters = [];
    for (const r of recruiterData) {
      const userId = new ObjectId().toString();
      const recruiterId = new ObjectId().toString();
      const email = `recruiter@${r.company.toLowerCase().replace(/[^a-z]/g, "")}.com`;

      // Insert User
      await usersCol.insertOne({
        _id: userId,
        Email: email,
        PasswordHash: passwordHash,
        Role: ROLE_RECRUITER,
        IsActive: true,
        IsEmailVerified: true,
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      });

      // Insert Recruiter profile
      const recruiterDoc = {
        _id: recruiterId,
        UserId: userId,
        CompanyName: r.company,
        Industry: r.industry,
        CompanyLogoUrl: r.logo,
        ContactPerson: r.contact,
        IsApproved: true,
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      };

      await recruitersCol.insertOne(recruiterDoc);
      seededRecruiters.push(recruiterDoc);
    }
    console.log(`✅ Created ${seededRecruiters.length} Recruiters and their associated Login Accounts.`);

    // 3. Create Jobs
    console.log("\n💼 Seeding Jobs...");
    const jobData = [
      {
        recruiter: seededRecruiters[0], // TechCorp
        title: "Graduate Software Engineer",
        desc: "We are looking for a passionate Graduate Software Engineer to join our core .NET & React development team. You will work on scalable web applications and cloud services.",
        type: "Full-time",
        loc: "Bangalore (Hybrid)",
        pack: 1200000,
        minCgpa: 8.0,
        branches: ["Computer Science", "Information Technology"],
        gradYear: 2026
      },
      {
        recruiter: seededRecruiters[0], // TechCorp
        title: "Frontend Developer Intern",
        desc: "Exciting opportunity for a React / TypeScript enthusiast to build beautiful dashboards. Learn from senior developers and participate in agile sprints.",
        type: "Internship",
        loc: "Remote",
        pack: 450000,
        minCgpa: 7.5,
        branches: ["Computer Science", "Information Technology", "Electronics"],
        gradYear: 2026
      },
      {
        recruiter: seededRecruiters[1], // FinVantage
        title: "Associate Business Analyst",
        desc: "Analyze business metrics, draft product requirements, and act as a bridge between financial teams and software developers. SQL knowledge is a huge plus.",
        type: "Full-time",
        loc: "Mumbai",
        pack: 1400000,
        minCgpa: 8.0,
        branches: ["Computer Science", "Information Technology", "Electronics", "Mechanical"],
        gradYear: 2026
      },
      {
        recruiter: seededRecruiters[1], // FinVantage
        title: "Python Data Science Intern",
        desc: "Join our quant risk analytics team. Build predictive models, extract financial data, and visualize trends using Python, Pandas, and Jupyter.",
        type: "Internship",
        loc: "Mumbai",
        pack: 600000,
        minCgpa: 8.5,
        branches: ["Computer Science", "Information Technology"],
        gradYear: 2026
      },
      {
        recruiter: seededRecruiters[2], // Apex Health
        title: "Cloud Infrastructure Engineer",
        desc: "Deploy, manage, and scale microservices on AWS/Azure. Ensure high availability of our secure healthcare data storage endpoints.",
        type: "Full-time",
        loc: "Hyderabad",
        pack: 1050000,
        minCgpa: 7.5,
        branches: ["Computer Science", "Information Technology", "Electrical"],
        gradYear: 2026
      }
    ];

    const seededJobs = [];
    for (const j of jobData) {
      const jobId = new ObjectId().toString();
      const jobDoc = {
        _id: jobId,
        RecruiterId: j.recruiter._id,
        Title: j.title,
        Description: j.desc,
        JobType: j.type,
        Location: j.loc,
        Package: j.pack,
        EligibilityCriteria: {
          MinCGPA: j.minCgpa,
          AllowedBranches: j.branches,
          GraduationYear: j.gradYear
        },
        Deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        IsActive: true,
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      };

      await jobsCol.insertOne(jobDoc);
      seededJobs.push(jobDoc);
    }
    console.log(`✅ Created ${seededJobs.length} Job Openings.`);

    // 4. Create Job Applications
    console.log("\n📝 Seeding Applications...");
    // Let's create specific realistic applications
    const applicationsToSeed = [
      { student: seededStudents[0], job: seededJobs[0], status: STATUS_OFFERED }, // Rahul -> Software Engineer (Offered)
      { student: seededStudents[0], job: seededJobs[2], status: STATUS_APPLIED },  // Rahul -> Analyst (Applied)
      { student: seededStudents[1], job: seededJobs[0], status: STATUS_INTERVIEWED }, // Priya -> Software Engineer (Interviewed)
      { student: seededStudents[1], job: seededJobs[3], status: STATUS_SHORTLISTED }, // Priya -> Data Science (Shortlisted)
      { student: seededStudents[2], job: seededJobs[1], status: STATUS_REJECTED },  // Amit -> Frontend Intern (Rejected)
      { student: seededStudents[2], job: seededJobs[4], status: STATUS_APPLIED },   // Amit -> Cloud Eng (Applied)
      { student: seededStudents[3], job: seededJobs[1], status: STATUS_SHORTLISTED }, // Sneha -> Frontend Intern (Shortlisted)
      { student: seededStudents[4], job: seededJobs[2], status: STATUS_APPLIED }    // Vikram -> Analyst (Applied)
    ];

    const seededApps = [];
    for (const app of applicationsToSeed) {
      const appId = new ObjectId().toString();
      const appDoc = {
        _id: appId,
        JobId: app.job._id,
        StudentId: app.student._id,
        Status: app.status,
        AppliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        CreatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        UpdatedAt: new Date()
      };

      await appsCol.insertOne(appDoc);
      seededApps.push({ doc: appDoc, studentName: `${app.student.FirstName} ${app.student.LastName}`, jobTitle: app.job.Title, companyName: app.job.Description });
    }
    console.log(`✅ Created ${seededApps.length} Job Applications.`);

    // 5. Create Interviews for Shortlisted/Interviewed applications
    console.log("\n🗓️  Seeding Interviews...");
    const interviewsToSeed = [
      {
        app: seededApps[2], // Priya -> Software Engineer
        scheduledOffset: 2 * 24 * 60 * 60 * 1000, // 2 days in future
        location: "https://zoom.us/j/9876543210",
        mode: "Online",
        status: "Scheduled"
      },
      {
        app: seededApps[6], // Sneha -> Frontend Intern
        scheduledOffset: 4 * 24 * 60 * 60 * 1000, // 4 days in future
        location: "Office Conference Room Alpha",
        mode: "In-person",
        status: "Scheduled"
      }
    ];

    for (const intv of interviewsToSeed) {
      const intvId = new ObjectId().toString();
      await interviewsCol.insertOne({
        _id: intvId,
        ApplicationId: intv.app.doc._id,
        JobId: intv.app.doc.JobId,
        StudentId: intv.app.doc.StudentId,
        ScheduledAt: new Date(Date.now() + intv.scheduledOffset),
        Location: intv.location,
        Mode: intv.mode,
        Status: intv.status,
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      });
    }
    console.log(`✅ Created ${interviewsToSeed.length} scheduled Interviews.`);

    // 6. Create Announcements
    console.log("\n📣 Seeding Announcements...");
    const announcements = [
      { title: "Placement Drive - TechCorp Solutions", content: "TechCorp is visiting our campus next week for recruitment! Ensure your resumes are verified by the Admin department by Friday.", postedBy: "Placement Admin" },
      { title: "Resume Building workshop on Wednesday", content: "Join us this Wednesday at 4 PM in Seminar Hall 1 to learn how to write a premium CV. Special guest speakers from top companies.", postedBy: "Career Guidance Cell" },
      { title: "CGPA verification deadline extended", content: "Students graduating in 2026 can upload proof documents until next Monday to get their profiles verified.", postedBy: "Academic Cell" }
    ];

    for (const a of announcements) {
      await announcementsCol.insertOne({
        _id: new ObjectId().toString(),
        Title: a.title,
        Content: a.content,
        PostedBy: a.postedBy,
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      });
    }
    console.log(`✅ Created ${announcements.length} Announcements.`);

    // 7. Create Notifications
    console.log("\n🔔 Seeding Notifications...");
    // Let's notify Rahul about his offer
    const rahul = seededStudents[0];
    const priya = seededStudents[1];
    
    const notifications = [
      { userId: rahul.UserId, title: "Congratulations!", message: "You have been offered the role of Graduate Software Engineer at TechCorp Solutions!", isRead: false },
      { userId: priya.UserId, title: "Interview Scheduled", message: "Your round-1 technical interview for Graduate Software Engineer is scheduled on Zoom.", isRead: false },
      { userId: priya.UserId, title: "Shortlisted", message: "Your profile has been shortlisted for Python Data Science Intern by FinVantage Global.", isRead: true }
    ];

    for (const n of notifications) {
      await notificationsCol.insertOne({
        _id: new ObjectId().toString(),
        UserId: n.userId,
        Title: n.title,
        Message: n.message,
        IsRead: n.isRead,
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      });
    }
    console.log(`✅ Created ${notifications.length} notifications.`);

    console.log("\n🎉 Database fully seeded with rich, premium dummy data!");
    console.log("──────────────────────────────────────────────────");
    console.log("STUDENT LOGIN INFO (Password is always: Password123!):");
    seededStudents.forEach(s => {
      const email = `${s.FirstName.toLowerCase()}.${s.LastName.toLowerCase()}@careerbridge.edu`;
      console.log(`  • ${s.FirstName} ${s.LastName} (Student) -> ${email}`);
    });
    console.log("\nRECRUITER LOGIN INFO (Password is always: Password123!):");
    seededRecruiters.forEach(r => {
      const email = `recruiter@${r.CompanyName.toLowerCase().replace(/[^a-z]/g, "")}.com`;
      console.log(`  • ${r.CompanyName} (Recruiter) -> ${email}`);
    });
    console.log("──────────────────────────────────────────────────");

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedData();
