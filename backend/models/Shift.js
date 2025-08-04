const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  date: {
    type: Date, // ISO date only: "2025-11-07"
    required: true,
  },
  startTime: {
    type: String, // Military time format: "0700"
    required: true,
  },
  endTime: {
    type: String, // Military time format: "1100"
    required: true,
  },
  role: {
    type: String, // e.g., "Hospitality Suite"
    required: true,
  },
  taskDescription: {
    type: String, // e.g., "Stock snacks and welcome guests"
    required: true,
  },
  volunteersNeeded: {
    type: Number,
    required: true,
    min: 1,
  },
  volunteersRegistered: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" // placeholder for FusionAuth integration
    }
  ],
  notes: {
    type: String // optional admin notes
  },
  reminderSent: {
    type: Boolean,
    default: false // Track if SMS reminder has been sent
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Shift", shiftSchema);