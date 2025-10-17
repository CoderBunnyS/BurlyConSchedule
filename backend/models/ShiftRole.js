const mongoose = require("mongoose");

const shiftRoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      default: "",
    },
    responsibilities: {
      type: String,
      default: "",
    },
    physicalRequirements: {
      type: String,
      default: "",
    },
    pointOfContact: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "", 
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShiftRole", shiftRoleSchema);
