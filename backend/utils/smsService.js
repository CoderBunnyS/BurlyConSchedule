// utils/smsService.js
const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendShiftReminder(phoneNumber, shiftDetails) {
    try {
      // Format phone number (ensure it has country code)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Create reminder message
      const message = this.createReminderMessage(shiftDetails);
      
      console.log(`Sending SMS to ${formattedPhone}: ${message}`);

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone
      });

      console.log(`SMS sent successfully. SID: ${result.sid}`);
      return {
        success: true,
        messageSid: result.sid,
        to: formattedPhone
      };
      
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error.message,
        to: phoneNumber
      };
    }
  }

  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Add +1 if it's a 10-digit US number
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // Add + if not present and it's 11+ digits
    if (digits.length >= 11 && !phone.startsWith('+')) {
      return `+${digits}`;
    }
    
    return phone;
  }

  createReminderMessage(shiftDetails) {
    const { role, startTime, endTime, location, volunteerName } = shiftDetails;
    
    // Format time for display (assumes 24hr format like "14:00")
    const formatTime = (timeStr) => {
      const [hour, min] = timeStr.split(':');
      const h = parseInt(hour);
      const suffix = h >= 12 ? 'PM' : 'AM';
      const displayHour = ((h + 11) % 12) + 1;
      return `${displayHour}:${min} ${suffix}`;
    };

    const startTimeFormatted = formatTime(startTime);
    const locationText = location ? ` at ${location}` : '';
    
    return `🎭 BurlyCon Reminder: Your ${role} shift starts in 1 hour (${startTimeFormatted})${locationText}. Thanks for volunteering! Reply STOP to opt out.`;
  }

  async sendTestMessage(phoneNumber, message = "Test message from BurlyCon Volunteer System!") {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone
      });

      return {
        success: true,
        messageSid: result.sid,
        to: formattedPhone
      };
      
    } catch (error) {
      console.error('Test SMS failed:', error);
      return {
        success: false,
        error: error.message,
        to: phoneNumber
      };
    }
  }
}

module.exports = new SMSService();