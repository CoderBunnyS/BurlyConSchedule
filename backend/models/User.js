// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fusionAuthId: {
    type: String,
    required: true,
    unique: true
  },
  preferredName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  volunteerShifts: [
  {
    shift: { type: mongoose.Schema.Types.ObjectId, refPath: 'volunteerShifts.refModel' },
    refModel: { type: String, enum: ['HourlyNeed', 'FlexibleShift'], required: true },
    status: { type: String, enum: ['registered', 'no-show'], default: 'registered' }
  }
],
  totalHours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
