/**
 * CareerBridge - Create MongoDB Collections Script
 * Creates all required collections (skips Users which already exists)
 *
 * Usage: node scripts/create-collections.js
 */

const { MongoClient } = require("mongodb");

const CONNECTION_STRING =
  process.env.MONGODB_CONNECTION_STRING ||
  "mongodb+srv://sshandilya2304_db_user:Z5eXjlQ4tebpWOnt@cluster0.no0vi6i.mongodb.net/career-bridge?retryWrites=true&w=majority&appName=Cluster0";

const DATABASE_NAME =
  process.env.MONGODB_DATABASE_NAME || "career-bridge";

// Collections to create (Users already exists — skipped)
const COLLECTIONS_TO_CREATE = [
  "Applications",
  "Interviews",
  "Jobs",
  "Notifications",
  "Recruiters",
  "Students",
  "RefreshTokens",
  "Announcements",
];

async function createCollections() {
  console.log("🔗 Connecting to MongoDB Atlas...");
  const client = new MongoClient(CONNECTION_STRING);

  try {
    await client.connect();
    console.log("✅ Connected to database:", DATABASE_NAME);
    console.log("");

    const db = client.db(DATABASE_NAME);

    // Get existing collections
    const existing = await db.listCollections().toArray();
    const existingNames = existing.map((c) => c.name);
    console.log("📂 Existing collections:", existingNames.join(", ") || "none");
    console.log("");

    for (const name of COLLECTIONS_TO_CREATE) {
      if (existingNames.includes(name)) {
        console.log(`⏭️  Skipping "${name}" — already exists`);
      } else {
        await db.createCollection(name);
        console.log(`✅ Created collection: "${name}"`);
      }
    }

    console.log("\n🎉 Done! All collections are ready.");
    console.log("─────────────────────────────────");

    const finalList = await db.listCollections().toArray();
    console.log("📁 Collections in database:");
    finalList.forEach((c) => console.log(`   • ${c.name}`));
    console.log("─────────────────────────────────");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createCollections();
