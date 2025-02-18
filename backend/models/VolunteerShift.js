const mongoose = require("mongoose");

const volunteerShiftSchema = new mongoose.Schema({
  shiftName: { type: String, required: true },
  schedule: {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true }
  },
  maxVolunteers: { type: Number, required: true },
  volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("VolunteerShift", volunteerShiftSchema);
