const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fusionAuthUserId: { type: String, required: true, unique: true },
  preferredName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  enrolledClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  volunteerShifts: [{ type: mongoose.Schema.Types.ObjectId, ref: "VolunteerShift" }],
  attendance: {
    missedClasses: { type: Number, default: 0 },
    missedVolunteerShifts: { type: Number, default: 0 }
  },
  classReviews: [{
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String }
  }],
  notificationHistory: [{
    type: { type: String },
    message: { type: String },
    sentAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
