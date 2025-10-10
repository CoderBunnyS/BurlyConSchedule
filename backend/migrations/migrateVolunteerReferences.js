// migrations/migrateVolunteerReferences.js
// Rebuild volunteersRegistered arrays from User.volunteerShifts data

const mongoose = require('mongoose');
const FlexibleShift = require('../models/FlexibleShift');
const User = require('../models/User');

async function migrateVolunteerReferences() {
  try {
    console.log('Starting migration: rebuilding shift registrations from user data...');

    // First, clear all volunteersRegistered arrays
    await FlexibleShift.updateMany({}, { $set: { volunteersRegistered: [] } });
    console.log('Cleared all existing volunteersRegistered arrays');

    // Get all users with shifts
    const users = await User.find({ 'volunteerShifts.0': { $exists: true } });
    console.log(`Found ${users.length} users with shifts`);

    let updatedShifts = 0;
    let errorCount = 0;

    // Also ensure all shifts have the volunteersRegistered array
    await FlexibleShift.updateMany(
      { volunteersRegistered: { $exists: false } },
      { $set: { volunteersRegistered: [] } }
    );
    console.log('Ensured all shifts have volunteersRegistered array');

    for (const user of users) {
      console.log(`\nProcessing user: ${user.preferredName || user.email}`);
      
      for (const userShift of user.volunteerShifts) {
        try {
          // Only process FlexibleShift references
          if (userShift.refModel !== 'FlexibleShift') {
            continue;
          }

          const shiftId = userShift.shift;
          
          // Add this user to the shift's volunteersRegistered array
          const result = await FlexibleShift.findByIdAndUpdate(
            shiftId,
            { $addToSet: { volunteersRegistered: user._id } }, // addToSet prevents duplicates
            { new: true }
          );

          if (result) {
            console.log(`  ✓ Added user to shift ${shiftId}`);
            updatedShifts++;
          } else {
            console.warn(`  ⚠ Shift ${shiftId} not found - user has orphaned reference`);
          }

        } catch (err) {
          errorCount++;
          console.error(`  ✗ Error processing shift ${userShift.shift}:`, err.message);
        }
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Successfully updated: ${updatedShifts} shift registrations`);
    console.log(`Errors: ${errorCount}`);

    // Verify the results
    const shiftsWithVolunteers = await FlexibleShift.find({
      volunteersRegistered: { $ne: [] }
    }).populate('volunteersRegistered', 'preferredName email');

    console.log(`\n=== Verification ===`);
    console.log(`Shifts with volunteers: ${shiftsWithVolunteers.length}`);
    
    shiftsWithVolunteers.slice(0, 5).forEach(shift => {
      console.log(`\nShift: ${shift.role} on ${shift.date} at ${shift.startTime}`);
      console.log(`Volunteers: ${shift.volunteersRegistered.map(v => v.preferredName || v.email).join(', ')}`);
    });

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
      console.log('\nMigration script completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration script error:', err);
      process.exit(1);
    });
}

module.exports = migrateVolunteerReferences;