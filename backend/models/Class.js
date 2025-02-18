const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  instructor: { type: String, required: true },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
  requiredMaterials: { type: String },
  accessibilityOptions: { type: String },
  schedule: {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true }
  },
  capacity: { type: Number, required: true },
  enrolledParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  waitlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("Class", classSchema);
