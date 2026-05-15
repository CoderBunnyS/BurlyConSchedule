const mongoose = require("mongoose");

const hourlyNeedSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
    index: true,
  },
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
