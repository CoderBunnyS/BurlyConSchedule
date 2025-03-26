// models/ShiftRole.js
const mongoose = require("mongoose");

const shiftRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  requirements: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("ShiftRole", shiftRoleSchema);
