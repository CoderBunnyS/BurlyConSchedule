const mongoose = require("mongoose");

const hourlyNeedSchema = new mongoose.Schema({
  date: {
    type: String, 
    required: true,
  },
  hour: {
    type: String, 
    required: true,
  },
  role: {
    type: String, 
    required: true,
  },
  volunteersNeeded: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("HourlyNeed", hourlyNeedSchema);
