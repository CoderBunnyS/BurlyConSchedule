// jobs/reminderJob.js
const cron = require('node-cron');
const mongoose = require('mongoose');
const smsService = require('../utils/smsService');
const fusionAuthService = require('../utils/fusionAuthService');

// Import  shift model 
const Shift = require('../models/Shift'); h

class ReminderJob {
  constructor() {
    this.isRunning = false;
  }

  // Start the cron job
  start() {
    console.log('Starting SMS reminder job...');
    
    // Run every 15 minutes: */15 * * * *
    cron.schedule('*/15 * * * *', async () => {
      await this.checkAndSendReminders();
    });

    console.log('SMS reminder job scheduled - runs every 15 minutes');
  }

  async checkAndSendReminders() {
    if (this.isRunning) {
      console.log('Reminder job already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log(`Checking for shifts needing reminders at ${new Date().toISOString()}`);
    
    try {
      // Find shifts starting in approximately 1 hour (50-70 minutes from now)
      const shiftsNeedingReminders = await this.findShiftsNeedingReminders();
      
      if (shiftsNeedingReminders.length === 0) {
        console.log('No shifts need reminders right now');
        return;
      }

      console.log(`Found ${shiftsNeedingReminders.length} shifts needing reminders`);
      
      // Send reminders for each shift
      for (const shift of shiftsNeedingReminders) {
        await this.sendRemindersForShift(shift);
      }
      
    } catch (error) {
      console.error('Error in reminder job:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async findShiftsNeedingReminders() {
    try {
      const now = new Date();
      
      // Calculate time range: 50-70 minutes from now
      const reminderStart = new Date(now.getTime() + 50 * 60 * 1000); // 50 minutes
      const reminderEnd = new Date(now.getTime() + 70 * 60 * 1000);   // 70 minutes
      
      // Get the date 
      const today = now.toISOString().split('T')[0];
      
      // Convert times 
      const startTimeMin = this.formatTimeForComparison(reminderStart);
      const startTimeMax = this.formatTimeForComparison(reminderEnd);
      
      console.log(`Looking for shifts on ${today} between ${startTimeMin} and ${startTimeMax}`);
      
      const shifts = await Shift.find({
        date: today,
        startTime: {
          $gte: startTimeMin,
          $lte: startTimeMax
        },
        // Only shifts with volunteers
        volunteersRegistered: { $exists: true, $not: { $size: 0 } },
        // Don't send duplicate reminders 
        reminderSent: { $ne: true }
      });

      console.log(`Query found ${shifts.length} shifts needing reminders`);
      return shifts;
      
    } catch (error) {
      console.error('Error finding shifts:', error);
      return [];
    }
  }

  async sendRemindersForShift(shift) {
    try {
      console.log(`Processing reminders for shift: ${shift.role} at ${shift.startTime}`);
      
      const volunteerIds = shift.volunteersRegistered;
      if (!volunteerIds || volunteerIds.length === 0) {
        console.log('No volunteers registered for this shift');
        return;
      }

      // Get phone numbers from FusionAuth
      const phoneResults = await fusionAuthService.getUsersPhones(volunteerIds);
      
      if (!phoneResults.success) {
        console.error('Failed to get user phone numbers:', phoneResults.error);
        return;
      }

      console.log(`Phone lookup stats:`, phoneResults.stats);
      
      // Send SMS to each volunteer with a phone number
      const smsPromises = phoneResults.validUsers.map(async (userInfo) => {
        const shiftDetails = {
          role: shift.role,
          startTime: shift.startTime,
          endTime: shift.endTime,
          location: shift.location || 'TBD',
          volunteerName: userInfo.user.firstName
        };

        const result = await smsService.sendShiftReminder(userInfo.phone, shiftDetails);
        return {
          userId: userInfo.userId,
          phone: userInfo.phone,
          result
        };
      });

      const smsResults = await Promise.all(smsPromises);
      
      // Log results
      const successful = smsResults.filter(r => r.result.success);
      const failed = smsResults.filter(r => !r.result.success);
      
      console.log(`SMS Results: ${successful.length} sent, ${failed.length} failed`);
      
      if (failed.length > 0) {
        console.log('Failed SMS sends:', failed.map(f => ({ 
          phone: f.phone, 
          error: f.result.error 
        })));
      }

      // Mark shift as reminder sent to avoid duplicates
      await Shift.findByIdAndUpdate(shift._id, { reminderSent: true });
      
      console.log(`Completed reminders for ${shift.role} shift`);
      
    } catch (error) {
      console.error(`Error sending reminders for shift ${shift._id}:`, error);
    }
  }

  formatTimeForComparison(date) {
    return date.toTimeString().slice(0, 5); 
  }

  // Manual trigger for testing
  async sendTestReminders() {
    console.log('Running test reminder check...');
    await this.checkAndSendReminders();
  }

  // Stop the job 
  stop() {
    console.log('Stopping SMS reminder job...');
  }
}

module.exports = new ReminderJob();