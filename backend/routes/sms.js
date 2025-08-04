// routes/sms.js
const express = require('express');
const router = express.Router();
const smsService = require('../utils/smsService');
const fusionAuthService = require('../utils/fusionAuthService');
const reminderJob = require('../jobs/reminderJob');

// Test SMS sending
router.post('/test', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const result = await smsService.sendTestMessage(
      phoneNumber, 
      message || 'Test message from BurlyCon Volunteer System! 🎭'
    );

    res.json(result);
    
  } catch (error) {
    console.error('SMS test route error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test FusionAuth user lookup
router.get('/user/:userId/phone', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await fusionAuthService.getUserPhone(userId);
    res.json(result);
    
  } catch (error) {
    console.error('User phone lookup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Manually trigger reminder check (for testing)
router.post('/reminders/trigger', async (req, res) => {
  try {
    console.log('🧪 Manual reminder trigger requested');
    
    // Run the reminder check
    await reminderJob.sendTestReminders();
    
    res.json({
      success: true,
      message: 'Reminder check completed. Check server logs for details.'
    });
    
  } catch (error) {
    console.error('Manual reminder trigger error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get reminder job status
router.get('/reminders/status', (req, res) => {
  res.json({
    success: true,
    status: 'SMS reminder job is running',
    message: 'Job runs every 15 minutes to check for shifts needing reminders'
  });
});

// Test shift reminder message format
router.post('/test-reminder-message', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Mock shift data for testing
    const mockShiftDetails = {
      role: 'Registration Desk',
      startTime: '14:00',
      endTime: '16:00',
      location: 'Main Lobby',
      volunteerName: 'Test Volunteer'
    };

    const result = await smsService.sendShiftReminder(phoneNumber, mockShiftDetails);
    res.json(result);
    
  } catch (error) {
    console.error('Test reminder message error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;