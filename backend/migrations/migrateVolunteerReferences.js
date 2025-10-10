// migrations/migrateVolunteerReferences.js
// Run this once to convert fusionAuthId strings to ObjectId references

const mongoose = require('mongoose');
const FlexibleShift = require('../models/FlexibleShift');
const User = require('../models/User');

async function migrateVolunteerReferences() {
  try {
    console.log('Starting migration: converting fusionAuthId strings to ObjectId references...');

    // Get all shifts
    const shifts = await FlexibleShift.find({});
    console.log(`Found ${shifts.length} shifts to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const shift of shifts) {
      try {
        // Skip if already using ObjectIds
        if (shift.volunteersRegistered.length === 0) {
          console.log(`Shift ${shift._id}: No volunteers, skipping`);
          continue;
        }

        // Check if first entry is already an ObjectId
        const firstEntry = shift.volunteersRegistered[0];
        if (mongoose.Types.ObjectId.isValid(firstEntry) && String(firstEntry).length === 24) {
          console.log(`Shift ${shift._id}: Already using ObjectIds, skipping`);
          continue;
        }

        // Convert fusionAuthIds to ObjectIds
        const fusionAuthIds = shift.volunteersRegistered;
        const objectIds = [];

        for (const fusionAuthId of fusionAuthIds) {
          const user = await User.findOne({ fusionAuthId: fusionAuthId });
          if (user) {
            objectIds.push(user._id);
            console.log(`  Mapped ${fusionAuthId} -> ${user._id} (${user.preferredName || user.email})`);
          } else {
            console.warn(`  WARNING: No user found for fusionAuthId: ${fusionAuthId}`);
          }
        }

        // Update the shift with ObjectIds
        shift.volunteersRegistered = objectIds;
        await shift.save();
        
        migratedCount++;
        console.log(`✓ Migrated shift ${shift._id} (${shift.role} on ${shift.date})`);

      } catch (err) {
        errorCount++;
        console.error(`✗ Error migrating shift ${shift._id}:`, err.message);
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Successfully migrated: ${migratedCount} shifts`);
    console.log(`Errors: ${errorCount} shifts`);
    console.log(`Skipped: ${shifts.length - migratedCount - errorCount} shifts`);

  } catch (err) {
    console.error('Migration failed:', err);
  }
}

// Run if called directly
if (require.main === module) {
  // Load your database connection
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return migrateVolunteerReferences();
    })
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration script error:', err);
      process.exit(1);
    });
}

module.exports = migrateVolunteerReferences;