const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  date: {
    type: Date, 
    required: true,
  },
  startTime: {
    type: String, 
    required: true,
  },
  endTime: {
    type: String, 
    required: true,
  },
  role: {
    type: String, 
    required: true,
  },
  taskDescription: {
    type: String, 
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
      ref: "User" 
    }
  ],
  notes: {
    type: String 
  },
  reminderSent: {
    type: Boolean,
    default: false 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Shift", shiftSchema);