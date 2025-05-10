// models/HourlyNeed.js
const mongoose = require("mongoose");

const hourlyNeedSchema = new mongoose.Schema({
  date: {
    type: String, // e.g. "2025-11-07"
    required: true,
  },
  hour: {
    type: String, // e.g. "13:00"
    required: true,
  },
  role: {
    type: String, // Just the role name for now
    required: true,
  },
  volunteersNeeded: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("HourlyNeed", hourlyNeedSchema);
