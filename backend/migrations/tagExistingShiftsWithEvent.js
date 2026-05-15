const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const FlexibleShift = require("../models/FlexibleShift");
const HourlyNeed = require("../models/HourlyNeed");
const Event = require("../models/Event");

async function tagCollection(Model, modelName, eventId) {
  const untagged = await Model.find({ eventId: { $exists: false } });
  console.log(`${modelName}: found ${untagged.length} untagged records`);

  if (untagged.length === 0) return;

  const result = await Model.updateMany(
    { eventId: { $exists: false } },
    { $set: { eventId } }
  );
  console.log(`${modelName}: ✅ tagged ${result.modifiedCount} records`);
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const event2025 = await Event.findOne({ year: 2025 });
  if (!event2025) {
    console.error("❌ 2025 event not found. Create it first.");
    process.exit(1);
  }
  console.log(`Found 2025 event: ${event2025._id}`);

  await tagCollection(FlexibleShift, "FlexibleShift", event2025._id);
  await tagCollection(HourlyNeed, "HourlyNeed", event2025._id);

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});