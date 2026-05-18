/**
 * CareerBridge - Create Admin User Script
 * 
 * Usage:
 *   node scripts/create-admin.js
 *
 * Connects to your MongoDB Atlas cluster and inserts an Admin user
 * with a BCrypt-hashed password, matching the exact schema the .NET API expects.
 *
 * Dependencies: npm install bcryptjs mongodb
 */

const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

// ─── Config ──────────────────────────────────────────────────────────────────
// Pull from your .env or hardcode here temporarily
const CONNECTION_STRING =
  process.env.MONGODB_CONNECTION_STRING ||
  "mongodb+srv://sshandilya2304_db_user:Z5eXjlQ4tebpWOnt@cluster0.no0vi6i.mongodb.net/career-bridge?retryWrites=true&w=majority&appName=Cluster0";

const DATABASE_NAME =
  process.env.MONGODB_DATABASE_NAME || "career-bridge";

// ─── Admin credentials (change these before running!) ────────────────────────
const ADMIN_EMAIL    = "admin@careerbridge.com";
const ADMIN_PASSWORD = "Admin@123";   // Change to something strong!

// ─── Role mapping (mirrors the C# enum: Student=0, Recruiter=1, Admin=2) ─────
const ROLE_ADMIN = 2;

async function createAdmin() {
  console.log("🔗 Connecting to MongoDB Atlas...");
  const client = new MongoClient(CONNECTION_STRING);

  try {
    await client.connect();
    console.log("✅ Connected!");

    const db = client.db(DATABASE_NAME);
    const users = db.collection("Users");

    // Check if admin already exists
    const existing = await users.findOne({ Email: ADMIN_EMAIL });
    if (existing) {
      console.log(`⚠️  Admin user "${ADMIN_EMAIL}" already exists. Skipping.`);
      return;
    }

    // Hash the password (BCrypt, cost factor 11 — same default as BCrypt.Net)
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 11);

    // Build the document exactly as the .NET domain model expects
    const adminUser = {
      _id:             new ObjectId().toString(),   // string Id (BaseEntity uses string)
      Email:           ADMIN_EMAIL,
      PasswordHash:    passwordHash,
      Role:            ROLE_ADMIN,
      IsActive:        true,
      IsEmailVerified: true,
      CreatedAt:       new Date(),
      UpdatedAt:       new Date(),
    };

    await users.insertOne(adminUser);

    console.log("\n🎉 Admin user created successfully!");
    console.log("─────────────────────────────────");
    console.log(`  Email   : ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`  Role    : Admin`);
    console.log(`  Database: ${DATABASE_NAME}`);
    console.log("─────────────────────────────────");
    console.log("You can now log in at your deployed frontend.");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createAdmin();
